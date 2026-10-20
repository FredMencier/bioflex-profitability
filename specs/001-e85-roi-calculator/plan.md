# Implementation Plan: Calculateur de rentabilité E85

**Branch**: `001-e85-roi-calculator` | **Date**: 2026-10-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification at `specs/001-e85-roi-calculator/spec.md`; UI and frontend technology reference at `definition application/prototype ecran figma/ROI Calculator for Vehicles`.

## Summary

Deliver the Figma prototype's responsive Bioflex ROI experience as a static Next.js application on GitHub Pages. Preserve its React 19 frontend, visual language, Tailwind CSS 4 styling, and Apache ECharts charts; migrate the build framework from Vite to Next.js App Router using TypeScript/TSX. Export static HTML/CSS/JS into `out/` with the project `basePath`. Keep one active structured JSON dataset in browser storage and provide manual JSON import/export; do not provide accounts, server-side authentication, remote storage, or automatic synchronization.

## Technical Context

**Language/Version**: TypeScript 5.7 in React `.tsx` files; Next.js 16 App Router with React 19. Node.js 22 is used only by GitHub Actions and local development/build commands; no Node.js runtime is deployed for the application.

**Primary Dependencies**: React 19, React DOM 19, Next.js 16, TypeScript 5.7, Tailwind CSS 4 via `@tailwindcss/postcss`, and Apache ECharts (`echarts`). Use browser Web APIs for local storage, file selection, JSON parsing, and downloads. Use Vitest for calculation/import validation and Playwright for browser-level acceptance checks. Remove Vite and `@tailwindcss/vite` from the application toolchain.

**Storage**: Store the active dataset as serialized, schema-versioned JSON in origin-scoped browser storage. Import validates a complete JSON document before replacing active data; export creates a downloadable plaintext JSON file. No data is sent to a remote storage service. The exported file, not browser storage, is the user's portable backup.

**Testing**: Vitest for ROI formulas, ECharts series data, schema validation, import replacement, export round-trips, and local persistence error handling; Playwright for responsive UI, chart rendering/resizing, reload persistence, manual file import/export, and malformed-file safety. Validate the published project-site path and GitHub Actions artifact/deployment workflow.

**Target Platform**: Modern desktop and mobile browsers; static HTTPS files on GitHub Pages. Next.js `output: 'export'` generates the deployable site; no API, serverless functions, authentication service, or application server.

**Project Type**: Static responsive React/Next.js App Router web application/PWA with TypeScript/TSX client components.

**Performance Goals**: Render a dashboard for a local dataset containing up to 1,000 fills in under 1 second after the static app has loaded; import and validate a typical JSON file in under 1 second. Validate on representative desktop and mobile browsers.

**Constraints**: Preserve the prototype's layout, responsive navigation, cards, chart hierarchy, colors and DM Sans/Manrope typography. Use Next.js App Router and export static assets with `output: 'export'`, `basePath: '/bioflex-profitability'`, and `trailingSlash: true`; deploy only `out/` through GitHub Actions. Interactive/localStorage/ECharts code must be in client components (`'use client'`). Do not use API routes, Server Actions, request-time dynamic features, or default server image optimization. Do not store personal data, credentials, or secrets in the repository or public build. Display clearly that local data is not account-protected and is not synchronized. Keep imports size-limited, schema-validated, and non-executable; render imported text as text.

**Scale/Scope**: One active dataset per browser origin/profile, with manual JSON files for separate people and device transfer. No multi-user account model, cross-device sync, server queries, or remote collaboration. Browser storage may be cleared or evicted; users must export backups. GitHub Pages serves a publicly accessible static app and must not contain private user datasets.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The checked-in constitution is an unfilled template (all principles and governance rules are placeholders), so it defines no ratified project gates.

| Gate | Status | Evidence |
|---|---|---|
| Scope traces to user requirements | PASS | Static GitHub Pages hosting, local JSON persistence, manual file transfer, and the Figma frontend are explicit in the specification or latest user instruction. |
| Data protection | PASS WITH LIMITS | There is no app authentication or data confidentiality. All personal data stays in the user's browser or plaintext export; the UI warns users not to share devices/files they do not trust. |
| Persistence and recovery | PASS WITH LIMITS | Browser storage retains the active working copy; manual JSON export/import is the backup and transfer mechanism. Browser clearing/eviction can lose unexported data. |
| Prototype compatibility | PASS | Frontend framework, styling system, visual patterns, and browser-local working copy are retained; fictional demo data is replaced by validated import/export. |

## Project Structure

### Documentation (this feature)

```text
specs/001-e85-roi-calculator/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
```text
definition application/prototype ecran figma/ROI Calculator for Vehicles/
├── src/
│   ├── app/                     # Next.js App Router: page.tsx, layout.tsx, globals.css
│   ├── components/              # Client components for forms, storage controls and ECharts
│   ├── domain/                  # Dataset schema and ROI calculations
│   └── storage/                 # Browser persistence and JSON import/export
├── public/                      # Static PWA shell and service worker, scoped to Pages base path
├── tests/
│   ├── unit/                     # Calculation, local persistence, import/export tests
│   └── e2e/                      # Responsive browser and file round-trip flows
├── .github/workflows/deploy-pages.yml # Build and publish out/ through GitHub Pages
├── next.config.ts                # Static export and GitHub Pages basePath
├── postcss.config.mjs            # Tailwind CSS 4 PostCSS plugin
└── package.json                 # Next.js, test and build scripts
```

**Structure Decision**: Migrate the supplied Figma Make React/Vite project to Next.js App Router while preserving reusable visual components and the established design. Move the main experience to `src/app/page.tsx`, global styles to `src/app/globals.css`, and keep reusable client components under `src/components/`. Configure `output: 'export'`, `basePath: '/bioflex-profitability'`, and `trailingSlash: true` in `next.config.ts`; GitHub Actions deploys `out/` and no Next.js server runs in production. Exclude `.figma/` build tooling and fictional demo data from the production bundle.

## Complexity Tracking

No constitution violations. The selected GitHub Pages-only model intentionally drops account authentication, private server storage, and automatic cross-device synchronization. Manual JSON import/export is the only supported transfer/backup path.

**Post-design gate**: PASS WITH PRODUCT LIMITS. The static build and project subpath are compatible with GitHub Pages. The app cannot protect local/exported data from other users with access to the same browser/device/file; the UI and quickstart must state this clearly.
