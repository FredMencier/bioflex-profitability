"use client";

import { useEffect, useRef, useState } from "react";
import type { Dataset, Fill, Vehicle } from "@/domain/dataset";
import { createEmptyDataset, validateDataset } from "@/domain/dataset";
import type { FillFormValues, VehicleFormValues } from "@/domain/forms";
import { calculateVehicleRoi } from "@/domain/roi";
import { loadDataset, saveDataset } from "@/storage/localDatasetStorage";
import { DashboardSummary } from "@/components/DashboardSummary";
import { DataFileControls } from "@/components/DataFileControls";
import { FillForm } from "@/components/FillForm";
import { FillHistory } from "@/components/FillHistory";
import { Icon } from "@/components/Icon";
import { LocalDataNotice } from "@/components/LocalDataNotice";
import { SavingsCharts } from "@/components/SavingsCharts";
import { VehicleForm } from "@/components/VehicleForm";
import { VehicleSelector } from "@/components/VehicleSelector";

type Modal = "vehicle" | "fill" | "data" | null;

export function CalculatorApp() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState("");
  const [storageError, setStorageError] = useState<string | null>(null);
  const datasetRef = useRef<Dataset | null>(null);

  useEffect(() => {
    const result = loadDataset();
    const initialDataset = result.ok ? result.dataset : createEmptyDataset();
    datasetRef.current = initialDataset;
    setDataset(initialDataset);
    setActiveVehicleId(initialDataset.vehicles[0]?.id ?? null);
    if (!result.ok) setStorageError(storageMessage(result.error));
    setIsHydrated(true);

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/bioflex-profitability/sw.js", {
        scope: "/bioflex-profitability/",
      }).catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const activeVehicle = dataset?.vehicles.find((vehicle) => vehicle.id === activeVehicleId)
    ?? dataset?.vehicles[0]
    ?? null;
  const roi = activeVehicle ? calculateVehicleRoi(activeVehicle) : null;

  function commitDataset(update: (current: Dataset) => Dataset): Dataset | null {
    const current = datasetRef.current;
    if (!current) return null;

    const validation = validateDataset({
      ...update(current),
      updatedAt: new Date().toISOString(),
    });
    if (!validation.ok) {
      setStorageError("Une modification n'a pas pu être validée et n'a pas été enregistrée.");
      return null;
    }

    const next = validation.dataset;
    datasetRef.current = next;
    setDataset(next);
    const saved = saveDataset(next);
    setStorageError(saved.ok ? null : "Le navigateur n'a pas pu enregistrer les données. Exportez-les dès que possible.");
    return next;
  }

  function addVehicle(values: VehicleFormValues) {
    const now = new Date();
    const vehicle: Vehicle = {
      id: crypto.randomUUID(),
      make: values.make,
      model: values.model,
      boxCostEur: values.boxCostEur,
      installDate: values.installDate,
      createdAt: now.toISOString(),
      fills: [],
    };
    if (!commitDataset((current) => ({ ...current, vehicles: [...current.vehicles, vehicle] }))) return;
    setActiveVehicleId(vehicle.id);
    setModal(null);
    setNotice("Véhicule enregistré");
  }

  function addFill(values: FillFormValues) {
    if (!activeVehicle) return;
    const fill: Fill = {
      id: crypto.randomUUID(),
      recordedAt: new Date().toISOString(),
      ...values,
    };
    if (!commitDataset((current) => ({
      ...current,
      vehicles: current.vehicles.map((vehicle) => vehicle.id === activeVehicle.id
        ? { ...vehicle, fills: [...vehicle.fills, fill] }
        : vehicle),
    }))) return;
    setModal(null);
    setNotice("Plein enregistré");
  }

  function importDataset(imported: Dataset) {
    const next = commitDataset(() => imported);
    if (!next) return;
    setActiveVehicleId(next.vehicles[0]?.id ?? null);
    setModal(null);
    setNotice("Données JSON importées");
  }

  if (!isHydrated || !dataset) {
    return <main className="loading-screen" aria-busy="true"><span className="brand-mark"><Icon name="brand" size={26} /></span><p>Chargement de vos données locales…</p></main>;
  }

  const title = activeVehicle ? `${activeVehicle.make} ${activeVehicle.model}` : "Mon espace Bioflex";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="brand"><div className="brand-mark"><Icon name="brand" size={26} /></div><span>Bioflex<span>ROI</span></span></div>
        <nav className="main-nav" aria-label="Navigation principale">
          <button className="nav-item active" onClick={() => setMobileNav(false)}><Icon name="dashboard" /><span>Tableau de bord</span></button>
          <button className="nav-item" onClick={() => setModal("data")}><Icon name="database" /><span>Données JSON</span></button>
        </nav>
        <VehicleSelector
          vehicles={dataset.vehicles}
          activeVehicleId={activeVehicle?.id ?? null}
          onSelect={(id) => { setActiveVehicleId(id); setMobileNav(false); }}
          onAdd={() => { setModal("vehicle"); setMobileNav(false); }}
        />
        <div className="sidebar-footer">
          <button className="nav-item" onClick={() => setModal("data")}><Icon name="help" /><span>À propos des données</span></button>
          <div className="profile local-profile"><div className="avatar"><Icon name="database" size={16} /></div><span><strong>Enregistrement local</strong><small>Sur cet appareil uniquement</small></span></div>
        </div>
      </aside>

      {mobileNav && <button className="nav-backdrop" onClick={() => setMobileNav(false)} aria-label="Fermer le menu" />}

      <main>
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Ouvrir le menu"><span /><span /><span /></button>
          <div><p>Tableau de bord</p><h1>{title}</h1></div>
          <div className="top-actions">
            {activeVehicle && <div className="install-pill"><Icon name="calendar" size={17} /><span>Installé le {dateLabel(activeVehicle.installDate)}</span></div>}
            {activeVehicle && <button className="btn btn-primary" onClick={() => setModal("fill")}><Icon name="plus" size={18} /> Ajouter un plein</button>}
            <button className="data-top-button" onClick={() => setModal("data")} aria-label="Ouvrir la gestion des données"><Icon name="database" /></button>
          </div>
        </header>

        <div className="content">
          {storageError && <LocalDataNotice error={storageError} />}
          {!activeVehicle || !roi ? (
            <section className="empty-dashboard">
              <div className="empty-illustration"><Icon name="car" size={34} /></div>
              <p className="eyebrow">VOTRE SUIVI E85 COMMENCE ICI</p>
              <h2>Ajoutez votre premier véhicule</h2>
              <p>Renseignez le coût de votre boîtier, puis enregistrez vos pleins pour suivre les économies réelles.</p>
              <button className="btn btn-primary" onClick={() => setModal("vehicle")}><Icon name="plus" size={18} /> Ajouter un véhicule</button>
              <button className="empty-import" onClick={() => setModal("data")}>ou importer une sauvegarde JSON</button>
            </section>
          ) : (
            <>
              <section className="welcome">
                <div><h2>Votre rentabilité E85</h2><p>Suivez l'amortissement de votre boîtier en un coup d'œil.</p></div>
                <div className="vehicle-summary"><span className="vehicle-icon large"><Icon name="car" size={23} /></span><div><small>VÉHICULE ACTIF</small><strong>{title}</strong><p>{activeVehicle.fills.length} plein{activeVehicle.fills.length === 1 ? "" : "s"} enregistré{activeVehicle.fills.length === 1 ? "" : "s"}</p></div></div>
              </section>
              <DashboardSummary vehicle={activeVehicle} roi={roi} />
              <SavingsCharts fills={activeVehicle.fills} roi={roi} />
              <section className="chart-grid lower history-grid"><FillHistory fills={activeVehicle.fills} /></section>
            </>
          )}
        </div>
      </main>

      <nav className="mobile-tabs" aria-label="Navigation mobile">
        <button className="active" onClick={() => setMobileNav(false)}><Icon name="dashboard" /><span>Accueil</span></button>
        <button onClick={() => setMobileNav(true)}><Icon name="car" /><span>Véhicules</span></button>
        <button className="mobile-add" onClick={() => setModal(activeVehicle ? "fill" : "vehicle")} aria-label={activeVehicle ? "Ajouter un plein" : "Ajouter un véhicule"}><Icon name="plus" size={23} /></button>
        <button onClick={() => setModal("data")}><Icon name="database" /><span>Données</span></button>
        <button onClick={() => setModal("vehicle")}><Icon name="plus" /><span>Ajouter</span></button>
      </nav>

      {modal && <div className="modal-backdrop" onMouseDown={() => setModal(null)}>
        <div onMouseDown={(event) => event.stopPropagation()}>
          {modal === "vehicle" && <VehicleForm onSubmit={addVehicle} onCancel={() => setModal(null)} />}
          {modal === "fill" && activeVehicle && <FillForm installDate={activeVehicle.installDate} onSubmit={addFill} onCancel={() => setModal(null)} />}
          {modal === "data" && <DataFileControls dataset={dataset} storageError={storageError} onImport={importDataset} onClose={() => setModal(null)} />}
        </div>
      </div>}

      {notice && <div className="toast" role="status"><span><Icon name="check" size={16} /></span>{notice}</div>}
    </div>
  );
}

function dateLabel(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
    .format(new Date(`${value}T12:00:00`));
}

function storageMessage(error: string): string {
  switch (error) {
    case "invalid-json":
      return "La sauvegarde locale est illisible. Vos données existantes n'ont pas été remplacées; importez une sauvegarde JSON valide.";
    case "invalid-dataset":
      return "La sauvegarde locale ne correspond pas au format Bioflex ROI pris en charge. Importez une sauvegarde valide.";
    default:
      return "Le navigateur n'a pas pu lire le stockage local. Les changements ne seront pas sauvegardés tant que l'accès n'est pas rétabli.";
  }
}
