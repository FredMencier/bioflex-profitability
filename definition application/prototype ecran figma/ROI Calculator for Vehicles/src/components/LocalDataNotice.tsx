import { Icon } from "@/components/Icon";

export function LocalDataNotice({ error }: { error?: string | null }) {
  return (
    <aside className={`data-status ${error ? "data-status-warning" : ""}`}>
      <span><Icon name={error ? "warning" : "check"} size={17} /></span>
      <div>
        <strong>{error ? "Données non enregistrées" : "Données conservées sur cet appareil"}</strong>
        <p>{error ?? "Aucun compte ni synchronisation. Exportez un fichier JSON pour sauvegarder ou transférer vos données."}</p>
      </div>
    </aside>
  );
}
