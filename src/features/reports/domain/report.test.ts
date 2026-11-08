import { describe, expect, it } from "vitest";
import { authorizeTransition, createReportSchema, statuses } from "./report";

describe("ciclo de vida", () => {
  it("permite aprobación moderada y exige motivo", () => {
    expect(() =>
      authorizeTransition({
        from: "PENDING_MODERATION",
        to: "PUBLISHED",
        role: "MODERATOR",
        isAuthor: false,
        reason: "Contenido revisado",
      }),
    ).not.toThrow();
    expect(() =>
      authorizeTransition({
        from: "PENDING_MODERATION",
        to: "REJECTED",
        role: "MODERATOR",
        isAuthor: false,
        reason: "",
      }),
    ).toThrow("REASON_REQUIRED");
  });
  it.each(statuses)("impide que ciudadano verifique desde %s", (from) => {
    expect(() =>
      authorizeTransition({
        from,
        to: "SOLUTION_VERIFIED",
        role: "CITIZEN",
        isAuthor: true,
        reason: "Se observa reparado",
      }),
    ).toThrow();
  });
  it("solo permite al autor comunicar una solución", () => {
    const input = {
      from: "PUBLISHED",
      to: "SOLUTION_REPORTED",
      role: "CITIZEN",
      reason: "Se observa reparado",
    } as const;
    expect(() =>
      authorizeTransition({ ...input, isAuthor: true }),
    ).not.toThrow();
    expect(() => authorizeTransition({ ...input, isAuthor: false })).toThrow(
      "FORBIDDEN",
    );
  });
  it("rechazo es terminal", () => {
    expect(() =>
      authorizeTransition({
        from: "REJECTED",
        to: "PUBLISHED",
        role: "MODERATOR",
        isAuthor: false,
        reason: "Nueva evaluación",
      }),
    ).toThrow("INVALID_TRANSITION");
  });
});

describe("entrada no confiable", () => {
  const valid = {
    categoryId: "212d2fef-c5f0-43d0-8e15-721fc77d6651",
    title: "Título de prueba",
    description: "Descripción de prueba suficientemente larga.",
    latitude: 0,
    longitude: 0,
    locationConsent: true,
  };
  it("acepta coordenadas globales sin inventar límites municipales", () =>
    expect(createReportSchema.safeParse(valid).success).toBe(true));
  it.each([
    { latitude: 91 },
    { longitude: -181 },
    { latitude: NaN },
    { locationConsent: false },
    { authorId: "injected" },
    { status: "PUBLISHED" },
  ])("rechaza %j", (override) =>
    expect(
      createReportSchema.safeParse({ ...valid, ...override }).success,
    ).toBe(false),
  );
});
