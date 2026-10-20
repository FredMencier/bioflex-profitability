import { expect, test } from "@playwright/test";

test("creates a vehicle and records its first profitable fill", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Ajoutez votre premier véhicule" })).toBeVisible();

  await page.getByRole("button", { name: "Ajouter un véhicule" }).last().click();
  await page.getByLabel("Marque").fill("Peugeot");
  await page.getByLabel("Modèle").fill("308");
  await page.getByRole("button", { name: "Enregistrer le véhicule" }).click();
  await expect(page.getByRole("heading", { name: "Peugeot 308" })).toBeVisible();

  await page.getByRole("button", { name: "Ajouter un plein" }).click();
  await page.getByLabel("Prix E85 / litre (€)").fill("0.9");
  await page.getByLabel("Prix SP95 / litre (€)").fill("1.8");
  await page.getByLabel("Volume du plein (litres)").fill("40");
  await page.getByRole("button", { name: "Enregistrer le plein" }).click();

  await expect(page.getByText("21,60 €").first()).toBeVisible();
  await expect(page.getByText("978,40 €").first()).toBeVisible();
  await expect(page.getByText(/E85 payé 36,00.*SP95 équivalent 57,60/)).toBeVisible();

  await page.reload();
  await expect(page.getByText("21,60 €").first()).toBeVisible();
  await expect(page.getByText(/E85 payé 36,00.*SP95 équivalent 57,60/)).toBeVisible();
});

test("shows validation feedback instead of accepting empty vehicle details", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Ajouter un véhicule" }).last().click();
  await page.getByRole("button", { name: "Enregistrer le véhicule" }).click();
  await expect(page.locator(".form-error")).toContainText("Renseignez la marque, le modèle");
});
