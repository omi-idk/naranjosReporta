import { expect, test, type Page } from "@playwright/test";

async function waitForMapTiles(page: Page) {
  await expect
    .poll(
      () =>
        page
          .locator(".leaflet-tile")
          .evaluateAll(
            (tiles) =>
              tiles.length > 0 &&
              tiles.every(
                (tile) =>
                  tile instanceof HTMLImageElement &&
                  tile.complete &&
                  tile.naturalWidth > 0,
              ),
          ),
      { timeout: 15_000 },
    )
    .toBe(true);
  await expect(page.locator(".leaflet-tile-loaded").first()).toHaveCSS(
    "opacity",
    "1",
  );
}

test.beforeEach(async ({ page }) => {
  page.on("pageerror", (error) =>
    console.error("Browser error:", error.message),
  );
  page.on("requestfailed", (request) =>
    console.error(
      "Request failed:",
      request.url(),
      request.failure()?.errorText,
    ),
  );
  page.on("console", (message) => {
    if (message.type() === "error")
      console.error("Browser console:", message.text());
  });
});

test("la navegación permite explorar y abrir el registro", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();
  await page.locator('a[href="/reportes"]').first().click();
  await expect(page).toHaveURL(/\/reportes(?:\?.*)?$/);
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await waitForMapTiles(page);
  await page.locator('a[href="/reportes/nuevo"]').first().click();
  await expect(page).toHaveURL(/\/reportes\/nuevo$/);
  await expect(page.getByLabel(/^Título/)).toBeVisible();
  await expect(page.getByLabel(/^Descripción/)).toBeVisible();
  await expect(page.getByLabel(/^Latitud/)).toBeVisible();
  await expect(page.getByLabel(/^Longitud/)).toBeVisible();
});

test("el formulario permite ubicar manualmente sin solicitar geolocalización", async ({
  page,
}) => {
  // These are synthetic test coordinates, not municipal data or an actual report.
  await page.goto("/reportes/nuevo");
  const latitude = page.getByLabel(/^Latitud/);
  const longitude = page.getByLabel(/^Longitud/);
  await latitude.fill("0.125");
  await longitude.fill("0.25");
  await page.getByRole("button", { name: "Aplicar coordenadas" }).click();
  await expect(latitude).toHaveValue("0.125");
  await expect(longitude).toHaveValue("0.25");
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(page.locator(".selection-pin")).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Ubicación seleccionada:" }),
  ).toBeVisible();
  const title = page.getByLabel(/^Título/);
  await title.fill("Corto");
  await expect(title).toHaveAttribute("minlength", "10");
  expect(
    await title.evaluate((element: HTMLInputElement) =>
      element.checkValidity(),
    ),
  ).toBe(false);
  await expect(
    page.getByLabel("Acepto compartir esta ubicación para revisar el reporte."),
  ).not.toBeChecked();
});

for (const width of [1440, 768, 390]) {
  test(`exploración no desborda a ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/reportes");
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator(".leaflet-container")).toBeAttached();
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
    if (width >= 1100) {
      await waitForMapTiles(page);
    }
    await page.screenshot({
      path: testInfo.outputPath(`explorar-${width}.png`),
      fullPage: true,
    });
    if (width < 1100) {
      await page.getByRole("button", { name: "Mapa", exact: true }).click();
      await expect(page.locator(".leaflet-container")).toBeVisible();
      await waitForMapTiles(page);
      await page.screenshot({
        path: testInfo.outputPath(`mapa-${width}.png`),
        fullPage: true,
      });
    }
    expect(errors).toEqual([]);
  });
}
