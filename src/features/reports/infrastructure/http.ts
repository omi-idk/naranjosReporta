import { ZodError } from "zod";
import { AppError } from "../application/errors";

export function json(value: unknown, status = 200): Response {
  return Response.json(value, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export async function endpoint(
  action: () => Promise<Response>,
): Promise<Response> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ZodError)
      return json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Revisa los campos indicados.",
            fields: error.flatten().fieldErrors,
          },
        },
        400,
      );
    if (error instanceof AppError)
      return json(
        { error: { code: error.code, message: error.message } },
        error.status,
      );
    // Do not serialize database errors, query values, provider responses or stack traces.
    return json(
      {
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "El servicio no está disponible. Intenta más tarde.",
        },
      },
      503,
    );
  }
}
export function checkOrigin(request: Request): void {
  const expected = new URL(process.env.NEXT_PUBLIC_APP_URL ?? request.url)
    .origin;
  const origin = request.headers.get("origin");
  // Bearer tokens are not ambient credentials. Still reject explicit cross-origin browser requests.
  if (origin && origin !== expected)
    throw new AppError(403, "INVALID_ORIGIN", "Origen no permitido.");
  if (request.headers.get("sec-fetch-site") === "cross-site")
    throw new AppError(403, "INVALID_ORIGIN", "Origen no permitido.");
}
export async function readJson(request: Request): Promise<unknown> {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new AppError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Envía el formulario en formato JSON.",
    );
  if (Number(request.headers.get("content-length") ?? 0) > 16384)
    throw new AppError(
      413,
      "BODY_TOO_LARGE",
      "La solicitud es demasiado grande.",
    );
  const reader = request.body?.getReader();
  if (!reader)
    throw new AppError(400, "INVALID_JSON", "La solicitud está vacía.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const item = await reader.read();
      if (item.done) break;
      length += item.value.byteLength;
      if (length > 16384) {
        await reader.cancel();
        throw new AppError(
          413,
          "BODY_TOO_LARGE",
          "La solicitud es demasiado grande.",
        );
      }
      chunks.push(item.value);
    }
  } finally {
    reader.releaseLock();
  }
  const all = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    all.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(all));
  } catch {
    throw new AppError(
      400,
      "INVALID_JSON",
      "La solicitud no contiene JSON válido.",
    );
  }
}
