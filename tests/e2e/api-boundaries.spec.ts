import { expect, test } from "@playwright/test";

test.describe("Límites públicos de la API", () => {
  test("crear sin sesión no permite publicar ni filtra detalles internos", async ({
    request,
  }) => {
    const response = await request.post("/api/reports", {
      data: { status: "PUBLISHED", authorId: "attacker" },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe("UNAUTHENTICATED");
    expect(JSON.stringify(body)).not.toMatch(
      /postgresql:\/\/|SELECT |stack|password/i,
    );
  });

  test("el listado rechaza estados privados antes de consultar datos", async ({
    request,
  }) => {
    for (const status of ["PENDING_MODERATION", "REJECTED"]) {
      const response = await request.get("/api/reports", {
        params: { status },
      });
      expect(response.status()).toBe(400);
      expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
    }
  });

  test("la proximidad exige coordenadas completas y radio acotado", async ({
    request,
  }) => {
    const cases: Record<string, string>[] = [
      { latitude: "91", longitude: "0", radius: "100" },
      { latitude: "0" },
      { latitude: "0", longitude: "0", radius: "1000000" },
    ];
    for (const params of cases) {
      const response = await request.get("/api/reports", { params });
      expect(response.status()).toBe(400);
    }
  });

  test("una solicitud de origen ajeno no puede mutar reportes", async ({
    request,
  }) => {
    const response = await request.post("/api/reports", {
      headers: { origin: "https://untrusted.example" },
      data: {},
    });
    expect(response.status()).toBe(403);
    expect((await response.json()).error.code).toBe("INVALID_ORIGIN");
  });

  test("cola de moderación y transiciones exigen una sesión", async ({
    request,
  }) => {
    const queue = await request.get("/api/moderation");
    expect(queue.status()).toBe(401);
    const transition = await request.post(
      "/api/reports/212d2fef-c5f0-43d0-8e15-721fc77d6651/transitions",
      {
        data: {
          to: "PUBLISHED",
          reason: "Intento sin sesión",
          version: 0,
        },
      },
    );
    expect(transition.status()).toBe(401);
  });
});
