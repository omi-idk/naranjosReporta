export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const body = await response.json();
  if (!response.ok)
    throw new Error(
      body.error?.message ??
        "No pudimos completar la solicitud. Intenta de nuevo.",
    );
  return body as T;
}
