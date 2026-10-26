"use client";

import { useEffect, useMemo, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import { GridComponent, LegendComponent, TooltipComponent } from "echarts/components";
import type { EChartsType, EChartsOption } from "echarts";
import { CanvasRenderer } from "echarts/renderers";
import type { Fill } from "@/domain/dataset";
import type { VehicleRoi } from "@/domain/roi";
import { calculateFillCosts, roundCurrency } from "@/domain/roi";

echarts.use([BarChart, LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

const green = "#278c67";
const orange = "#ee9c58";
const gridLine = "#edf0ee";

function money(value: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

function pricePerLitre(value: number): string {
  return `${new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 3 }).format(value)} €/L`;
}

function dateLabel(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" })
    .format(new Date(value));
}

export function SavingsCharts({ fills, roi }: { fills: Fill[]; roi: VehicleRoi }) {
  const chronological = useMemo(
    () => [...fills].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt)),
    [fills],
  );
  let runningSavings = 0;
  const cumulative = chronological.map((fill) => {
    runningSavings += calculateFillCosts(fill).savingEur;
    return roundChartValue(runningSavings);
  });
  const recent = chronological.slice(-8);
  const progress = Math.max(0, Math.min(roi.amortizationPercentage, 100));
  const paidOff = Math.max(0, Math.min(roi.totalSavingsEur, roi.boxCostEur));
  const outstanding = Math.max(roi.remainingToAmortizeEur, 0);

  const cumulativeOption: EChartsOption = {
    animation: false,
    grid: { left: 58, right: 16, top: 18, bottom: 35 },
    tooltip: { trigger: "axis", valueFormatter: (value) => money(Number(value)) },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: chronological.map((fill) => dateLabel(fill.recordedAt)),
      axisLine: { lineStyle: { color: gridLine } },
      axisLabel: { color: "#9da6a2", hideOverlap: true },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#9da6a2", formatter: (value: number) => `${Math.round(value)} €` },
      splitLine: { lineStyle: { color: gridLine, type: "dashed" } },
    },
    series: [{
      type: "line",
      data: cumulative,
      smooth: false,
      showSymbol: false,
      lineStyle: { color: green, width: 3 },
      itemStyle: { color: green },
      areaStyle: { color: "rgba(39, 140, 103, .14)" },
    }],
  };

  const comparisonOption: EChartsOption = {
    animation: false,
    color: [green, orange],
    grid: { left: 58, right: 16, top: 12, bottom: 42 },
    legend: { top: 0, right: 8, textStyle: { color: "#7f8985" } },
    tooltip: {
      trigger: "axis",
      triggerOn: "click",
      formatter: (params) => {
        const point = Array.isArray(params) ? params[0] : params;
        const fill = recent[point?.dataIndex];
        if (!fill) return "";

        const costs = calculateFillCosts(fill);
        return [
          `<strong>${dateLabel(fill.recordedAt)}</strong>`,
          `<div><span style="color:${green}">●</span> E85 payé : ${money(costs.e85CostEur)} · ${pricePerLitre(fill.e85PricePerLitreEur)}</div>`,
          `<div><span style="color:${orange}">●</span> SP95 équivalent : ${money(costs.sp95EquivalentCostEur)} · ${pricePerLitre(fill.sp95PricePerLitreEur)}</div>`,
        ].join("");
      },
    },
    xAxis: {
      type: "category",
      data: recent.map((fill) => dateLabel(fill.recordedAt)),
      axisLine: { lineStyle: { color: gridLine } },
      axisLabel: { color: "#9da6a2", hideOverlap: true },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#9da6a2", formatter: (value: number) => `${Math.round(value)} €` },
      splitLine: { lineStyle: { color: gridLine, type: "dashed" } },
    },
    series: [
      {
        name: "E85 payé",
        type: "bar",
        data: recent.map((fill) => calculateFillCosts(fill).e85CostEur),
        barMaxWidth: 24,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "SP95 équivalent",
        type: "bar",
        data: recent.map((fill) => calculateFillCosts(fill).sp95EquivalentCostEur),
        barMaxWidth: 24,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  const costTrendOption: EChartsOption = {
    animation: false,
    color: [green, orange],
    grid: { left: 58, right: 16, top: 35, bottom: 35 },
    legend: { top: 0, right: 8, textStyle: { color: "#7f8985" } },
    tooltip: { trigger: "axis", valueFormatter: (value) => money(Number(value)) },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: chronological.map((fill) => dateLabel(fill.recordedAt)),
      axisLine: { lineStyle: { color: gridLine } },
      axisLabel: { color: "#9da6a2", hideOverlap: true },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#9da6a2", formatter: (value: number) => `${Math.round(value)} €` },
      splitLine: { lineStyle: { color: gridLine, type: "dashed" } },
    },
    series: [
      {
        name: "E85 payé",
        type: "line",
        data: chronological.map((fill) => calculateFillCosts(fill).e85CostEur),
        showSymbol: true,
        symbolSize: 7,
        lineStyle: { color: green, width: 2.5 },
        itemStyle: { color: green },
      },
      {
        name: "SP95 équivalent",
        type: "line",
        data: chronological.map((fill) => calculateFillCosts(fill).sp95EquivalentCostEur),
        showSymbol: true,
        symbolSize: 7,
        lineStyle: { color: orange, width: 2.5 },
        itemStyle: { color: orange },
      },
    ],
  };

  const amortizationOption: EChartsOption = {
    animation: false,
    tooltip: { trigger: "item", formatter: "{b}: {c} € ({d}%)" },
    series: [{
      type: "pie",
      radius: ["66%", "86%"],
      avoidLabelOverlap: true,
      label: { show: false },
      itemStyle: { borderColor: "#fff", borderWidth: 4 },
      data: [
        { name: "Économisé", value: paidOff, itemStyle: { color: green } },
        { name: "Reste à amortir", value: outstanding, itemStyle: { color: "#e4ebe7" } },
      ],
    }],
  };

  return (
    <>
      <section className="chart-grid">
        <article className="panel cumulative">
          <div className="panel-head"><div><h3>Économies cumulées</h3><p>Progression nette depuis l'installation</p></div><span className="period">Depuis le début</span></div>
          {fills.length ? <Chart option={cumulativeOption} label="Courbe des économies nettes cumulées" className="chart-wrap echart" /> : <div className="empty-chart">La courbe apparaîtra après votre premier plein.</div>}
        </article>
        <article className="panel amortization">
          <div className="panel-head"><div><h3>Amortissement</h3><p>État du coût du boîtier</p></div></div>
          <div className="echart-donut">
            <Chart option={amortizationOption} label="Répartition de l'amortissement" className="echart echart-pie" />
            <div className="echart-center"><strong>{Math.round(progress)}%</strong><span>amorti</span></div>
          </div>
          <div className="donut-legend">
            <div><i className="dot green-dot" /><span>Économisé<strong>{money(roi.totalSavingsEur)}</strong></span></div>
            <div><i className="dot pale-dot" /><span>Reste<strong>{money(roi.remainingToAmortizeEur)}</strong></span></div>
          </div>
          <div className="forecast"><span className="forecast-icon">↗</span><span><strong>{roi.fillsUntilAmortized === null ? "Ajoutez des pleins pour estimer" : roi.fillsUntilAmortized === 0 ? "Boîtier amorti" : `Environ ${roi.fillsUntilAmortized} pleins restants`}</strong><small>Estimation basée sur vos économies moyennes</small></span></div>
        </article>
      </section>
      <section className="chart-grid lower">
        <article className="panel comparison">
          <div className="panel-head"><div><h3>Coût des pleins</h3><p>Cliquez sur une barre pour voir les prix au litre · SP95 ajusté de 20 %</p></div></div>
          {fills.length ? <Chart option={comparisonOption} label="Comparaison du coût E85 et du coût SP95 équivalent" className="echart echart-bars" /> : <div className="empty-chart">Aucune donnée à comparer.</div>}
        </article>
        <article className="panel cost-trend">
          <div className="panel-head"><div><h3>Coût total dans le temps</h3><p>Dépense par plein en E85 et en SP95 équivalent</p></div></div>
          {fills.length ? <Chart option={costTrendOption} label="Évolution du coût total des pleins E85 et SP95" className="echart echart-cost-trend" /> : <div className="empty-chart">Le graphique des dépenses apparaîtra après votre premier plein.</div>}
        </article>
      </section>
    </>
  );
}

function Chart({ option, label, className }: { option: EChartsOption; label: string; className: string }) {
  const element = useRef<HTMLDivElement>(null);
  const instance = useRef<EChartsType | null>(null);

  useEffect(() => {
    if (!element.current) return;
    const chart = echarts.init(element.current, undefined, { renderer: "canvas" });
    instance.current = chart;
    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(element.current);
    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      instance.current = null;
    };
  }, []);

  useEffect(() => {
    instance.current?.setOption(option, true);
  }, [option]);

  return <div ref={element} className={className} role="img" aria-label={label} />;
}

function roundChartValue(value: number): number {
  return roundCurrency(value);
}
