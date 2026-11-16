import { useState, type FormEvent } from "react";
import { validateVehicleInput, type VehicleFormValues } from "@/domain/forms";
import type { Vehicle } from "@/domain/dataset";
import { Icon } from "@/components/Icon";

export function VehicleForm({
  initialVehicle,
  onSubmit,
  onCancel,
}: {
  initialVehicle?: Vehicle;
  onSubmit: (vehicle: VehicleFormValues) => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const latestInstallDate = initialVehicle?.fills.reduce(
    (latest, fill) => {
      const fillDate = fill.recordedAt.slice(0, 10);
      return fillDate < latest ? fillDate : latest;
    },
    today,
  ) ?? today;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const vehicle = validateVehicleInput({
      make: String(form.get("make") ?? ""),
      model: String(form.get("model") ?? ""),
      boxCostEur: Number(form.get("boxCostEur")),
      installDate: String(form.get("installDate") ?? ""),
    }, latestInstallDate);
    if (!vehicle) {
      setError(initialVehicle
        ? "Vérifiez la marque, le modèle, le coût et la date d'installation, qui doit rester antérieure aux pleins enregistrés."
        : "Renseignez la marque, le modèle, une date valide et un coût supérieur à 0 €.");
      return;
    }
    onSubmit(vehicle);
  }

  const title = initialVehicle ? "Modifier un véhicule" : "Ajouter un véhicule";
  const submitLabel = initialVehicle ? "Enregistrer les modifications" : "Enregistrer le véhicule";

  return (
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="vehicle-form-title">
      <div className="modal-head">
        <div><h2 id="vehicle-form-title">{title}</h2><p>Configurez le suivi de votre boîtier Bioflex.</p></div>
        <button type="button" onClick={onCancel} aria-label="Fermer"><Icon name="close" /></button>
      </div>
      <form onSubmit={submit} noValidate>
        <label>Marque<input name="make" autoComplete="organization" placeholder="Ex. Peugeot" defaultValue={initialVehicle?.make} required /></label>
        <label>Modèle<input name="model" placeholder="Ex. 308 PureTech 130" defaultValue={initialVehicle?.model} required /></label>
        <div className="form-row">
          <label>Coût du boîtier (€)<input name="boxCostEur" type="number" min="0.01" step="0.01" defaultValue={initialVehicle?.boxCostEur ?? 1000} required /></label>
          <label>Date d'installation<input name="installDate" type="date" max={latestInstallDate} defaultValue={initialVehicle?.installDate ?? today} required /></label>
        </div>
        <p className="form-hint">{initialVehicle ? "La date d'installation doit rester antérieure aux pleins déjà enregistrés." : "Le coût proposé est de 1 000 €. Vous pouvez le modifier selon votre facture."}</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-ghost" type="button" onClick={onCancel}>Annuler</button>
          <button className="btn btn-primary" type="submit">{submitLabel}</button>
        </div>
      </form>
    </section>
  );
}
