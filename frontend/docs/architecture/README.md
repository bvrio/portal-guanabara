# Frontend Architecture Documentation

Detailed frontend architecture references complement:

- the workspace root `AGENTS.md` (`frontend/AGENTS.md`);
- `apps/AGENTS.md`;
- `packages/presentation-lake/AGENTS.md`;
- specialized agents under `agents/`.

Use these documents for durable concepts without duplicating local implementation contracts.

- `no-bff.md` — **current architecture**: one web app, no BFF, the App API and where the data source can change.
- `backend.md` — **backend first definition** (v0.7): core-bvrio, Spring Boot, MySQL, static SPA on S3 + CloudFront, retiring the Sheet; with `backend-schema.sql` and the API contract `packages/catalog-domain/openapi.json`.
- `catalog.md` — the Catalog Journey: pages, workbook → snapshot → API, import rules, presentation.
- `institutions.md` — the Institutions Journey (v0.6).
- `map.md` — the Map Journey (v0.7): municipalities around the bay, provisional outlines.
- `about.md` — the About Journey (v0.8): Sobre nós — testimonial, team, FAPERJ scholarships (work in progress).
- `app-structure.md` — Nuxt App folder taxonomy.
- `authorization-model.md` — User Types, Capabilities, Feature Management.
- `environment-model.md` — DEV, CONST and PROD environment and Product Identity rules.
- `journey-model.md` — what a Journey is.
- `journey-manifest.md` — Journey Manifest schema v1 and Feature Management decisions.
- `observability-model.md` — tracking vs technical observability.
- `ownership-model.md` — teams own Journeys.
- `product-model.md` — App → Journey → Feature → Page.
- `v0.md` — the V0 Journey seed and its implementation status.
- `v9.md` — the V9 contract split.

Related:

- `../migration/react-to-vue.md` — React/Next.js → Vue/Nuxt translation map.
- `../setup/macos.md` — machine setup and first run.
- `../roadmap.md` — step-by-step plan.
