import { authenticate } from "@/features/reports/infrastructure/auth";
import { endpoint, json } from "@/features/reports/infrastructure/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  return endpoint(async () => {
    const actor = await authenticate(request);
    return json({ role: actor.role });
  });
}
