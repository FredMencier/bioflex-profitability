# Research: Calculateur de rentabilité E85

**Date**: 2026-10-19
**Feature**: [spec.md](./spec.md)
**Prototype**: `definition application/prototype ecran figma/ROI Calculator for Vehicles`

## Frontend Technology and Design

**Decision**: Migrate the Figma React prototype to React 19 with Next.js 16 App Router, TypeScript 5.7 in `.tsx` files, Tailwind CSS 4 through `@tailwindcss/postcss`, and Apache ECharts (`echarts`). Use Node.js 22 and pnpm 10.34.3 only to install, test, and build static assets; no server runtime is deployed.

**Rationale**: React 19 and the design assets/styles come from the prototype; Next.js replaces Vite at the user's direction and provides an App Router plus supported static export for GitHub Pages. Next's App Router components are written in TSX, Tailwind 4 uses its PostCSS plugin under Next, and ECharts renders the specified client-side visualizations. The existing `src/App.tsx` and `src/index.css` are migrated into the App Router rather than discarded; preserve the responsive dashboard, fixed desktop sidebar, mobile navigation, summary cards, charts, recent-fill list, and modal forms.

**Design details to preserve**:

- Bioflex identity, green accent (`#278c67`), pale green surfaces, neutral canvas, rounded cards, and restrained shadows.
- DM Sans for general UI text and Manrope for headings and key values.
- Desktop sidebar/dashboard composition, four summary cards, charts and recent activity; tablet stacking; mobile slide-out navigation, bottom tabs, and bottom-sheet forms.
- French-language labels and EUR formatting.
- Apache ECharts line, bar, and pie charts for cumulative savings, per-fill comparison, and costs-versus-savings distribution; initialize/dispose chart instances with their React component lifecycle and resize them with their responsive containers.

**Prototype behavior to preserve or replace**: The React prototype already serializes its active vehicle list in `localStorage`, which is a workable same-origin working copy for this static-only scope. Remove fictional demo vehicles/profile/KPI values; update the box cost default to 1,000 EUR; preserve negative and over-amortized totals. Add schema-versioned JSON import/export for user-controlled backups and transfer. The prototype has no user accounts or per-person privacy and must not claim that it does.

## Next.js Static Export and GitHub Pages

**Decision**: Configure Next.js App Router with `output: 'export'`, `basePath: '/bioflex-profitability'`, and `trailingSlash: true`; `next build` writes the static site to `out/`, which GitHub Actions publishes with GitHub Pages. If the Pages URL becomes a user/organization root site or custom domain, change the build-time `basePath` to empty. There is no API, serverless function, authentication service, or application server.

**Rationale**: The current Next.js documentation explicitly supports static exports on any static host and documents GitHub Pages deployment. `basePath` prefixes links and assets for the repository subpath; `trailingSlash: true` generates directory-style static routes that GitHub Pages can serve without rewrites. Local storage, forms, and ECharts require browser APIs and therefore live in client components; all other routes must be statically renderable at build time.

**Alternatives considered**:

- Keep Vite as the site generator: rejected by the user's explicit choice of Next.js.
- Add a Firebase/Supabase backend: rejected by the user in favor of GitHub Pages alone and local files.
- Use Next.js server features at runtime: rejected because GitHub Pages serves static files only and the user does not want an application server.

**Deployment details**: Add a GitHub Actions workflow triggered by pushes to the default branch; run install, tests, and `next build`; upload `out/` using `actions/upload-pages-artifact`; deploy with `actions/deploy-pages`. Grant only `contents: read`, `pages: write`, and `id-token: write`; use the `github-pages` environment and pin third-party actions to reviewed SHAs. Never put user datasets or secrets in the Pages artifact; Pages sites are publicly accessible even when the source repository is private.

**Static-export limitations**: The main dashboard and ECharts components need `'use client'` because they access localStorage, file APIs, and chart instances. Access browser APIs only after client mount because Next prerenders client components during `next build`. Do not use request-time APIs, cookies, Server Actions, dynamic routes without build-time parameters, runtime redirects/rewrites/headers, ISR, or the default server image optimizer; these require a runtime Next server and cannot run on GitHub Pages.

## Local Dataset and JSON File Handling

