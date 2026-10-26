import { expect, test } from "@playwright/test";

test("exposes a mobile-installable manifest and valid icons under the Pages base path", async ({ page }) => {
  await page.goto("./");

  await expect(page.locator('meta[name="mobile-web-app-capable"]')).toHaveAttribute("content", "yes");
  await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute("content", "yes");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#278c67");
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    "href",
    "/bioflex-profitability/apple-touch-icon.png",
  );

  const manifestLink = page.locator('link[rel="manifest"]');
  await expect(manifestLink).toHaveAttribute("href", "/bioflex-profitability/manifest.webmanifest");
  const manifestResponse = await page.request.get("/bioflex-profitability/manifest.webmanifest");
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json();

  expect(manifest).toMatchObject({
    id: "/bioflex-profitability/",
    start_url: "/bioflex-profitability/",
    scope: "/bioflex-profitability/",
    display: "standalone",
  });

  for (const [filename, size, purpose] of [
    ["icon-192.png", "192x192", "any"],
    ["icon-512.png", "512x512", "any"],
    ["app-icon-maskable-512.png", "512x512", "maskable"],
  ]) {
    expect(manifest.icons).toContainEqual({
      src: `/bioflex-profitability/${filename}`,
      sizes: size,
      type: "image/png",
      purpose,
    });
    const iconResponse = await page.request.get(`/bioflex-profitability/${filename}`);
    expect(iconResponse.ok()).toBe(true);
    expect((await iconResponse.body()).subarray(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  }

  const serviceWorker = await page.request.get("/bioflex-profitability/sw.js");
  expect(serviceWorker.ok()).toBe(true);
  expect(await serviceWorker.text()).toContain("./apple-touch-icon.png");
});
