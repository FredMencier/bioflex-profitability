# Quickstart: Calculateur de rentabilité E85

This guide validates the implemented feature and its static GitHub Pages build.

## Prerequisites

- Node.js 22 and pnpm 10.34.3 for Next.js development, tests, and static build; no application server is installed or deployed.
- Repository metadata checked on 2026-10-20: `FredMencier/bioflex-profitability` is public, uses `main` as its default branch, and GitHub now reports Pages enabled (`has_pages: true`). Public repositories meet GitHub Free's repository visibility requirement. The Pages configuration endpoint does not yet return a site configuration or URL, so verify that the publishing source is set to GitHub Actions.
- Project URL: `https://fredmencier.github.io/bioflex-profitability/`; the application is configured with `/bioflex-profitability` as its `basePath`.
- **Policy confirmation**: GitHub's [Pages usage limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) prohibit using free Pages to run an online business, e-commerce site, or a site primarily facilitating commercial transactions or providing commercial SaaS. The owner confirmed on 2026-10-20 that this calculator is for personal, non-commercial use. The app has no checkout, payment, account, or synchronization.
- GitHub Pages has been enabled by the owner. Confirm GitHub Actions is selected as the source in repository settings. No additional policy-confirmation variable is required.
- Current decision (2026-10-20): personal use confirmed and Pages enabled; no deployment has been run from this local workspace.
- The app at `definition application/prototype ecran figma/ROI Calculator for Vehicles`.

## Local Setup

Run these commands from the prototype project directory:

```sh
pnpm install
```

The application uses `output: 'export'`, `basePath: '/bioflex-profitability'`, and `trailingSlash: true` in `next.config.ts`, with Tailwind configured through `@tailwindcss/postcss`. The GitHub Actions workflow builds the app and publishes only the `out/` directory. Do not place real user JSON files, credentials, or personal data in the repository or generated artifact; GitHub Pages is publicly accessible.

The app has no authentication or private account boundary. Each person should keep their own exported JSON file and import it when using the app; anyone with access to the same browser profile or file can read the active data.

## Run and Validate

```sh
pnpm dev
pnpm test
pnpm test:e2e
pnpm build
```

Expected local behavior: `pnpm dev` runs the Next.js development server locally. `pnpm build` runs `next build` and produces the static `out/` directory with URLs rooted at the configured Pages `basePath`. Pushes to `main` build and test the project, then deploy it when GitHub Pages is enabled with GitHub Actions as its source. The CI Node.js runtime is build-only; users' browsers load static files directly.

## End-to-End Scenarios

1. Open the app with no imported file, create a vehicle with the default 1,000 EUR box cost, change or confirm it, then save a fill with E85 at 0.90 EUR/L, SP95 at 1.80 EUR/L, and 40 L.
2. Verify the fill shows E85 cost 36.00 EUR, SP95-equivalent cost 57.60 EUR, saving 21.60 EUR, and remaining amortization 978.40 EUR. Verify the Apache ECharts cumulative line, comparison bars, and costs/savings pie use the same selected-vehicle data and resize on mobile.
3. Export the dataset as JSON, inspect that it is valid and contains the vehicle/fill inputs, then import it into a fresh browser profile and verify the same totals and charts.
4. Import another person's JSON after a non-empty dataset is active. Verify the app asks for confirmation before replacing the active data and that cancel leaves the original unchanged.
5. Try malformed JSON, an unsupported schema version, invalid values, and an oversized file. Verify each import is rejected without modifying the active dataset.
6. Open the app in another device/profile without importing the file. Verify no data appears automatically; import the exported file and verify the data is restored.
7. Test browser storage unavailable/quota errors, cleared data, and private-browsing behavior. Verify the UI explains that unexported data may be lost and does not claim server backup or privacy.
8. Verify desktop/mobile layouts retain the prototype's visual language and service-worker assets load under the configured repository base path.
9. After Pages is enabled, run the GitHub Actions deployment and inspect that `out/index.html` is at the Pages artifact root, `_next/` asset URLs include the configured `basePath`, and no JSON datasets or secrets are included.

## Storage and Load Gate

- Export and restore a JSON file before accepting a release; verify the round trip preserves all values and schema version.
- Exercise browser storage errors and cancelled downloads/imports; the app must report local-save limitations, preserve the active dataset on invalid/cancelled imports, and never claim a remote backup exists.
- Verify the deployed project subpath, Next.js exported asset URLs, PWA scope, and direct navigation behavior under GitHub Pages.
