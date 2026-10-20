import { expect, test } from "@playwright/test";

test("keeps vehicle creation and dashboard usable on a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  const mobileNav = page.getByRole("navigation", { name: "Navigation mobile" });
  await expect(mobileNav).toBeVisible();

  await mobileNav.getByRole("button", { name: "Véhicules" }).click();
  await expect(page.locator(".sidebar")).toHaveClass(/open/);
  await page.locator(".sidebar").getByRole("button", { name: "Ajouter un véhicule" }).click();
  await page.getByLabel("Marque").fill("Dacia");
  await page.getByLabel("Modèle").fill("Sandero");
  await page.getByRole("button", { name: "Enregistrer le véhicule" }).click();

  await expect(page.getByRole("heading", { name: "Dacia Sandero" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Synthèse de rentabilité" })).toBeVisible();
  await expect(mobileNav.getByRole("button", { name: "Ajouter un plein" })).toBeVisible();
});
