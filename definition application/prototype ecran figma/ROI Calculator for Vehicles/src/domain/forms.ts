export type VehicleFormValues = {
  make: string;
  model: string;
  boxCostEur: number;
  installDate: string;
};

export type FillFormValues = {
  e85PricePerLitreEur: number;
  sp95PricePerLitreEur: number;
  litres: number;
};

export function validateVehicleInput(input: VehicleFormValues): VehicleFormValues | null {
  const make = input.make.trim();
  const model = input.model.trim();
  if (!make || !model || !isFinitePositive(input.boxCostEur) || !isCalendarDate(input.installDate)) {
    return null;
  }
  return { ...input, make, model };
}

export function validateFillInput(
  input: FillFormValues,
  installDate: string,
  recordedAt = new Date(),
): FillFormValues | null {
  if (
    !isFinitePositive(input.e85PricePerLitreEur)
    || !isFinitePositive(input.sp95PricePerLitreEur)
    || !isFinitePositive(input.litres)
    || !isCalendarDate(installDate)
    || !Number.isFinite(recordedAt.getTime())
    || recordedAt.toISOString().slice(0, 10) < installDate
  ) {
    return null;
  }
  return input;
}

function isFinitePositive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
