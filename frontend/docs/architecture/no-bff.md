# One web app, no BFF

> **v0.7 update (17 Nov 2026, conversation with Uriel, BVRio):** the target is a **Spring Boot backend in core-bvrio over MySQL**, and the web app ships as a **static SPA on S3 + CloudFront**. The App's server routes below remain the contract's reference and the development mock. See [`backend.md`](backend.md).

**Status:** current architecture since v0.3 (November 2026). Decided with BVRio: only the public web app, no BFF, no other Apps. Logins are out of scope (Core v2.0, D-042).

This page describes what exists today, what changed from the template, and what still depends on BVRio. The questions themselves are in the shared doc *Portal Guanabara — Architecture review questions for BVRio*.

## What runs

```text
Browser
  │  HTML (SSR) + hydration, then same-origin HTTP
  ▼
clients-webapp — one Nuxt 4 deployable (Node server)
  ├── src/            Frontend: Pages → Hooks → Services → lib/http
  │                   Presentation Lake (packages/presentation-lake)
  └── server/         Nitro
       ├── api/catalog/*        App API — thin routes over the Catalog Domain
       └── routes/mock-bff/*    DEV mock backend of the demo Journeys (off in production)
                                 │
packages/catalog-domain          ▼
  ├── read services   getCatalogReader() ── reads ──► data/catalog-snapshot.json (bundled)
  └── importer        pnpm catalog:import ── writes ─► snapshot + data/import-report.md
                                 ▲
                      mapping workbook (.xlsx today, Google Sheets later)
```

During SSR, Services call the App API in-process (Nuxt's request-bound fetch), so there is no network hop between the page and its data. In the browser the same Services call `/api/*` over HTTP.

## What changed from the template

| Template (React/Next.js, several Apps) | Portal Guanabara today |
|---|---|
| One BFF per consumer context | The App's own server routes (`server/api`) |
| Backend Domains behind the BFF | `packages/catalog-domain` in the monorepo, called by the server routes |
| `src/lib/bff` → `bffBaseUrl` | `src/lib/http` → `apiClient` (`/api`) and `mockBffClient` (`/mock-bff`, demo only) |
| Mock BFF as a step towards the real BFF | Mock backend kept only for the demo Authentication and User Journeys |
| partners/backoffice webapps, mobile Apps planned | Out of scope; the validator no longer reports them |
| Feature Management from the BFF | Only the demo Journeys use it; the Catalog is public and uses Feature Flags |

Unchanged: App → Journey → Page; Page → Hook → Service; the Presentation Lake; Journey Manifests; Feature Flags; tracking from manifests; folder and naming conventions.

## Where the data source can change

Everything above the Catalog Domain read services is independent of where the data lives:

```text
Page → Hook → Service → /api/catalog/* → CatalogReader ──► snapshot (today)
                                                    └──► PostgreSQL + PostGIS (if BVRio confirms)
```

- **PostgreSQL:** the importer writes the database (one transaction, D-044) and `getCatalogReader()` reads it. `CatalogReader` and `@portal-guanabara/catalog-domain/contracts` stay the same.
- **A separate read API:** served on the same origin under `/api` (BVRio, Q-B1) — CloudFront in production, `API_PROXY_TARGET` locally; Services keep their paths.
- **Static site:** the routes are deterministic reads, so `nuxt generate` could prerender every page from the snapshot.

## Boundaries that keep this safe

- Frontend code imports only the **types** of the Catalog Domain (`import type … from '@portal-guanabara/catalog-domain/contracts'`); the snapshot and importer never reach the browser bundle (checked by `pnpm architecture:validate`, and verified in the production build).
- Person names (coordinators, study authors) leave the server only when the `catalogPersonNames` flag is on. It is on in `nuxt dev` and off in builds until BVRio answers the LGPD question (Q22). `NUXT_PUBLIC_FEATURE_FLAGS_CATALOG_PERSON_NAMES=true` turns it on per environment.
- The Catalog Domain is framework-free (no Vue, Nuxt or h3), so it can move to its own service without rewrites if BVRio prefers (Q7).

## Pending on BVRio

| Topic | Questions | Default until answered |
|---|---|---|
| What serves data without a BFF; "no BFF" = no server code at all? | Q1, Q2 | **Answered (v0.7):** Spring Boot in core-bvrio — [`backend.md`](backend.md) |
| Hosting, Node runtime, PostGIS | Q3, Q4 | **Answered (v0.7):** static SPA on S3 + CloudFront; MySQL on RDS (no PostGIS) |
| Snapshot vs database now; where the Domain lives | Q7, Q10 | **Answered (v0.7):** MySQL, filled from the Sheet; open details in backend.md §9 |
| Who runs the import, and how | Q9, Q29 | Developer runs `pnpm catalog:import` |
| Demo Journeys (logins) | Q20 | Kept, mock backend on in DEV only |
| Person names (LGPD) | Q22, Q23 | Hidden in builds |
| Repository, CI, monitoring, launch | Q27–Q31 | Local repository, `pnpm verify` locally |
