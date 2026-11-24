# Catalog Domain Contract

## Purpose

`@portal-guanabara/catalog-domain` is the **Domain** of the catalog (Core v2.0, "Alignment with the application architecture"): the workbook importer and the read services the web app uses. There is no BFF: the web app's own server routes (`apps/clients-webapp/server/api/catalog/*`) call these read services.

```text
mapping workbook (.xlsx today, Google Sheets later)
  ↓  importer (pnpm catalog:import) — Core v2.0 rules, all or nothing (D-044)
data/catalog-snapshot.json + data/import-report.md   (reviewed in Git)
  ↓  read services (getCatalogReader)
clients-webapp server routes /api/catalog/*  →  Service → Hook → Page
```

When PostgreSQL arrives, the importer writes the database instead of the snapshot and `getCatalogReader()` reads it. The `CatalogReader` contract and `./contracts` stay the same, so nothing in the web app changes.

## Entry points

| Import | Who | What |
|---|---|---|
| `@portal-guanabara/catalog-domain` | server routes, tools, tests | `getCatalogReader`, `createCatalogReader`, `importCatalog`, snapshot model |
| `@portal-guanabara/catalog-domain/contracts` | web app Services, Hooks, Pages | **types only** (`import type`) — the API's response shapes |

`pnpm architecture:validate` rejects any other import from `apps/clients-webapp/src`, and value imports of the contracts.

## Rules

- **Framework-free.** No Vue, Nuxt, h3, App or Presentation Lake imports. Allowed: relative files, `node:*`, `read-excel-file`.
- **Core v2.0 is the reference.** Shapes follow its tables; rules follow its import section. A rule that is only Proposed there produces a warning, not an error, until BVRio confirms it.
- **Placeholders are absences** (D-032): `não se aplica`, `não encontrado`, `sem informação`, `Não confirmado` are never stored as values; the report counts them.
- **Partial dates keep their precision** (D-033) and are compared only as precisely as the coarser date.
- **Workbook IDs are the public references** (D-047); the snapshot is sorted by them and the report lists IDs added and retired since the previous import.
- **Only publishable data** (D-042): Pendências, Lacunas and Categorias are not imported. Person names can be left out entirely with `--without-persons`; the web app also hides them unless the `catalogPersonNames` flag is on.
- **Codes:** fixed value lists use English codes (D-050); reference lists use ASCII slugs of their Portuguese names until the workbook has a code column.
- **Pure transform.** `importCatalog` does no I/O; the CLI reads the file and writes the outputs. Tests use in-memory workbooks (`src/testing/workbookFixture.ts`).
- Relative imports keep explicit `.ts` extensions so the CLI runs on Node's built-in TypeScript support.

## Commands

```bash
pnpm catalog:import --file ~/Downloads/mapeamento.xlsx              # writes data/catalog-snapshot.json + data/import-report.md
pnpm catalog:import --file ~/Downloads/mapeamento.xlsx --dry-run    # validate only, print the report
pnpm catalog:import --file ~/Downloads/mapeamento.xlsx --without-persons
```

A rejected import (any error) leaves the snapshot unchanged and still writes the report.

## Verification

```bash
pnpm --filter @portal-guanabara/catalog-domain typecheck
pnpm --filter @portal-guanabara/catalog-domain test
pnpm architecture:validate
```
