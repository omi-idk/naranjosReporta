import { describe, expect, it } from "vitest";
import { listQuerySchema, transitionSchema } from "./queries";

describe("public report query boundary", () => {
  it("defaults to bounded first page newest", () => {
    expect(listQuerySchema.parse({})).toEqual({
      q: "",
      page: 1,
      sort: "newest",
    });
  });
  it.each([
    { status: "PENDING_MODERATION" },
    { status: "REJECTED" },
    { page: "0" },
    { page: "501" },
    { latitude: "20" },
    { latitude: "20", longitude: "-98", radius: "99" },
    { sort: "title;DROP TABLE" },
    { authorId: "private" },
  ])("rejects private or unbounded query %j", (input) => {
    expect(listQuerySchema.safeParse(input).success).toBe(false);
  });
  it("accepts complete bounded proximity", () => {
    expect(
      listQuerySchema.parse({ latitude: "0", longitude: "0", radius: "100" })
        .radius,
    ).toBe(100);
  });
  it("requires an expected version and refuses administrative extra fields", () => {
    expect(
      transitionSchema.safeParse({
        to: "PUBLISHED",
        reason: "Contenido revisado",
        version: 0,
      }).success,
    ).toBe(true);
    expect(
      transitionSchema.safeParse({
        to: "PUBLISHED",
        reason: "Contenido revisado",
        role: "MODERATOR",
      }).success,
    ).toBe(false);
  });
});
