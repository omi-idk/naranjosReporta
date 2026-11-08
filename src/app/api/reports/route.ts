import { createReportSchema } from "@/features/reports/domain/report";
import { listQuerySchema } from "@/features/reports/application/queries";
import { authenticate } from "@/features/reports/infrastructure/auth";
import {
  checkOrigin,
  endpoint,
  json,
  readJson,
} from "@/features/reports/infrastructure/http";
import {
  createReport,
  listReports,
} from "@/features/reports/infrastructure/repository";
export const runtime = "nodejs";
export async function GET(request: Request) {
  return endpoint(async () =>
    json(
      await listReports(
        listQuerySchema.parse(
          Object.fromEntries(new URL(request.url).searchParams),
        ),
      ),
    ),
  );
}
export async function POST(request: Request) {
  return endpoint(async () => {
    checkOrigin(request);
    const actor = await authenticate(request);
    const input = createReportSchema.parse(await readJson(request));
    return json(await createReport(input, actor), 201);
  });
}