**Decision**: Keep one active JSON-serializable dataset in browser storage, namespaced to this app. Offer explicit import through a user-selected `.json` file and export by generating a downloadable JSON Blob. Each person keeps a separate exported file and imports it when needed; the app has no account or authentication and does not sync automatically.

**Rationale**: This retains convenient same-browser reload persistence while satisfying the manual per-person JSON file workflow without introducing a backend. A downloaded JSON file can be moved to another device by the user and imported there. Browser storage is origin-scoped, not user-scoped, so using a shared browser profile does not provide confidentiality.

**Import/export rules**:

- Parse and validate the complete JSON document, `schemaVersion`, value types, and size before replacing active data.
- Require explicit confirmation before replacing a non-empty active dataset. Invalid files or cancelled confirmation leave active data unchanged.
- Render imported strings as text, not HTML; never execute data from an imported file.
- Export the complete active dataset as ordinary plaintext JSON. The app does not encrypt files or control who can open them.
- Keep the active working copy in browser storage. Export is manual; an unexported change is not available on another device and can be lost if browser data is cleared/evicted.

**Risks and mitigations**:

- Browser storage may be unavailable, cleared, or evicted (including after private sessions). Catch storage failures, warn users, and prominently offer export as the backup path.
- `localStorage` is synchronous, stores strings, and is scoped to origin; use an app-specific key to avoid collisions with other GitHub Pages projects on the same `owner.github.io` origin. If dataset size grows, consider IndexedDB without implying cloud sync or account security.
- Exported JSON is plaintext and user-controlled. Do not claim account-level privacy; validate imported documents, limit file size, and display imported values as inert text.
- GitHub Pages project sites live below `/<repository>/`; Next `basePath`, exported links, public assets, service-worker scope, and cache URLs must respect the configured path.
- GitHub Pages usage policy cautions against using the free service primarily for commercial transactions or commercial SaaS. Confirm the Bioflex calculator's intended public use remains within current GitHub Pages terms before production.

**Alternative**: File System Access API could edit a selected file in place but is not uniformly supported and requires permission prompts. Explicit import/export is the more portable cross-browser behavior.

## Private Data and Service Worker

**Decision**: Keep the service worker limited to static app-shell assets and never include user datasets in the build cache. Clear in-memory form/dataset state when the user resets or replaces the active dataset.

**Rationale**: Browser-local data is not served by GitHub Pages, but service-worker caches and imported files are still local device data. Keep the distinction between public static assets and private-to-the-device working data explicit; no static asset, GitHub commit, or Pages artifact may contain a real user dataset.

## Validation Strategy

- Unit-test ROI calculations, schema/version validation, corrupt JSON, and import replacement behavior.
- Unit-test the financial formulas, monetary rounding, positive-value validation, and installation-date rule.
- Test JSON export/import round trips and prove invalid or unsupported files do not replace active data.
- Use browser tests for dashboard rendering, local persistence after reload, file selection/download, responsive navigation, and service-worker base-path behavior.
- Verify a second device/profile does not see the data until the user manually imports the JSON file.
- Verify storage errors and private-browsing behavior produce accurate loss warnings and never claim remote backup/sync.
- Build under the exact GitHub Pages repository base, inspect artifact contents, and verify the Pages workflow publishes `index.html` at the artifact root.

## References

- Prototype evidence: `AGENTS.md`, `package.json`, `.mise.toml`, `src/App.tsx`, `src/index.css`, `public/sw.js`, and `public/manifest.webmanifest` in the supplied Figma project.
- [What is GitHub Pages?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages): static site hosting scope and public accessibility.
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages/): build and deploy static artifacts with Actions.
- [GitHub Pages limits and policies](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits): published-site constraints and commercial-use caveat.
- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports): `output: 'export'`, `out/` artifact, supported features and server-only limitations.
- [Next.js `basePath`](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath): prefix links and assets for the GitHub project-site subpath.
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs): install `@tailwindcss/postcss` and import Tailwind in App Router global CSS.
- [Apache ECharts](https://echarts.apache.org/en/index.html): browser-side charting library for line, bar, and pie visualizations.
- [MDN Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) and [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage): origin-scoped string persistence and errors.
- [MDN storage quotas/eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria): best-effort storage and possible eviction.
- [MDN File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API), [file input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file), [download attribute](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/download), and [XSS guidance](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS): safe manual JSON file handling.
