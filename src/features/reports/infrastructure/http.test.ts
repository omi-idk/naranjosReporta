import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { AppError } from "../application/errors";
import { checkOrigin, endpoint, readJson } from "./http";

afterEach(() => vi.unstubAllEnvs());
describe("HTTP boundary", () => {
  it("rejects cross-site browser requests", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.test");
    expect(() =>
      checkOrigin(
        new Request("https://example.test/api/reports", {
          headers: { origin: "https://evil.test" },
        }),
      ),
    ).toThrow("Origen no permitido");
    expect(() =>
      checkOrigin(
        new Request("https://example.test/api/reports", {
          headers: { origin: "https://example.test" },
        }),
      ),
    ).not.toThrow();
  });
  it("limits actual stream bytes without relying on content-length", async () => {
    const request = new Request("http://localhost/api/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ description: "x".repeat(17000) }),
    });
    await expect(readJson(request)).rejects.toMatchObject({ status: 413 });
  });
  it("rejects malformed JSON and unsupported content", async () => {
    await expect(
      readJson(
        new Request("http://localhost", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{",
        }),
      ),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      readJson(new Request("http://localhost", { method: "POST", body: "{}" })),
    ).rejects.toMatchObject({ status: 415 });
  });
  it("never leaks unknown infrastructure errors", async () => {
    const response = await endpoint(async () => {
      throw new Error("postgresql://secret:password@private db query");
    });
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("password");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("serializes typed and validation errors", async () => {
    const forbidden = await endpoint(async () => {
      throw new AppError(403, "FORBIDDEN", "Sin permiso");
    });
    expect(forbidden.status).toBe(403);
    const validation = await endpoint(async () => {
      z.object({ title: z.string().min(10) }).parse({ title: "x" });
      return new Response();
    });
    expect(validation.status).toBe(400);
    expect((await validation.json()).error.code).toBe("VALIDATION_ERROR");
  });
});
