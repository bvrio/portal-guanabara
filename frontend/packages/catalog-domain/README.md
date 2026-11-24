# @portal-guanabara/catalog-domain

Workbook importer and read services of the Portal Guanabara catalog. See [AGENTS.md](./AGENTS.md) for the contract.

- `src/importer/` — reads the mapping workbook and applies the Core v2.0 rules (`importCatalog`, pure).
- `src/model/snapshot.ts` — the snapshot model, shaped after the Core v2.0 tables.
- `src/read/` — `createCatalogReader` (overview, list with facets, details) and `getCatalogReader` over the published snapshot.
- `src/contracts/` — response types of `/api/catalog/*`, the only thing the web app's Frontend imports.
- `src/cli/import.ts` — `pnpm catalog:import`.
- `src/model/boundaries.ts`, `src/model/baySectors.ts` — the Map Journey's provisional geography (municipality outlines; bay sector zones, v0.8).
- `data/` — the published snapshot, the last import report, `municipality-boundaries.json` and `bay-sectors.json` (hand-drawn, provisional).
