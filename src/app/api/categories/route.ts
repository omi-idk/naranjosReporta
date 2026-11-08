import { categories } from "@/features/reports/infrastructure/repository";
import { endpoint, json } from "@/features/reports/infrastructure/http";
export const runtime = "nodejs";
export async function GET() {
  return endpoint(async () => json({ items: await categories() }));
}
