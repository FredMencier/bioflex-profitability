# Tasks: Calculateur de rentabilité E85

**Input**: Documents de conception dans `specs/001-e85-roi-calculator/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`. Aucun contrat API: l'application est statique et n'expose pas de backend.

**Tests**: Des tests unitaires et navigateur sont inclus parce que la spécification et `quickstart.md` définissent des scénarios vérifiables pour les calculs, les données locales et l'import/export JSON.

**Project root**: `definition application/prototype ecran figma/ROI Calculator for Vehicles/`

## Phase 1: Setup

**Purpose**: Préparer le projet Figma existant pour les tests et la publication statique sur GitHub Pages.

- [X] T001 [P] Remplacer Vite par Next.js 16 et ajouter les scripts `dev`, `build`, `test`, `test:e2e` et les dépendances React 19, TypeScript, Tailwind/PostCSS, Vitest, Playwright et ECharts dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/package.json` et `definition application/prototype ecran figma/ROI Calculator for Vehicles/pnpm-lock.yaml`
- [X] T002 [P] Configurer `output: 'export'`, `basePath: '/bioflex-profitability'` et `trailingSlash: true` dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/next.config.ts`, ajuster `tsconfig.json` pour Next/TSX, puis créer `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx` et `src/app/globals.css`; migrer le shell de `src/App.tsx` vers la page interactive marquée `'use client'`, supprimer `vite.config.ts`, `index.html`, `src/main.tsx` et `src/index.css` après migration, et actualiser `public/manifest.webmanifest` et `public/sw.js` pour le sous-chemin GitHub Pages
- [X] T003 Créer `.github/workflows/deploy-pages.yml` à la racine du dépôt pour installer pnpm, exécuter les vérifications, lancer `next build` depuis `definition application/prototype ecran figma/ROI Calculator for Vehicles/`, publier son `out/` et déployer via GitHub Pages avec permissions minimales et actions épinglées
- [X] T004 Configurer Vitest et Playwright pour le projet existant dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/vitest.config.ts`, `definition application/prototype ecran figma/ROI Calculator for Vehicles/playwright.config.ts` et `definition application/prototype ecran figma/ROI Calculator for Vehicles/tests/setup.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Définir et valider le jeu JSON local partagé par les parcours; aucune story ne peut gérer des données avant cette base.

- [X] T005 Ajouter les tests en échec pour la version du document, les valeurs obligatoires, les nombres non valides et les erreurs de stockage local dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/tests/unit/dataset-storage.test.ts`
- [X] T006 Implémenter les types, la création d'un jeu vide et la validation complète du schéma JSON dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/src/domain/dataset.ts`
- [X] T007 [P] Implémenter le chargement, l'enregistrement et la gestion des erreurs du jeu actif dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/src/storage/localDatasetStorage.ts`, avec une clé namespacée et sans données fictives
- [X] T008 [P] Ajouter les tests en échec des formules E85/SP95, économies négatives, amortissement dépassé et arrondi monétaire dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/tests/unit/roi.test.ts`
- [X] T009 Implémenter les calculs déterministes de coûts, économies et amortissement à partir des types de `src/domain/dataset.ts` dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/src/domain/roi.ts`
- [X] T010 Initialiser l'application depuis `localDatasetStorage` après montage client, retirer les véhicules/KPI fictifs et afficher le jeu vide au premier lancement dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/src/app/page.tsx`

**Checkpoint**: Le schéma JSON, le stockage local et les calculs sont testés; l'application démarre sans données de démonstration.

---

## Phase 3: User Story 1 - Suivre la rentabilité d'un véhicule (Priority: P1) 🎯 MVP

**Goal**: Créer un véhicule, saisir son coût de boîtier et son premier plein, puis voir les coûts et économies exacts.

**Independent Test**: Créer un véhicule au coût par défaut de 1 000 €, saisir 40 L à 0,90 €/L E85 et 1,80 €/L SP95, puis vérifier les coûts de 36,00 €, 57,60 €, l'économie de 21,60 € et le restant de 978,40 €.

### Tests for User Story 1

- [X] T011 [US1] Ajouter les tests unitaires des champs requis/prix/volume et le scénario navigateur de création véhicule-premier plein dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/tests/unit/vehicle-fill-validation.test.ts` et `definition application/prototype ecran figma/ROI Calculator for Vehicles/tests/e2e/vehicle-roi.spec.ts`

### Implementation for User Story 1

- [X] T012 [P] [US1] Créer le formulaire véhicule dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/src/components/VehicleForm.tsx` avec marque, modèle, date d'installation et coût obligatoire prérempli à 1 000 € mais modifiable
- [X] T013 [P] [US1] Créer le formulaire de plein dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/src/components/FillForm.tsx` avec prix E85, prix SP95 et litres strictement positifs, validation des erreurs et date enregistrée automatiquement
- [X] T014 [US1] Relier les formulaires à l'état du véhicule actif, persister les ajouts dans le stockage local et afficher les montants calculés dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/src/app/page.tsx`

