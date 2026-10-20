import { describe, expect, it } from "vitest";
import type { Fill, Vehicle } from "@/domain/dataset";
import { calculateFillCosts, calculateVehicleRoi, roundCurrency } from "@/domain/roi";

const fill: Fill = {
  id: "844b82a0-90ec-4879-a0b0-1e82a8893b18",
  recordedAt: "2026-10-18T19:10:00.000Z",
  e85PricePerLitreEur: 0.9,
  sp95PricePerLitreEur: 1.8,
  litres: 40,
};

const vehicle: Vehicle = {
  id: "a1c6d80a-40a4-4c30-ae4e-64ea3bb48afe",
  make: "Peugeot",
  model: "308",
  boxCostEur: 1000,
  installDate: "2026-10-18",
  createdAt: "2026-10-18T19:00:00.000Z",
  fills: [fill],
};

describe("E85 return on investment", () => {
  it("computes E85 cost, adjusted SP95 cost, and savings", () => {
    expect(calculateFillCosts(fill)).toEqual({
      e85CostEur: 36,
      sp95EquivalentCostEur: 57.6,
      savingEur: 21.6,
    });
  });

  it("preserves negative savings when E85 costs more", () => {
    expect(
      calculateFillCosts({
        ...fill,
        e85PricePerLitreEur: 1.5,
        sp95PricePerLitreEur: 1.2,
        litres: 20,
      }).savingEur,
    ).toBe(-10.8);
  });

  it("keeps an over-amortized balance negative and reports no fills remaining", () => {
    const result = calculateVehicleRoi({
      ...vehicle,
      boxCostEur: 10,
      fills: [{ ...fill, e85PricePerLitreEur: 1, sp95PricePerLitreEur: 3, litres: 10 }],
    });

    expect(result.totalSavingsEur).toBe(14);
    expect(result.remainingToAmortizeEur).toBe(-4);
    expect(result.amortizationPercentage).toBe(140);
    expect(result.fillsUntilAmortized).toBe(0);
  });

  it("rounds positive and negative values to currency cents", () => {
    expect(roundCurrency(1.005)).toBe(1.01);
    expect(roundCurrency(-1.005)).toBe(-1.01);
    expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
  });
});
