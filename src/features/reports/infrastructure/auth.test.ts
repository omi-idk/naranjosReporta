import { afterEach, describe, expect, it, vi } from "vitest";

const query = vi.fn();
vi.mock("./database", () => ({ database: () => ({ query }) }));
import { authenticate, moderator } from "./auth";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
describe("verified identity and role", () => {
  it("requires bearer credentials before accessing storage", async () => {
    await expect(
      authenticate(new Request("https://example.test")),
    ).rejects.toMatchObject({ status: 401 });
    expect(query).not.toHaveBeenCalled();
  });
  it("uses role from database and ignores provider-editable metadata", async () => {
    const id = "212d2fef-c5f0-43d0-8e15-721fc77d6651";
    vi.stubEnv("SUPABASE_URL", "https://identity.example.test");
    vi.stubEnv("SUPABASE_ANON_KEY", "public-anon");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ id, user_metadata: { role: "MODERATOR" } }),
        ),
    );
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id, role: "CITIZEN" }] });
    const actor = await authenticate(
      new Request("https://example.test", {
        headers: { authorization: "Bearer valid-token" },
      }),
    );
    expect(actor.role).toBe("CITIZEN");
    expect(() => moderator(actor)).toThrow();
    expect(query.mock.calls[0][1]).toEqual([id]);
  });
  it("rejects invalid provider sessions and does not provision local users", async () => {
    vi.stubEnv("SUPABASE_URL", "https://identity.example.test");
    vi.stubEnv("SUPABASE_ANON_KEY", "public-anon");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
    );
    await expect(
      authenticate(
        new Request("https://example.test", {
          headers: { authorization: "Bearer invalid-token" },
        }),
      ),
    ).rejects.toMatchObject({ status: 401 });
    expect(query).not.toHaveBeenCalled();
  });
});
