# bioflex-profitability

Calculateur de rentabilité du boîtier Bioflex.

## Développement local

Prérequis : Node.js 22 et pnpm 10.34.3. Depuis la racine du dépôt :

```sh
cd "definition application/prototype ecran figma/ROI Calculator for Vehicles"
pnpm install --frozen-lockfile
pnpm dev
```

Ouvrez ensuite <http://localhost:3000/bioflex-profitability/>. Le serveur de développement sert l'application sous le même chemin de base que GitHub Pages.

## Tests

Lancer les tests unitaires :

```sh
pnpm test
```

Pour les tests navigateur, installez Chromium une première fois, puis lancez Playwright :

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

Playwright démarre automatiquement le serveur Next.js nécessaire aux tests.

## Build statique

```sh
pnpm build
```

Next.js génère le site statique dans `out/`. Ce dossier est destiné à GitHub Pages et doit être publié sous `/bioflex-profitability/`; il ne contient pas de serveur d'application.
