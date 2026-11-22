import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { VehicleForm } from "@/components/VehicleForm"
import type { Vehicle } from "@/domain/dataset"

const vehicle: Vehicle = {
  id: "a1c6d80a-40a4-4c30-ae4e-64ea3bb48afe",
  make: "Peugeot",
  model: "308",
  boxCostEur: 1000,
  installDate: "2026-10-18",
  createdAt: "2026-10-18T19:00:00.000Z",
  fills: [],
}

describe("vehicle form", () => {
  it("prefills and submits updated details for an existing vehicle", () => {
    const onSubmit = vi.fn()
    render(
      <VehicleForm
        initialVehicle={vehicle}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )

    expect(
      screen.getByRole("heading", { name: "Modifier un véhicule" }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Marque")).toHaveValue("Peugeot")
    expect(screen.getByLabelText("Modèle")).toHaveValue("308")
    expect(screen.getByLabelText("Coût du boîtier (€)")).toHaveValue(1000)
    expect(screen.getByLabelText("Date d'installation")).toHaveValue(
      "2026-10-18",
    )

    fireEvent.change(screen.getByLabelText("Marque"), {
      target: { value: " Citroën " },
    })
    fireEvent.change(screen.getByLabelText("Modèle"), {
      target: { value: " C3 " },
    })
    fireEvent.change(screen.getByLabelText("Coût du boîtier (€)"), {
      target: { value: "1250" },
    })
    fireEvent.click(
      screen.getByRole("button", { name: "Enregistrer les modifications" }),
    )

    expect(onSubmit).toHaveBeenCalledWith({
      make: "Citroën",
      model: "C3",
      boxCostEur: 1250,
      installDate: "2026-10-18",
    })
  })

  it("prevents changing installation to a date after an existing fill", () => {
    const onSubmit = vi.fn()
    const vehicleWithFill: Vehicle = {
      ...vehicle,
      fills: [
        {
          id: "844b82a0-90ec-4879-a0b0-1e82a8893b18",
          recordedAt: "2026-10-19T19:10:00.000Z",
          e85PricePerLitreEur: 0.9,
          sp95PricePerLitreEur: 1.8,
          litres: 40,
          byThirdParty: false,
        },
      ],
    }
    render(
      <VehicleForm
        initialVehicle={vehicleWithFill}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByLabelText("Date d'installation"), {
      target: { value: "2026-10-20" },
    })
    fireEvent.click(
      screen.getByRole("button", { name: "Enregistrer les modifications" }),
    )

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole("alert")).toHaveTextContent(
      "antérieure aux pleins enregistrés",
    )
  })
})
