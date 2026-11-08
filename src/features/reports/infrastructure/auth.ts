import { z } from "zod";
import type { Role } from "../domain/report";
import { AppError } from "../application/errors";
import { database } from "./database";

export interface Actor {
  id: string;
  role: Role;
}
export async function authenticate(request: Request): Promise<Actor> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ") || header.length > 8192)
    throw new AppError(401, "UNAUTHENTICATED", "Inicia sesión para continuar.");
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key)
    throw new AppError(
      503,
      "AUTH_UNAVAILABLE",
      "El acceso no está configurado.",
    );
  let response: Response;
  try {
    response = await fetch(new URL("/auth/v1/user", url), {
      headers: { apikey: key, authorization: header },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    throw new AppError(
      503,
      "AUTH_UNAVAILABLE",
      "No se pudo verificar la sesión.",
    );
  }
  if (!response.ok) {
    if (response.status >= 500)
      throw new AppError(
        503,
        "AUTH_UNAVAILABLE",
        "No se pudo verificar la sesión.",
      );
    throw new AppError(401, "UNAUTHENTICATED", "La sesión no es válida.");
  }
  const identity = z
    .object({ id: z.string().uuid() })
    .safeParse(await response.json());
  if (!identity.success)
    throw new AppError(401, "UNAUTHENTICATED", "La sesión no es válida.");
  // Only verified provider identities may create a local citizen. Roles are never copied from token metadata.
  await database().query(
    'INSERT INTO "User" (id) VALUES ($1) ON CONFLICT (id) DO NOTHING',
    [identity.data.id],
  );
  const result = await database().query<{ id: string; role: Role }>(
    'SELECT id, role FROM "User" WHERE id = $1',
    [identity.data.id],
  );
  const actor = result.rows[0];
  if (!actor)
    throw new AppError(401, "UNAUTHENTICATED", "La sesión no es válida.");
  return actor;
}
export function moderator(actor: Actor): void {
  if (actor.role !== "MODERATOR")
    throw new AppError(
      403,
      "FORBIDDEN",
      "No tienes permiso para realizar esta acción.",
    );
}
