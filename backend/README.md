# Portal Guanabara — backend

**Status: not started.** This folder holds the plan until the first code lands. Until then the web app serves the same API from its own server routes (`frontend/apps/clients-webapp/server/api/catalog/*`), reading the workbook snapshot.

## What it is

A small service only for the portal, in **BVRio's AWS account**, answering `/api/*` behind the same CloudFront distribution that serves the web app (one origin: no CORS). It follows BVRio's standard stack so it can move into **core-bvrio** later without changing the contract.

```text
CloudFront ── /api/* ──► portal service (Spring Boot) ──► RDS MySQL 8
```

## Contract

The API is defined by [`../frontend/packages/catalog-domain/openapi.json`](../frontend/packages/catalog-domain/openapi.json) (OpenAPI 3.1, version 0.9.1, server `/api`). The frontend tests validate every response of the current implementation against it, in the four languages; the Spring service must pass the same contract (springdoc or openapi-generator can check it).

| Method and path | Access | What it does |
| --- | --- | --- |
| `GET /catalog/overview` | Public | Key numbers, bay sectors, keywords, mechanisms, studies by academic institution and highlights for Início |
| `GET /catalog/entries` | Public | List with search, filters, facets, total, sort and paging |
| `GET /catalog/entries/{ref}` | Public | One entry by its workbook ID; `404` with `CATALOG_ENTRY_NOT_FOUND` |
| `GET /catalog/institutions` | Public | Institutions with roles, type and their initiatives and studies |
| `GET /catalog/map` | Public | Municipalities and bay sectors with counts, outlines and zones |
| `POST /submissions` | Public (later) | Suggestions of new entries or corrections (the form exists behind the `contributionForms` flag) |

Behaviour the contract does not spell out lives in the Catalog Domain tests ([`../frontend/packages/catalog-domain/src/read/createCatalogReader.tests.ts`](../frontend/packages/catalog-domain/src/read/createCatalogReader.tests.ts)); the service reproduces it:

- **Facets:** each dimension is counted with every other filter applied but its own; lists return the total.
- **Unknown is never a category:** missing or "Não confirmado" values are not offered as options; the map reports entries without a confirmed municipality or sector apart.
- **Period:** an activity runs from its start to its end (or today, if ongoing) and must overlap the requested months; entries without a start date drop out when a period is filtered.
- **Search:** accent- and case-insensitive, over name, objective, keywords, places and institutions (`utf8mb4_0900_ai_ci`).
- **Same counts everywhere:** a municipality's or sector's number on the map equals what `municipality=` or `sector=` returns in the list.
- **Partial dates:** every date carries its precision (day, month or year).
- **Person names:** coordinators and authors only when the server allows it (hidden in production until BVRio's LGPD answer).
- **Languages:** `Accept-Language` (pt-BR default; en, es, fr) translates the controlled vocabularies; free text and proper names stay in Portuguese. Responses carry `Vary: Accept-Language` and `Cache-Control: public, max-age=300`.
- **Errors:** `{ statusCode, statusMessage, data: { code } }`, the shape the web app reads.

## Stack (decided)

- **Java + Spring Boot**, BVRio's standard starters (web, data-jpa, MySQL driver, validation, security + oauth2-resource-server, actuator, lombok, test), layered by domain: **controller → service → dao**; controllers never touch data.
- **MySQL 8 on RDS**, only for the portal; migrations with **Flyway**. Proposed schema: [`../frontend/docs/architecture/backend-schema.sql`](../frontend/docs/architecture/backend-schema.sql), plus a `bay_sector_zone` table for the bay sector zones.
- **First load from the workbook:** the frontend's importer already validates it (`pnpm catalog:import`); a small exporter turns the snapshot into SQL, so the rules are not rewritten in Java.
- **Map outlines:** MySQL spatial (`MULTIPOLYGON SRID 4326`) from IBGE's official municipal mesh, with a simplified GeoJSON served by `GET /catalog/map`.
- **Security:** the public reads and `POST /submissions` are open; a future editors' area (`/api/admin/**`) needs a JWT with an editor role (BVRio's Keycloak, staff only). Actuator only on the internal network.

Proposed layout:

```text
backend/
  src/main/java/org/bvrio/portalguanabara/
    catalog/        CatalogController → CatalogService → EntryDao, TaxonomyTermDao …   GET /api/catalog/*
    institutions/   InstitutionController → InstitutionService → PartyDao               GET /api/catalog/institutions
    geography/      MapController → MapService → MunicipalityDao                        GET /api/catalog/map
    submissions/    SubmissionController → SubmissionService → SubmissionDao            POST /api/submissions
    shared/         i18n (Accept-Language), errors, cache headers
    config/         SecurityConfig, WebConfig
  src/main/resources/  application.yml, db/migration/ (Flyway)
  src/test/java/…      MockMvc tests per controller; contract test against openapi.json
```

## Running it with the web app

With the service on port 8080, the web app proxies `/api` to it in development:

```bash
cd frontend
API_PROXY_TARGET=http://localhost:8080 pnpm dev:clients
```

## Open questions for BVRio's IT team

1. Region, naming and tags, monthly cost ceiling and IAM permissions for the portal's resources in BVRio's AWS account.
2. How core-bvrio runs and is deployed today (EC2, ECS, Beanstalk, pipeline) — the portal's service follows the same pattern; otherwise a small container deployed by GitHub Actions.
3. A new small RDS instance for the portal, or a database inside an existing one.
4. Homologation and production addresses, and who creates the DNS records (the certificate comes from ACM).
5. Maven or Gradle, and the Java and Spring Boot versions of core-bvrio.

Questions 1 and 4 block publishing; the others have a default and do not.

## Order of work

1. Read service with parity to the contract, loaded from the workbook.
2. Homologation: the web app as a static SPA on S3 + CloudFront, `/api/*` routed to the service.
3. Production, after BVRio's validation.
4. Later: official map outlines and sector zones, the editors' area, public suggestions — then the workbook is retired.
