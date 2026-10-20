import { useState, type FormEvent } from "react";
import { validateFillInput, type FillFormValues } from "@/domain/forms";
import { Icon } from "@/components/Icon";

export function FillForm({
  installDate,
  onSubmit,
  onCancel,
}: {
  installDate: string;
  onSubmit: (fill: FillFormValues) => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fill = validateFillInput({
      e85PricePerLitreEur: Number(form.get("e85PricePerLitreEur")),
      sp95PricePerLitreEur: Number(form.get("sp95PricePerLitreEur")),
      litres: Number(form.get("litres")),
    }, installDate);
    if (!fill) {
      setError("Saisissez des prix et un volume supérieurs à 0. La date du plein doit suivre l'installation.");
      return;
    }
    onSubmit(fill);
  }

  return (
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="fill-form-title">
      <div className="modal-head">
        <div><h2 id="fill-form-title">Ajouter un plein</h2><p>Les économies sont calculées automatiquement.</p></div>
        <button type="button" onClick={onCancel} aria-label="Fermer"><Icon name="close" /></button>
      </div>
      <form onSubmit={submit} noValidate>
        <div className="form-row">
          <label>Prix E85 / litre (€)<input name="e85PricePerLitreEur" type="number" min="0.001" step="0.001" placeholder="0,82" required /></label>
          <label>Prix SP95 / litre (€)<input name="sp95PricePerLitreEur" type="number" min="0.001" step="0.001" placeholder="1,86" required /></label>
        </div>
        <label>Volume du plein (litres)<input name="litres" type="number" min="0.1" step="0.1" placeholder="45,5" required /></label>
        <div className="formula-note"><Icon name="leaf" size={19} /><span>Le coût SP95 équivalent tient compte d'une surconsommation E85 estimée à 20 %. La date du plein est enregistrée automatiquement.</span></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-ghost" type="button" onClick={onCancel}>Annuler</button>
          <button className="btn btn-primary" type="submit">Enregistrer le plein</button>
        </div>
      </form>
    </section>
  );
}
