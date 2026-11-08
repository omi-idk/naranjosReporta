import { endpoint, json } from "@/features/reports/infrastructure/http";
import { statistics } from "@/features/reports/infrastructure/repository";
export const runtime = "nodejs";
export async function GET() {
  return endpoint(async () => json(await statistics()));
}
