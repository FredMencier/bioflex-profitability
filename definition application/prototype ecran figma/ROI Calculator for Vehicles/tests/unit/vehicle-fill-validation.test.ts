import { describe, expect, it } from "vitest";
import { validateFillInput, validateVehicleInput } from "@/domain/forms";

describe("vehicle form validation", () => {
  it("requires a make, model, positive box cost, and valid installation date", () => {
    expect(
      validateVehicleInput({ make: " ", model: "308", boxCostEur: 1000, installDate: "2026-01-01" }),
    ).toBeNull();
    expect(
      validateVehicleInput({ make: "Peugeot", model: "308", boxCostEur: 0, installDate: "2026-01-01" }),
    ).toBeNull();
    expect(
      validateVehicleInput({ make: "Peugeot", model: "308", boxCostEur: 1000, installDate: "2026-02-30" }),
    ).toBeNull();
  });

  it("trims valid vehicle names", () => {
    expect(
      validateVehicleInput({ make: " Peugeot ", model: " 308 ", boxCostEur: 1000, installDate: "2026-01-01" }),
    ).toMatchObject({ make: "Peugeot", model: "308" });
  });
});

describe("fill form validation", () => {
  const recordedAt = new Date("2026-10-18T19:10:00.000Z");
  const validInput = {
    e85PricePerLitreEur: 0.9,
    sp95PricePerLitreEur: 1.8,
    litres: 40,
  };

  it("requires positive finite prices and litres", () => {
    expect(validateFillInput({ ...validInput, e85PricePerLitreEur: 0 }, "2026-10-18", recordedAt)).toBeNull();
    expect(validateFillInput({ ...validInput, sp95PricePerLitreEur: Number.NaN }, "2026-10-18", recordedAt)).toBeNull();
    expect(validateFillInput({ ...validInput, litres: -1 }, "2026-10-18", recordedAt)).toBeNull();
  });

  it("rejects fills before installation and accepts valid inputs", () => {
    expect(validateFillInput(validInput, "2026-10-19", recordedAt)).toBeNull();
    expect(validateFillInput(validInput, "2026-10-18", recordedAt)).toEqual(validInput);
  });
});
