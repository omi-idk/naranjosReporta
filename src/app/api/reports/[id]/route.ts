import { z } from "zod";
import { authenticate } from "@/features/reports/infrastructure/auth";
import { endpoint, json } from "@/features/reports/infrastructure/http";
import { reportDetail } from "@/features/reports/infrastructure/repository";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return endpoint(async () => {
    const id = z
      .string()
      .uuid()
      .parse((await context.params).id);
    const actor = request.headers.has("authorization")
      ? await authenticate(request)
      : undefined;
    return json(await reportDetail(id, actor));
  });
}
