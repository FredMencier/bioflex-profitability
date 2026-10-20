import { describe, expect, it } from "vitest";
import type { Dataset } from "@/domain/dataset";
import { MAX_DATASET_FILE_BYTES, parseDatasetFile, serializeDataset } from "@/storage/datasetFile";

const dataset: Dataset = {
  schemaVersion: 1,
  updatedAt: "2026-10-18T19:00:00.000Z",
  vehicles: [
    {
      id: "a1c6d80a-40a4-4c30-ae4e-64ea3bb48afe",
      make: "Peugeot",
      model: "308",
      boxCostEur: 1000,
      installDate: "2026-10-18",
      createdAt: "2026-10-18T19:05:00.000Z",
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

describe("dataset JSON files", () => {
  it("parses a complete supported dataset", () => {
    expect(parseDatasetFile(JSON.stringify(dataset))).toEqual({ ok: true, dataset });
  });

  it("rejects malformed JSON and unsupported schema versions", () => {
    expect(parseDatasetFile("{")).toMatchObject({ ok: false, error: "invalid-json" });
    expect(
      parseDatasetFile(JSON.stringify({ ...dataset, schemaVersion: 2 })),
    ).toMatchObject({ ok: false, error: "invalid-dataset" });
  });

  it("rejects files above the byte limit before parsing", () => {
    expect(parseDatasetFile("{}", MAX_DATASET_FILE_BYTES + 1)).toMatchObject({
      ok: false,
      error: "file-too-large",
    });
  });

  it("serializes and parses the complete dataset without derived totals", () => {
    const file = serializeDataset(dataset);

    expect(parseDatasetFile(file)).toEqual({ ok: true, dataset });
    expect(file).not.toContain("savingEur");
    expect(file).not.toContain("totalSavingsEur");
  });
});
