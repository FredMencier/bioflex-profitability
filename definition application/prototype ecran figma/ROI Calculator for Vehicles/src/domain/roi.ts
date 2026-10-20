import type { Fill, Vehicle } from "@/domain/dataset";

const E85_SURCONSUMPTION_FACTOR = 0.8;

export type FillCosts = {
  e85CostEur: number;
  sp95EquivalentCostEur: number;
  savingEur: number;
};

export type VehicleRoi = {
  boxCostEur: number;
  e85TotalCostEur: number;
  sp95EquivalentTotalCostEur: number;
  totalSavingsEur: number;
  remainingToAmortizeEur: number;
  averageSavingsPerFillEur: number;
  amortizationPercentage: number;
  fillsUntilAmortized: number | null;
};

export function roundCurrency(value: number): number {
  if (!Number.isFinite(value)) return value;
  const rounded = Math.sign(value) * Math.round((Math.abs(value) + Number.EPSILON) * 100) / 100;
  return rounded === 0 ? 0 : rounded;
}

export function calculateFillCosts(fill: Fill): FillCosts {
  const e85CostEur = roundCurrency(fill.e85PricePerLitreEur * fill.litres);
  const sp95EquivalentCostEur = roundCurrency(
    fill.sp95PricePerLitreEur * fill.litres * E85_SURCONSUMPTION_FACTOR,
  );

  return {
    e85CostEur,
    sp95EquivalentCostEur,
    savingEur: roundCurrency(sp95EquivalentCostEur - e85CostEur),
  };
}

export function calculateVehicleRoi(vehicle: Pick<Vehicle, "boxCostEur" | "fills">): VehicleRoi {
  const fillCosts = vehicle.fills.map(calculateFillCosts);
  const e85TotalCostEur = roundCurrency(fillCosts.reduce((sum, costs) => sum + costs.e85CostEur, 0));
  const sp95EquivalentTotalCostEur = roundCurrency(
    fillCosts.reduce((sum, costs) => sum + costs.sp95EquivalentCostEur, 0),
  );
  const totalSavingsEur = roundCurrency(fillCosts.reduce((sum, costs) => sum + costs.savingEur, 0));
  const remainingToAmortizeEur = roundCurrency(roundCurrency(vehicle.boxCostEur) - totalSavingsEur);
  const averageSavingsPerFillEur = vehicle.fills.length > 0
    ? roundCurrency(totalSavingsEur / vehicle.fills.length)
    : 0;
  const amortizationPercentage = vehicle.boxCostEur > 0
    ? totalSavingsEur / vehicle.boxCostEur * 100
    : 0;
  const fillsUntilAmortized = remainingToAmortizeEur <= 0
    ? 0
    : averageSavingsPerFillEur > 0
      ? Math.ceil(remainingToAmortizeEur / averageSavingsPerFillEur)
      : null;

  return {
    boxCostEur: roundCurrency(vehicle.boxCostEur),
    e85TotalCostEur,
    sp95EquivalentTotalCostEur,
    totalSavingsEur,
    remainingToAmortizeEur,
    averageSavingsPerFillEur,
    amortizationPercentage,
    fillsUntilAmortized,
  };
}