**Checkpoint**: Les scénarios US1 passent, y compris les données invalides, les économies négatives et un véhicule sans plein.

---

## Phase 4: User Story 3 - Gérer plusieurs véhicules (Priority: P1)

**Goal**: Sélectionner et suivre plusieurs véhicules sans mélanger leurs pleins, économies ou amortissements.

**Independent Test**: Créer deux véhicules avec des coûts et pleins différents, passer de l'un à l'autre et vérifier que chaque détail et total reste propre au véhicule sélectionné.

### Tests for User Story 3

- [X] T015 [US3] Ajouter le scénario navigateur de deux véhicules, de changement de sélection et de totaux isolés dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/tests/e2e/multiple-vehicles.spec.ts`

### Implementation for User Story 3

- [X] T016 [US3] Implémenter la liste et la sélection de véhicule, puis connecter l'historique et les totaux au véhicule sélectionné dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/src/components/VehicleSelector.tsx` et `definition application/prototype ecran figma/ROI Calculator for Vehicles/src/app/page.tsx`

**Checkpoint**: Le test multi-véhicules passe et les ajouts à un véhicule ne modifient pas l'autre.

---

## Phase 5: User Story 4 - Gérer son fichier JSON local (Priority: P1)

**Goal**: Importer le fichier d'une personne, modifier le jeu local, puis exporter le JSON complet pour sauvegarde ou transfert manuel.

**Independent Test**: Importer un fichier valide, ajouter des données, exporter et réimporter dans un profil de navigateur vierge; vérifier le round-trip complet et préserver le jeu actif lors d'un import invalide ou annulé.

### Tests for User Story 4

- [X] T017 [US4] Ajouter les tests en échec d'import/export, de document mal formé, de version inconnue, de fichier trop volumineux, de confirmation de remplacement, du message de confidentialité et de round-trip navigateur dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/tests/unit/dataset-files.test.ts` et `definition application/prototype ecran figma/ROI Calculator for Vehicles/tests/e2e/json-file-roundtrip.spec.ts`

### Implementation for User Story 4

- [X] T018 [P] [US4] Implémenter le parseur/validateur d'import et le générateur de téléchargement JSON dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/src/storage/datasetFile.ts`; refuser les fichiers trop volumineux, mal formés ou d'une version inconnue sans toucher au jeu actif
- [X] T019 [P] [US4] Créer l'avis local sur l'absence de compte/confidentialité et de synchronisation dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/src/components/LocalDataNotice.tsx`
- [X] T020 [US4] Ajouter les contrôles de sélection de fichier, confirmation avant remplacement et export, puis les intégrer à l'état actif dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/src/components/DataFileControls.tsx` et `definition application/prototype ecran figma/ROI Calculator for Vehicles/src/app/page.tsx`

**Checkpoint**: Le jeu actif peut être déplacé manuellement entre appareils par fichier JSON; un import invalide ou annulé ne détruit aucune donnée active.

---

## Phase 6: User Story 2 - Consulter l'évolution des économies (Priority: P2)

**Goal**: Afficher les économies cumulées, le restant à amortir, l'historique et les trois graphiques pour le véhicule sélectionné.

**Independent Test**: Charger plusieurs pleins datés et vérifier les totaux, la courbe cumulative chronologique, les barres E85/SP95 et la répartition circulaire dépense/économies, y compris en état vide et après amortissement.

### Tests for User Story 2

- [X] T021 [US2] Ajouter les tests d'agrégats et le scénario navigateur des graphiques, états vides et amortissement atteint dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/tests/unit/dashboard-values.test.ts` et `definition application/prototype ecran figma/ROI Calculator for Vehicles/tests/e2e/dashboard.spec.ts`

### Implementation for User Story 2

- [X] T022 [P] [US2] Créer les cartes de synthèse des économies, coûts et restant à amortir dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/src/components/DashboardSummary.tsx`
- [X] T023 [P] [US2] Créer avec Apache ECharts les graphiques chronologique, comparatif E85/SP95 et circulaire dépense/économies, ainsi que la liste des pleins, dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/src/components/SavingsCharts.tsx` et `definition application/prototype ecran figma/ROI Calculator for Vehicles/src/components/FillHistory.tsx`
- [X] T024 [US2] Intégrer les synthèses, graphiques et historique au tableau de bord du véhicule sélectionné dans `definition application/prototype ecran figma/ROI Calculator for Vehicles/src/app/page.tsx`, en conservant l'ordre des dates, les montants négatifs et les états vides

**Checkpoint**: Les données calculées à l'écran correspondent aux montants enregistrés pour chaque véhicule, même lorsque le restant à amortir devient négatif.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Vérifier la publication statique, la sécurité des données locales et les limites de GitHub Pages.

