import { z } from "zod";
import {
  authenticate,
  moderator,
} from "@/features/reports/infrastructure/auth";
import { endpoint, json } from "@/features/reports/infrastructure/http";
import { moderationQueue } from "@/features/reports/infrastructure/repository";
export const runtime = "nodejs";
export async function GET(request: Request) {
  return endpoint(async () => {
    const actor = await authenticate(request);
    moderator(actor);
    const page = z.coerce
      .number()
      .int()
      .min(1)
      .max(500)
      .parse(new URL(request.url).searchParams.get("page") ?? 1);
    return json(await moderationQueue(page));
  });
}
