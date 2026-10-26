import { expect, test } from "@playwright/test";

const dataset = {
  schemaVersion: 1,
  updatedAt: "2026-10-18T19:00:00.000Z",
  vehicles: [
    {
      id: "a1c6d80a-40a4-4c30-ae4e-64ea3bb48afe",
      make: "Peugeot",
      model: "308",
      boxCostEur: 1000,
      installDate: "2026-10-18",
      createdAt: "2026-10-18T19:00:00.000Z",
      fills: [
        {
          id: "844b82a0-90ec-4879-a0b0-1e82a8893b18",
          recordedAt: "2026-10-18T19:10:00.000Z",
          e85PricePerLitreEur: 0.9,
          sp95PricePerLitreEur: 1.8,
          litres: 40,
        },
      ],
    },
  ],
};

test("opens a prefilled edit screen from history and persists corrected fill values", async ({ page }) => {
  await page.goto("./");
  await page.evaluate((value) => {
    localStorage.setItem("bioflex-roi:local-dataset:v1", JSON.stringify(value));
  }, dataset);
  await page.reload();

  await page.getByRole("button", { name: "Modifier le plein enregistré le 2026-10-18" }).click();
  await expect(page.getByRole("dialog", { name: "Modifier un plein" })).toBeVisible();
  await expect(page.getByLabel("Prix E85 / litre (€)")).toHaveValue("0.9");
  await expect(page.getByLabel("Prix SP95 / litre (€)")).toHaveValue("1.8");
  await expect(page.getByLabel("Volume du plein (litres)")).toHaveValue("40");
  await expect(page.getByLabel("Date du plein")).toHaveValue("2026-10-18");

  await page.getByLabel("Date du plein").fill("2026-10-17");
  await page.getByRole("button", { name: "Enregistrer les modifications" }).click();
  await expect(page.locator(".form-error")).toContainText("entre l'installation et aujourd'hui");

  await page.getByLabel("Prix E85 / litre (€)").fill("0");
  await page.getByRole("button", { name: "Enregistrer les modifications" }).click();
  await expect(page.locator(".form-error")).toContainText("supérieurs à 0");

  await page.getByLabel("Date du plein").fill("2026-10-20");
  await page.getByLabel("Prix E85 / litre (€)").fill("1.1");
  await page.getByLabel("Volume du plein (litres)").fill("45");
  await page.getByRole("button", { name: "Enregistrer les modifications" }).click();

  await expect(page.getByText("15,30 €").first()).toBeVisible();
  await expect(page.getByText("984,70 €").first()).toBeVisible();
  await expect(page.getByText(/E85 payé 49,50.*SP95 équivalent 64,80/)).toBeVisible();
  expect(await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("bioflex-roi:local-dataset:v1")!);
    return saved.vehicles[0].fills[0].recordedAt;
  })).toBe("2026-10-20T19:10:00.000Z");

  await page.reload();
  await page.getByRole("button", { name: "Modifier le plein enregistré le 2026-10-20" }).click();
  await expect(page.getByLabel("Prix E85 / litre (€)")).toHaveValue("1.1");
  await expect(page.getByLabel("Volume du plein (litres)")).toHaveValue("45");
  await expect(page.getByLabel("Date du plein")).toHaveValue("2026-10-20");
});
