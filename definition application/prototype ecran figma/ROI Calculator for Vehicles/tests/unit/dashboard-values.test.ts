import { describe, expect, it } from "vitest";
import type { Fill } from "@/domain/dataset";
import { calculateVehicleRoi } from "@/domain/roi";

const fill: Fill = {
  id: "844b82a0-90ec-4879-a0b0-1e82a8893b18",
  recordedAt: "2026-10-18T19:10:00.000Z",
  e85PricePerLitreEur: 0.9,
  sp95PricePerLitreEur: 1.8,
  litres: 40,
};

describe("dashboard aggregates", () => {
  it("sums fill savings, computes the average, and keeps the full remaining balance", () => {
    const result = calculateVehicleRoi({
      boxCostEur: 1000,
      fills: [fill, { ...fill, id: "944b82a0-90ec-4879-a0b0-1e82a8893b18", litres: 20 }],
    });

    expect(result.totalSavingsEur).toBe(32.4);
    expect(result.averageSavingsPerFillEur).toBe(16.2);
    expect(result.remainingToAmortizeEur).toBe(967.6);
    expect(result.fillsUntilAmortized).toBe(60);
  });

  it("returns empty-state values when the vehicle has no fills", () => {
    expect(calculateVehicleRoi({ boxCostEur: 1000, fills: [] })).toMatchObject({
      totalSavingsEur: 0,
      remainingToAmortizeEur: 1000,
      averageSavingsPerFillEur: 0,
      amortizationPercentage: 0,
      fillsUntilAmortized: null,
    });
  });
});
