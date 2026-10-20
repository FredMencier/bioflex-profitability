import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

function dataset(make: string, model: string) {
  return {
    schemaVersion: 1,
    updatedAt: "2026-10-18T19:00:00.000Z",
    vehicles: [
      {
        id: "a1c6d80a-40a4-4c30-ae4e-64ea3bb48afe",
        make,
        model,
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
}

async function openDataControls(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Ouvrir la gestion des données" }).click();
}

test("imports, confirms replacement, exports, and preserves the complete JSON dataset", async ({ page }) => {
  await page.goto("./");
  await openDataControls(page);
  await expect(page.getByText("Aucun compte ni synchronisation.")).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({
    name: "bioflex-roi-source.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(dataset("Peugeot", "308"))),
  });
  await expect(page.getByRole("heading", { name: "Peugeot 308" })).toBeVisible();
  await expect(page.getByText("Données JSON importées")).toBeVisible();

  await openDataControls(page);
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.locator('input[type="file"]').setInputFiles({
    name: "replacement.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(dataset("Renault", "Clio"))),
  });
  await expect(page.getByRole("heading", { name: "Peugeot 308" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Données JSON" })).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.locator('input[type="file"]').setInputFiles({
    name: "replacement.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(dataset("Renault", "Clio"))),
  });
  await expect(page.getByRole("heading", { name: "Renault Clio" })).toBeVisible();

  await openDataControls(page);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Exporter mes données/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^bioflex-roi-\d{4}-\d{2}-\d{2}\.json$/);
  const exported = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(exported.vehicles[0].make).toBe("Renault");
  expect(exported.vehicles[0].fills[0].litres).toBe(40);
  expect(exported.vehicles[0].fills[0]).not.toHaveProperty("savingEur");
});

test("rejects invalid or oversized imports without replacing active data", async ({ page }) => {
  await page.goto("./");
  await openDataControls(page);
  await page.locator('input[type="file"]').setInputFiles({
    name: "valid.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(dataset("Citroën", "C3"))),
  });
  await expect(page.getByRole("heading", { name: "Citroën C3" })).toBeVisible();
  await openDataControls(page);

  await page.locator('input[type="file"]').setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("{"),
  });
  await expect(page.locator(".form-error")).toContainText("n'est pas un JSON valide");
  await expect(page.getByRole("heading", { name: "Citroën C3" })).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles({
    name: "large.json",
    mimeType: "application/json",
    buffer: Buffer.alloc(1_000_001, " "),
  });
  await expect(page.locator(".form-error")).toContainText("dépasse la limite de 1 Mo");
  await page.getByRole("button", { name: "Fermer" }).last().click();
  await expect(page.getByRole("heading", { name: "Citroën C3" })).toBeVisible();
});
