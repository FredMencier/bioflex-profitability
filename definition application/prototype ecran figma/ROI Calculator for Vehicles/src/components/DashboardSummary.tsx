import type { Vehicle } from "@/domain/dataset";
import type { VehicleRoi } from "@/domain/roi";
import { Icon, type IconName } from "@/components/Icon";

function money(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function DashboardSummary({ vehicle, roi }: { vehicle: Vehicle; roi: VehicleRoi }) {
  const latestFill = [...vehicle.fills].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0];
  const progress = Math.max(0, Math.min(roi.amortizationPercentage, 100));
  const averageIcon: IconName = roi.averageSavingsPerFillEur < 0 ? "droplet" : "leaf";

  return (
    <section className="stats-grid" aria-label="Synthèse de rentabilité">
      <StatCard icon="leaf" iconTone="green" label="ÉCONOMIES NETTES" value={money(roi.totalSavingsEur)} note="Total calculé sur vos pleins" />
      <StatCard icon="clock" iconTone="amber" label="RESTE À AMORTIR" value={money(roi.remainingToAmortizeEur)} progress={progress} note={`${Math.round(progress)} % du boîtier`} />
      <StatCard icon="fuel" iconTone="blue" label="PLEINS ENREGISTRÉS" value={String(vehicle.fills.length)} note={latestFill ? `Dernier plein le ${dateLabel(latestFill.recordedAt)}` : "Ajoutez votre premier plein"} />
      <StatCard icon={averageIcon} iconTone="purple" label="ÉCONOMIE MOYENNE / PLEIN" value={money(roi.averageSavingsPerFillEur)} note={vehicle.fills.length ? "Moyenne de vos économies nettes" : "Aucune donnée de plein"} />
    </section>
  );
}

function StatCard({
  icon,
  iconTone,
  label,
  value,
  note,
  progress,
}: {
  icon: IconName;
  iconTone: string;
  label: string;
  value: string;
  note: string;
  progress?: number;
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${iconTone}`}><Icon name={icon} size={21} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {progress !== undefined && <div className="progress"><span style={{ width: `${progress}%` }} /></div>}
      <div className="stat-note">{note}</div>
    </article>
  );
}

function dateLabel(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(value));
}
