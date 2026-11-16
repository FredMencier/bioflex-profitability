import { expect, test, type Page } from "@playwright/test";

async function addVehicle(page: Page, make: string, model: string) {
  await page.getByRole("button", { name: "Ajouter un véhicule" }).last().click();
  await page.getByLabel("Marque").fill(make);
  await page.getByLabel("Modèle").fill(model);
  await page.getByRole("button", { name: "Enregistrer le véhicule" }).click();
}

async function addFill(page: Page) {
  await page.getByRole("button", { name: "Ajouter un plein" }).click();
  await page.getByLabel("Prix E85 / litre (€)").fill("0.9");
  await page.getByLabel("Prix SP95 / litre (€)").fill("1.8");
  await page.getByLabel("Volume du plein (litres)").fill("40");
  await page.getByRole("button", { name: "Enregistrer le plein" }).click();
}

test("keeps fills and amortization isolated per selected vehicle", async ({ page }) => {
  await page.goto("./");
  await addVehicle(page, "Peugeot", "308");
  await addFill(page);
  await addVehicle(page, "Renault", "Clio");

  await expect(page.getByText("0 pleins enregistrés")).toBeVisible();
  await expect(page.getByText("0,00 €").first()).toBeVisible();
  await expect(page.getByText("Aucun plein enregistré pour ce véhicule.")).toBeVisible();

  await page.getByRole("button", { name: /Peugeot 308/ }).click();
  await expect(page.getByText("21,60 €").first()).toBeVisible();
  await expect(page.getByText(/E85 payé 36,00/)).toBeVisible();

  await page.getByRole("button", { name: /Renault Clio/ }).click();
  await expect(page.getByText("0 pleins enregistrés")).toBeVisible();
  await expect(page.getByText("Aucun plein enregistré pour ce véhicule.")).toBeVisible();
});

test("edits vehicle details without losing its fill history", async ({ page }) => {
  await page.goto("./");
  await addVehicle(page, "Peugeot", "308");
  await addFill(page);

  await page.getByRole("button", { name: "Modifier les informations du véhicule" }).click();
  const dialog = page.getByRole("dialog", { name: "Modifier un véhicule" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Marque")).toHaveValue("Peugeot");
  await expect(dialog.getByLabel("Modèle")).toHaveValue("308");
  await expect(dialog.getByLabel("Coût du boîtier (€)")).toHaveValue("1000");

  await dialog.getByLabel("Marque").fill("Citroën");
  await dialog.getByLabel("Modèle").fill("C3");
  await dialog.getByLabel("Coût du boîtier (€)").fill("1500");
  await dialog.getByRole("button", { name: "Enregistrer les modifications" }).click();

  await expect(page.getByRole("heading", { name: "Citroën C3" })).toBeVisible();
  await expect(page.getByText("1 plein enregistré")).toBeVisible();
  await expect(page.getByText("Véhicule modifié")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Citroën C3" })).toBeVisible();
  await expect(page.getByText("1 plein enregistré")).toBeVisible();
  await page.getByRole("button", { name: /Citroën C3/ }).click();
  await page.getByRole("button", { name: "Modifier les informations du véhicule" }).click();
  await expect(page.getByLabel("Coût du boîtier (€)")).toHaveValue("1500");
});
