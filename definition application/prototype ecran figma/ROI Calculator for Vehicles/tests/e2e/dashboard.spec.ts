import { expect, test } from "@playwright/test";

const dataset = {
  schemaVersion: 1,
  updatedAt: "2026-10-18T19:00:00.000Z",
  vehicles: [
    {
      id: "a1c6d80a-40a4-4c30-ae4e-64ea3bb48afe",
      make: "Peugeot",
      model: "308",
      boxCostEur: 10,
      installDate: "2026-10-18",
      createdAt: "2026-10-18T19:00:00.000Z",
      fills: [
        {
          id: "844b82a0-90ec-4879-a0b0-1e82a8893b18",
          recordedAt: "2026-10-18T19:10:00.000Z",
          e85PricePerLitreEur: 1,
          sp95PricePerLitreEur: 3,
          litres: 10,
        },
      ],
    },
  ],
};

test("shows the actual ROI values, charts, negative remaining balance, and empty states", async ({ page }) => {
  await page.addInitScript((value) => {
    localStorage.setItem("bioflex-roi:local-dataset:v1", JSON.stringify(value));
  }, dataset);
  await page.goto("./");

  await expect(page.getByText("14,00 €").first()).toBeVisible();
  await expect(page.getByText("-4,00 €").first()).toBeVisible();
  await expect(page.getByRole("img", { name: "Courbe des économies nettes cumulées" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Répartition de l'amortissement" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Évolution du coût total des pleins E85 et SP95" })).toBeVisible();
  const comparisonChart = page.getByRole("img", { name: "Comparaison du coût E85 et du coût SP95 équivalent" });
  await expect(comparisonChart).toBeVisible();
  const chartBounds = await comparisonChart.boundingBox();
  expect(chartBounds).not.toBeNull();
  await comparisonChart.click({ position: { x: chartBounds!.width / 2 + 8, y: 170 } });
  await expect(page.getByText(/E85 payé.*1,00.*\/L/)).toBeVisible();
  await expect(page.getByText(/SP95 équivalent.*3,00.*\/L/)).toBeVisible();
  await expect(page.getByText("Boîtier amorti")).toBeVisible();

  await page.getByRole("button", { name: "Ajouter un véhicule" }).first().click();
  await page.getByLabel("Marque").fill("Citroën");
  await page.getByLabel("Modèle").fill("C3");
  await page.getByRole("button", { name: "Enregistrer le véhicule" }).click();
  await expect(page.getByText("Aucun plein enregistré pour ce véhicule.")).toBeVisible();
  await expect(page.getByText("La courbe apparaîtra après votre premier plein.")).toBeVisible();
  await expect(page.getByText("Le graphique des dépenses apparaîtra après votre premier plein.")).toBeVisible();
});
