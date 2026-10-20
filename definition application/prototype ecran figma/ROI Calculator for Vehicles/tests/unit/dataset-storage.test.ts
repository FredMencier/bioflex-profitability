import { describe, expect, it, vi } from "vitest";
import {
  createEmptyDataset,
  validateDataset,
  type Dataset,
} from "@/domain/dataset";
import {
  DATASET_STORAGE_KEY,
  loadDataset,
  saveDataset,
} from "@/storage/localDatasetStorage";

const timestamp = "2026-10-18T19:00:00.000Z";
const validDataset: Dataset = {
  schemaVersion: 1,
  updatedAt: timestamp,
  vehicles: [
    {
      id: "a1c6d80a-40a4-4c30-ae4e-64ea3bb48afe",
      make: "Peugeot",
      model: "308",
      boxCostEur: 1000,
      installDate: "2026-10-18",
      createdAt: timestamp,
      fills: [
        {
          id: "844b82a0-90ec-4879-a0b0-1e82a8893b18",
          recordedAt: timestamp,
          e85PricePerLitreEur: 0.9,
          sp95PricePerLitreEur: 1.8,
          litres: 40,
        },
      ],
    },
  ],
};

function mockStorage(value: string | null = null): Storage {
  return {
    getItem: vi.fn(() => value),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(() => null),
    length: 0,
  };
}

describe("dataset schema", () => {
  it("creates an empty versioned dataset without sample vehicles", () => {
    const dataset = createEmptyDataset(new Date(timestamp));

    expect(dataset).toEqual({
      schemaVersion: 1,
      updatedAt: timestamp,
      vehicles: [],
    });
  });

  it("accepts a valid complete dataset", () => {
    expect(validateDataset(validDataset)).toEqual({ ok: true, dataset: validDataset });
  });

  it("rejects unsupported versions and missing required fields", () => {
    expect(validateDataset({ ...validDataset, schemaVersion: 2 }).ok).toBe(false);
    expect(validateDataset({ schemaVersion: 1, vehicles: [] }).ok).toBe(false);
    expect(
      validateDataset({
        ...validDataset,
        vehicles: [{ ...validDataset.vehicles[0], model: " " }],
      }).ok,
    ).toBe(false);
  });

  it("rejects non-finite, non-positive, and chronologically invalid values", () => {
    const vehicle = validDataset.vehicles[0];

    expect(
      validateDataset({
        ...validDataset,
        vehicles: [{ ...vehicle, boxCostEur: Number.POSITIVE_INFINITY }],
      }).ok,
    ).toBe(false);
    expect(
      validateDataset({
        ...validDataset,
        vehicles: [
          {
            ...vehicle,
            fills: [{ ...vehicle.fills[0], litres: 0 }],
          },
        ],
      }).ok,
    ).toBe(false);
    expect(
      validateDataset({
        ...validDataset,
        vehicles: [
          {
            ...vehicle,
            fills: [{ ...vehicle.fills[0], recordedAt: "2026-10-17T19:00:00.000Z" }],
          },
        ],
      }).ok,
    ).toBe(false);
  });

  it("rejects invalid calendar dates and duplicate IDs", () => {
    const vehicle = validDataset.vehicles[0];

    expect(
      validateDataset({
        ...validDataset,
        vehicles: [{ ...vehicle, installDate: "2026-02-30" }],
      }).ok,
    ).toBe(false);
    expect(
      validateDataset({
        ...validDataset,
        vehicles: [{ ...vehicle, fills: [{ ...vehicle.fills[0], id: vehicle.id }] }],
      }).ok,
    ).toBe(false);
  });

  it("rejects impossible UTC timestamps", () => {
    expect(validateDataset({ ...validDataset, updatedAt: "2026-02-30T19:00:00.000Z" }).ok).toBe(false);
  });
});

describe("local dataset storage", () => {
  it("uses a Bioflex-specific storage key", () => {
    expect(DATASET_STORAGE_KEY).toContain("bioflex-roi");
  });

  it("initializes an empty dataset when local storage has no saved data", () => {
    const result = loadDataset(mockStorage(), new Date(timestamp));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.dataset.vehicles).toEqual([]);
  });

  it("loads a saved dataset after validating its complete document", () => {
    const result = loadDataset(mockStorage(JSON.stringify(validDataset)));

    expect(result).toEqual({ ok: true, dataset: validDataset });
  });

  it("reports malformed and invalid saved documents without replacing them", () => {
    expect(loadDataset(mockStorage("{"))).toMatchObject({ ok: false, error: "invalid-json" });
    expect(
      loadDataset(mockStorage(JSON.stringify({ ...validDataset, schemaVersion: 9 }))),
    ).toMatchObject({ ok: false, error: "invalid-dataset" });
  });

  it("surfaces storage read and quota errors", () => {
    const readFailure = mockStorage();
    vi.mocked(readFailure.getItem).mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    expect(loadDataset(readFailure)).toMatchObject({ ok: false, error: "storage-read-failed" });

    const quotaFailure = mockStorage();
    vi.mocked(quotaFailure.setItem).mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    expect(saveDataset(validDataset, quotaFailure)).toMatchObject({
      ok: false,
      error: "storage-write-failed",
    });
  });
});
