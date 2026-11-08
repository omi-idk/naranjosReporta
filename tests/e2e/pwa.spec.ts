import { expect, test } from "@playwright/test";

test("PWA ofrece aviso offline sin cachear API ni reportes", async ({
  page,
  context,
}) => {
  await page.goto("/acceso");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    )
    .toBe(true);

  await page.evaluate(async () => {
    await fetch("/api/reports", { cache: "no-store" });
    await fetch("/api/session", { cache: "no-store" });
  });
  const cachedPaths = await page.evaluate(async () => {
    const paths: string[] = [];
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        paths.push(new URL(request.url).pathname);
      }
    }
    return paths;
  });
  expect(cachedPaths).toEqual(["/offline.html"]);

  try {
    await context.setOffline(true);
    await page.goto("/reportes?prueba-sin-conexion=1");
    await expect(
      page.getByRole("heading", {
        name: "Necesitas conexión para continuar",
      }),
    ).toBeVisible();
    await expect(page.getByText(/no guardamos reportes/i)).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
