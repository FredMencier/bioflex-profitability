import { useState, type FormEvent } from "react";
import type { Fill } from "@/domain/dataset";
import { validateFillInput, type FillFormValues } from "@/domain/forms";
import { Icon } from "@/components/Icon";

export function FillForm({
  installDate,
  initialFill,
  onSubmit,
  onCancel,
}: {
  installDate: string;
  initialFill?: Fill;
  onSubmit: (fill: FillFormValues, recordedDate?: string) => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const recordedDate = initialFill ? String(form.get("recordedDate") ?? "") : undefined;
    const recordedAt = initialFill
      ? new Date(`${recordedDate ?? ""}${initialFill.recordedAt.slice(10)}`)
      : new Date();
    const fill = validateFillInput({
      e85PricePerLitreEur: Number(form.get("e85PricePerLitreEur")),
      sp95PricePerLitreEur: Number(form.get("sp95PricePerLitreEur")),
      litres: Number(form.get("litres")),
    }, installDate, recordedAt);
    if (!fill) {
      setError("Saisissez des prix et un volume supérieurs à 0. La date doit être comprise entre l'installation et aujourd'hui.");
      return;
    }
    onSubmit(fill, recordedDate);
  }

  return (
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="fill-form-title">
      <div className="modal-head">
        <div>
          <h2 id="fill-form-title">{initialFill ? "Modifier un plein" : "Ajouter un plein"}</h2>
          <p>{initialFill ? "Corrigez les données enregistrées pour ce plein." : "Les économies sont calculées automatiquement."}</p>
        </div>
        <button type="button" onClick={onCancel} aria-label="Fermer"><Icon name="close" /></button>
      </div>
      <form onSubmit={submit} noValidate>
        <div className="form-row">
          <label>Prix E85 / litre (€)<input name="e85PricePerLitreEur" type="number" min="0.001" step="0.001" placeholder="0,82" defaultValue={initialFill?.e85PricePerLitreEur} required /></label>
          <label>Prix SP95 / litre (€)<input name="sp95PricePerLitreEur" type="number" min="0.001" step="0.001" placeholder="1,86" defaultValue={initialFill?.sp95PricePerLitreEur} required /></label>
        </div>
        <label>Volume du plein (litres)<input name="litres" type="number" min="0.1" step="0.1" placeholder="45,5" defaultValue={initialFill?.litres} required /></label>
        {initialFill && <label>Date du plein<input name="recordedDate" type="date" min={installDate} max={new Date().toISOString().slice(0, 10)} defaultValue={initialFill.recordedAt.slice(0, 10)} required /></label>}
        <div className="formula-note"><Icon name="leaf" size={19} /><span>Le coût SP95 équivalent tient compte d'une surconsommation E85 estimée à 20 %. {initialFill ? "L'heure d'origine du plein est conservée." : "La date du plein est enregistrée automatiquement."}</span></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-ghost" type="button" onClick={onCancel}>Annuler</button>
          <button className="btn btn-primary" type="submit">{initialFill ? "Enregistrer les modifications" : "Enregistrer le plein"}</button>
        </div>
      </form>
    </section>
  );
}
