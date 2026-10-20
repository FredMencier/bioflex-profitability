import { useRef, useState, type ChangeEvent } from "react";
import type { Dataset } from "@/domain/dataset";
import { Icon } from "@/components/Icon";
import { LocalDataNotice } from "@/components/LocalDataNotice";
import { MAX_DATASET_FILE_BYTES, parseDatasetFile, serializeDataset } from "@/storage/datasetFile";

export function DataFileControls({
  dataset,
  storageError,
  onImport,
  onClose,
}: {
  dataset: Dataset;
  storageError: string | null;
  onImport: (dataset: Dataset) => void;
  onClose: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  function exportData() {
    try {
      const file = new Blob([serializeDataset(dataset)], { type: "application/json" });
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bioflex-roi-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setError("");
    } catch {
      setError("Impossible de préparer le fichier JSON.");
    }
  }

  async function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (file.size > MAX_DATASET_FILE_BYTES) {
        setError("Le fichier dépasse la limite de 1 Mo.");
        return;
      }
      const result = parseDatasetFile(await file.text(), file.size);
      if (!result.ok) {
        setError(messageFor(result.error));
        return;
      }
      if (dataset.vehicles.length > 0 && !window.confirm("Cette importation remplacera toutes les données actuellement ouvertes. Continuer ?")) {
        return;
      }
      setError("");
      onImport(result.dataset);
    } catch {
      setError("Le fichier n'a pas pu être lu.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <section className="modal data-modal" role="dialog" aria-modal="true" aria-labelledby="data-controls-title">
      <div className="modal-head">
        <div><h2 id="data-controls-title">Données JSON</h2><p>Sauvegardez ou restaurez votre jeu de données local.</p></div>
        <button type="button" onClick={onClose} aria-label="Fermer"><Icon name="close" /></button>
      </div>
      <LocalDataNotice error={storageError} />
      <div className="data-actions">
        <button onClick={exportData}>
          <span className="data-action-icon"><Icon name="download" /></span>
          <span><strong>Exporter mes données</strong><small>Télécharger un fichier JSON complet</small></span>
          <Icon name="chevron" size={17} />
        </button>
        <button onClick={() => input.current?.click()}>
          <span className="data-action-icon import"><Icon name="upload" /></span>
          <span><strong>Importer une sauvegarde</strong><small>Remplace les données après confirmation</small></span>
          <Icon name="chevron" size={17} />
        </button>
      </div>
      <input ref={input} className="file-input" type="file" accept="application/json,.json" onChange={importData} aria-label="Choisir une sauvegarde JSON" />
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="json-details">
        <span>FORMAT</span><code>bioflex-roi-AAAA-MM-JJ.json</code>
        <span>TAILLE MAX.</span><p>1 Mo</p>
        <span>CONTENU</span><p>Véhicules, boîtiers et historique des pleins. Les totaux sont recalculés à l'ouverture.</p>
      </div>
      <div className="modal-actions"><button className="btn btn-ghost" type="button" onClick={onClose}>Fermer</button></div>
    </section>
  );
}

function messageFor(error: "file-too-large" | "invalid-json" | "invalid-dataset"): string {
  switch (error) {
    case "file-too-large":
      return "Le fichier dépasse la limite de 1 Mo.";
    case "invalid-json":
      return "Le fichier n'est pas un JSON valide.";
    case "invalid-dataset":
      return "Le fichier n'est pas une sauvegarde Bioflex ROI valide ou sa version n'est pas prise en charge.";
  }
}
