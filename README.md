




# Portal Guanabara

**Who studies and who acts for Guanabara Bay, in one place.** Portal Guanabara gathers the initiatives that clean, collect and restore the bay and the studies that measure litter in its waters, rivers and mangroves — with the institutions behind them — from the mapping by Instituto BVRio, an applied research project with FAPERJ scholarships.

## Repository layout

```text
portal-guanabara/
├── frontend/   the web app — Vue 3 + Nuxt 4 monorepo (pnpm + Turborepo)
│               clients-webapp · Presentation Lake · Catalog Domain · Journey Manifests
└── backend/    the portal's API service — Java + Spring Boot + MySQL (planned; see backend/README.md)
```

Each folder has its own README with the details: [`frontend/README.md`](frontend/README.md), [`backend/README.md`](backend/README.md).

## Status — v0.1 (November 2026)

- **Web app:** Início (the catalogue at a glance, with a guided tour), Catálogo, Instituições, Mapa, Sobre nós and a page per entry, in Portuguese, English, Spanish and French.
- **Data:** the mapping team's workbook, imported into a validated snapshot (41 entries — 24 initiatives and 17 studies — and 63 institutions) and served by the web app's own server routes (`/api/catalog/*`) until the backend exists.
- **API contract:** [`frontend/packages/catalog-domain/openapi.json`](frontend/packages/catalog-domain/openapi.json) (OpenAPI 3.1, version 0.9.1). The frontend tests check every response against it; the backend implements it, so no screen changes when the data source does.
- **Backend:** not started — the plan, the stack and the open questions are in [`backend/README.md`](backend/README.md).

## Quick start (web app)

Requirements: Node.js 26 LTS (`frontend/.node-version`) and pnpm 12. From a clean Mac, step by step: [`frontend/docs/setup/macos.md`](frontend/docs/setup/macos.md).

```bash
cd frontend
pnpm install
pnpm dev:clients        # http://127.0.0.1:3000
pnpm verify             # architecture, translations, types and tests
```

## Target architecture

```text
Visitor ──HTTPS──► CloudFront ──┬── /*      ──► S3: the web app (static SPA, nuxt generate)
                                └── /api/*  ──► the portal's service (Spring Boot) ──► RDS MySQL 8
```

One origin for the browser (no CORS, no API host to configure), everything in BVRio's AWS account. The service can later move into BVRio's core-bvrio without changing the contract.

## Versions

Releases are Git tags (`v0.1`, `v0.2`, …). The web app's history before this repository — internal versions 0.1 to 0.9.34 — is in [`frontend/docs/roadmap.md`](frontend/docs/roadmap.md).

## Documentation

| Topic | Where |
| --- | --- |
| Architecture contracts (App → Journey → Page; Page → Hook → Service) | [`frontend/AGENTS.md`](frontend/AGENTS.md), `frontend/apps/AGENTS.md`, `frontend/packages/presentation-lake/AGENTS.md` |
| Design system (colours, icons, layout rules) | [`frontend/docs/design-system.md`](frontend/docs/design-system.md) |
| Catalogue data and the workbook importer | [`frontend/docs/architecture/catalog.md`](frontend/docs/architecture/catalog.md) |
| Backend design: API, MySQL schema, retiring the Sheet | [`frontend/docs/architecture/backend.md`](frontend/docs/architecture/backend.md), [`frontend/docs/architecture/backend-schema.sql`](frontend/docs/architecture/backend-schema.sql) |
| Roadmap | [`frontend/docs/roadmap.md`](frontend/docs/roadmap.md) |
