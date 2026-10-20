import type { Fill } from "@/domain/dataset";
import { calculateFillCosts } from "@/domain/roi";

function money(value: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export function FillHistory({ fills }: { fills: Fill[] }) {
  const recentFills = [...fills].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));

  return (
    <article className="panel latest">
      <div className="panel-head"><div><h3>Historique des pleins</h3><p>Comparaison calculée à partir de vos prix saisis</p></div></div>
      <div className="fill-list">
        {recentFills.map((fill) => {
          const costs = calculateFillCosts(fill);
          const date = new Date(fill.recordedAt);
          return (
            <div className="fill-row" key={fill.id}>
              <div className="date-box"><strong>{date.getDate()}</strong><small>{new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date).replace(".", "")}</small></div>
              <div className="fill-info">
                <strong>{fill.litres.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} L d'E85</strong>
                <small>E85 payé {money(costs.e85CostEur)} · SP95 équivalent {money(costs.sp95EquivalentCostEur)}</small>
              </div>
              <div className={`saving ${costs.savingEur < 0 ? "negative" : ""}`}>
                <small>ÉCONOMIE</small><strong>{money(costs.savingEur)}</strong>
              </div>
            </div>
          );
        })}
        {!recentFills.length && <div className="empty-list">Aucun plein enregistré pour ce véhicule.</div>}
      </div>
    </article>
  );
}
