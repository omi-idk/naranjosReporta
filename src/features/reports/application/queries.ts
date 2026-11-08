import { z } from "zod";
import { publicStatuses, statuses } from "../domain/report";

export const listQuerySchema = z
  .object({
    q: z.string().trim().max(120).default(""),
    category: z.string().uuid().optional(),
    status: z
      .enum(statuses)
      .refine((value) => publicStatuses.includes(value), "Estado no público")
      .optional(),
    page: z.coerce.number().int().min(1).max(500).default(1),
    sort: z.enum(["newest", "oldest"]).default("newest"),
    latitude: z.coerce.number().finite().min(-90).max(90).optional(),
    longitude: z.coerce.number().finite().min(-180).max(180).optional(),
    radius: z.coerce.number().int().min(100).max(10000).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const count = [value.latitude, value.longitude, value.radius].filter(
      (item) => item !== undefined,
    ).length;
    if (count !== 0 && count !== 3)
      context.addIssue({
        code: "custom",
        message: "Especifica latitud, longitud y radio juntos",
      });
  });
export type ListQuery = z.infer<typeof listQuerySchema>;
export const transitionSchema = z
  .object({
    to: z.enum(statuses),
    reason: z.string().trim().min(10).max(1000),
    version: z.number().int().min(0),
  })
  .strict();