- [X] T025 Vérifier l'éligibilité du dépôt GitHub Pages, le chemin public du site et la conformité de l'usage Bioflex; consigner les prérequis confirmés dans `specs/001-e85-roi-calculator/quickstart.md`
  - Dépôt public, branche `main`, chemin `/bioflex-profitability/`, usage personnel/non commercial et Pages activé confirmés. Vérifier que la source de publication est GitHub Actions avant le premier déploiement.
- [X] T026 Exécuter les scénarios de `specs/001-e85-roi-calculator/quickstart.md`, `pnpm test`, `pnpm test:e2e` et `pnpm build` depuis `definition application/prototype ecran figma/ROI Calculator for Vehicles/`; vérifier `out/index.html`, les URLs sous `/bioflex-profitability/` et l'absence de JSON utilisateur dans l'artefact publié

---

## Dependencies & Execution Order

### Dependency Graph

```text
Setup -> Foundational -> US1 -> US3 -> US4 -> US2 -> Polish
```

### Phase Dependencies

- **Setup (Phase 1)**: Aucun prérequis; T001 et T002 peuvent commencer en parallèle. T003 attend T001/T002; T004 attend T001.
- **Foundational (Phase 2)**: Attend Setup; le schéma et le stockage local bloquent les parcours. Les tests du modèle précèdent son implémentation; tests ROI et stockage peuvent progresser en parallèle après le schéma.
- **User Stories (Phase 3+)**: Toutes attendent la Phase 2 et sont exécutées selon priorité P1 puis P2.
- **Polish (Phase 7)**: Attend les stories retenues, en particulier l'import/export et le tableau de bord.

### User Story Dependencies

- **User Story 1 (P1)**: Démarre après la fondation; crée le flux véhicule/plein de référence.
- **User Story 3 (P1)**: Suit US1; étend la sélection et isole les données entre véhicules.
- **User Story 4 (P1)**: Suit US1/US3 pour porter le jeu de données complet; son parseur et ses composants sont séparables, mais le raccordement à `App.tsx` est séquentiel.
- **User Story 2 (P2)**: Dépend des pleins de US1 et de la sélection de véhicule de US3; se vérifie indépendamment à partir d'un jeu de données de test.

### Parallel Opportunities

- **Setup**: T001 et T002 touchent des fichiers différents; T003/T004 suivent après leurs prérequis.
- **Foundational**: Après T006, T007 (stockage) et T008 (tests ROI) peuvent avancer en parallèle; T009 suit T008.
- **US1**: T012 (`VehicleForm.tsx`) et T013 (`FillForm.tsx`) sont indépendants jusqu'à leur raccordement T014.
- **US4**: Après T017, T018 (fichiers JSON) et T019 (avis de confidentialité) touchent des fichiers distincts; T020 les relie.
- **US2**: Après T021, T022 (synthèse) et T023 (graphiques/historique) sont indépendants jusqu'à T024.
- Les raccordements à `src/app/page.tsx` sont séquentiels pour éviter les conflits de modification.

### Parallel Example: User Story 1

```text
Après T011 :
T012 VehicleForm.tsx
T013 FillForm.tsx

Puis T014 raccorde les deux formulaires dans `src/app/page.tsx`.
```

### Parallel Example: User Story 4

```text
Après T017 :
T018 datasetFile.ts
T019 LocalDataNotice.tsx

Puis T020 raccorde l'import/export et l'avis dans `src/app/page.tsx`.
```

### Parallel Example: User Story 2

```text
Après T021 :
T022 DashboardSummary.tsx
T023 SavingsCharts.tsx et FillHistory.tsx

Puis T024 raccorde les composants au véhicule actif dans `src/app/page.tsx`.
```

**User Story 3**: Aucun travail d'implémentation parallèle sûr après T015: le sélecteur et l'état actif doivent être raccordés ensemble dans `VehicleSelector.tsx` et `src/app/page.tsx`.

## Implementation Strategy

### MVP Scope

La première tranche démontrable est **US1**: un véhicule et un plein calculé, stockés dans le navigateur. Le MVP conforme aux priorités P1 doit ensuite inclure **US3** (plusieurs véhicules) et **US4** (fichiers JSON personnels importables/exportables); **US2** améliore le tableau de bord et peut suivre en P2.

### Incremental Delivery

1. Terminer Setup et Foundational, puis vérifier schéma, stockage local et calculs.
2. Livrer US1 et valider un véhicule/plein ainsi que les formules.
3. Ajouter US3 et vérifier l'isolation de chaque véhicule.
4. Ajouter US4 et valider import/export et restauration manuelle.
5. Ajouter US2, puis exécuter les scénarios du quickstart et le build GitHub Pages.

### Validation Limits

- Aucun test ne doit supposer une connexion, une identité distante ou une synchronisation réseau.
- Les fichiers JSON sont en clair et peuvent être lus par toute personne ayant accès au fichier ou au profil de navigateur; les tests doivent confirmer que l'interface l'explique.
- Toute URL d'asset, manifeste ou service worker doit fonctionner sous le préfixe `/bioflex-profitability/`.
