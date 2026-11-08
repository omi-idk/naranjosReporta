import { beforeEach, describe, expect, it, vi } from "vitest";

const query = vi.fn();
vi.mock("./database", () => ({
  database: () => ({ query }),
  transaction: (
    action: (client: { query: typeof query }) => Promise<unknown>,
  ) => action({ query }),
}));
import {
  createReport,
  listReports,
  reportDetail,
  reportDto,
  transitionReport,
} from "./repository";

const actor = {
  id: "212d2fef-c5f0-43d0-8e15-721fc77d6651",
  role: "CITIZEN",
} as const;
beforeEach(() => query.mockReset());
describe("repository authorization and parameter boundaries", () => {
  it("binds private visibility to verified author and moderator, never just id", async () => {
    query.mockResolvedValueOnce({ rows: [] });
    await expect(reportDetail("report-id")).rejects.toMatchObject({
      status: 404,
    });
    expect(query.mock.calls[0][0]).toContain(
      'r.status = ANY($2::"ReportStatus"[])',
    );
    expect(query.mock.calls[0][1][2]).toBeNull();
    expect(query.mock.calls[0][1][3]).toBe(false);
  });
  it("parameterizes search text and uses public precision for proximity", async () => {
    query.mockResolvedValueOnce({ rows: [] });
    await listReports({
      q: "'; DROP TABLE Report; --",
      page: 1,
      sort: "newest",
      latitude: 0,
      longitude: 0,
      radius: 100,
    });
    const [sql, values] = query.mock.calls[0];
    expect(sql).not.toContain("DROP TABLE");
    expect(values).toContain("'; DROP TABLE Report; --");
    expect(sql).toContain("round(ST_X(r.location::geometry)::numeric,3)");
    expect(values.slice(-2)).toEqual([21, 0]);
  });
  it("enforces shared hourly creation quota before insertion", async () => {
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ count: 5 }] });
    await expect(
      createReport(
        {
          categoryId: actor.id,
          title: "Título de prueba",
          description: "Descripción válida de prueba para la incidencia.",
          latitude: 0,
          longitude: 0,
          locationConsent: true,
        },
        actor,
      ),
    ).rejects.toMatchObject({ status: 429 });
    expect(
      query.mock.calls.some(([sql]) =>
        String(sql).includes('INSERT INTO "Report"'),
      ),
    ).toBe(false);
    expect(query.mock.calls[0][0]).toContain("pg_advisory_xact_lock");
  });
  it("does not transition another citizen's report", async () => {
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });
    await expect(
      transitionReport(
        "report-id",
        { to: "SOLUTION_REPORTED", reason: "Se observa reparado", version: 0 },
        actor,
      ),
    ).rejects.toMatchObject({ status: 404 });
    expect(query.mock.calls[1][1]).toEqual(["report-id", actor.id, false]);
    expect(
      query.mock.calls.some(([sql]) => String(sql).startsWith("UPDATE")),
    ).toBe(false);
  });
  it("rejects stale versions before administrative mutation", async () => {
    query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({
      rows: [{ authorId: actor.id, status: "PENDING_MODERATION", version: 2 }],
    });
    await expect(
      transitionReport(
        "report-id",
        { to: "PUBLISHED", reason: "Contenido revisado", version: 1 },
        { ...actor, role: "MODERATOR" },
      ),
    ).rejects.toMatchObject({ status: 409, code: "VERSION_CONFLICT" });
    expect(
      query.mock.calls.some(([sql]) => String(sql).startsWith("UPDATE")),
    ).toBe(false);
  });
  it("maps only explicit DTO fields, even when database row carries private data", () => {
    const row = {
      id: "id",
      title: "title",
      description: "description",
      categoryId: "category",
      categorySlug: "baches",
      categoryName: "Baches",
      status: "PUBLISHED" as const,
      latitude: 0,
      longitude: 0,
      version: 0,
      createdAt: new Date(0),
      updatedAt: new Date(0),
      authorId: "private-author",
      email: "private@example.test",
    };
    const value = reportDto(row);
    expect(value).not.toHaveProperty("authorId");
    expect(value).not.toHaveProperty("email");
    expect(value.locationPrecision).toBe("approximate");
  });
});
