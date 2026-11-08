import { z } from "zod";

export const statuses = [
  "PENDING_MODERATION",
  "PUBLISHED",
  "UNDER_REVIEW",
  "SOLUTION_REPORTED",
  "SOLUTION_VERIFIED",
  "REJECTED",
] as const;
export type ReportStatus = (typeof statuses)[number];
export type Role = "CITIZEN" | "MODERATOR";
export const createReportSchema = z
  .object({
    categoryId: z.string().uuid(),
    title: z.string().trim().min(10).max(120),
    description: z.string().trim().min(30).max(2000),
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180),
    locationConsent: z.literal(true),
  })
  .strict();

const transitions: Record<ReportStatus, readonly ReportStatus[]> = {
  PENDING_MODERATION: ["PUBLISHED", "REJECTED"],
  PUBLISHED: ["UNDER_REVIEW", "SOLUTION_REPORTED"],
  UNDER_REVIEW: ["PUBLISHED", "SOLUTION_REPORTED"],
  SOLUTION_REPORTED: ["SOLUTION_VERIFIED", "UNDER_REVIEW"],
  SOLUTION_VERIFIED: ["UNDER_REVIEW"],
  REJECTED: [],
};

export function authorizeTransition(input: {
  from: ReportStatus;
  to: ReportStatus;
  role: Role;
  isAuthor: boolean;
  reason: string;
}): void {
  if (!transitions[input.from].includes(input.to))
    throw new Error("INVALID_TRANSITION");
  if (input.reason.trim().length < 10 || input.reason.length > 1000)
    throw new Error("REASON_REQUIRED");
  if (
    input.role !== "MODERATOR" &&
    !(input.isAuthor && input.to === "SOLUTION_REPORTED")
  )
    throw new Error("FORBIDDEN");
}

export const publicStatuses: readonly ReportStatus[] = [
  "PUBLISHED",
  "UNDER_REVIEW",
  "SOLUTION_REPORTED",
  "SOLUTION_VERIFIED",
];
