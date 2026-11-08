import { z } from "zod";
import { transitionSchema } from "@/features/reports/application/queries";
import { authenticate } from "@/features/reports/infrastructure/auth";
import {
  checkOrigin,
  endpoint,
  json,
  readJson,
} from "@/features/reports/infrastructure/http";
import { transitionReport } from "@/features/reports/infrastructure/repository";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return endpoint(async () => {
    checkOrigin(request);
    const actor = await authenticate(request);
    const id = z
      .string()
      .uuid()
      .parse((await context.params).id);
    return json(
      await transitionReport(
        id,
        transitionSchema.parse(await readJson(request)),
        actor,
      ),
    );
  });
}
