# Backend — first definition (v0.7)

**Status:** draft for review with BVRio (Uriel, tech lead), November 2026.
**Based on:** the conversation of 17 November 2026 between Glauber and Uriel; the Catalog Domain as it runs today; the decisions in [`no-bff.md`](no-bff.md).
**Artefacts:** API contract [`packages/catalog-domain/openapi.json`](../../packages/catalog-domain/openapi.json) (checked against the real responses by `pnpm test`; **0.9.1** since v0.9.22 — `InstitutionListResult.facets.allKinds`, the institutions of any kind under the other filters, each counted once) · proposed MySQL schema [`backend-schema.sql`](backend-schema.sql).

The front end is far enough along that the backend can start. This page says what was agreed, what we propose, and what still needs BVRio.

> **Update, 24 November 2026 (v0.9.34 = v0.1).** The backend starts as **a separate service of the portal** in BVRio's AWS account — not a module inside core-bvrio — written by Glauber with BVRio's stack, so it can move into core-bvrio later unchanged. The repository [`bvrio/portal-guanabara`](https://github.com/bvrio/portal-guanabara) now holds `frontend/` (this workspace) and `backend/`; the current plan and the five open questions for BVRio's IT team are in [`../../../backend/README.md`](../../../backend/README.md). The rest of this page is the full design and still applies, with "the module in core-bvrio" read as "the portal's service".

## 1. What was agreed

| Topic | Agreed | Consequence here |
|---|---|---|
| Where it runs | In BVRio's **core-bvrio** (the shared server of several apps) to avoid new costs; its own server later if the budget allows | The backend is a module that can move out unchanged (one package, no shared tables) |
| Backend stack | BVRio's standard: **Java + Spring Boot** — web, data-jpa, MySQL driver, validation, security + oauth2-resource-server, actuator, lombok, devtools, test (JUnit 5, MockMvc) + spring-security-test | §4 |
| Layers | By domain; **controller → service → dao** (JPA). Controllers never touch data | Same shape as the front's Page → Hook → Service |
| Database | **MySQL on RDS**, created by Uriel; first filled **from the Sheet** | §5, §7 |
| Front end | Vue 3.5 + **Nuxt 4**, built as a **static SPA** (no Nuxt server), served by **S3 + CloudFront** | §3 — the one change to our architecture |
| Environments | An isolated **homologation** environment first, then production | §8 |
| Repository | New Git repository from BVRio: **one folder for the backend, one for the frontend**; Uriel writes the deploy script | We keep the front at the root until the move (§8) |
| Logins | Open platform with open data: **no login for the public**, no Keycloak for visitors | §6 — editors still need to sign in |

## 2. The shape

```text
Visitor ──HTTPS──► CloudFront ──┬── /*      ──► S3: the web app (nuxt generate, SPA)
                                └── /api/*  ──► core-bvrio (Spring Boot) ──► RDS MySQL
                                                 ├── catalog    public reads
                                                 ├── geography  municipalities, outlines
                                                 ├── submissions  public suggestions
                                                 └── editorial  editors (sign-in)
```

**Same origin — decided (Q-B1, November 2026).** CloudFront routes `/api/*` to core-bvrio, so the browser only ever talks to the site's own origin: no CORS, no API host to configure. The web app's API path is fixed in code (`API_BASE_PATH = '/api'`, `src/lib/http/httpClient.ts`); there is no `NUXT_PUBLIC_API_BASE_URL`. Locally `server/api` answers `/api/*`; to try the front against a running Spring service, start it with `API_PROXY_TARGET=http://localhost:8080` and Nitro proxies `/api/**` there (still same origin for the browser).

## 3. The smallest change to the front-end architecture

Today `clients-webapp` is a Nuxt server: it renders pages (SSR) and serves `/api/catalog/*` from Nitro (`server/api`). BVRio serves Nuxt as a static SPA. Proposal:

1. **Production build = static SPA.** `nuxt generate` with SSR off → `.output/public` to S3; CloudFront answers unknown paths with `index.html` (SPA fallback). Language and view size are already cookies read in the browser, so they keep working.
2. **`server/api` stays, as the contract's reference and the development mock.** Same paths and JSON as the Spring service, so `pnpm dev` works without Java, and the Nuxt runtime tests keep running against real data.
3. **The contract is explicit:** `packages/catalog-domain/openapi.json`. `src/contracts/openapi.tests.ts` validates every response of the read services (in the four languages) against it, so the TypeScript contracts, the mock and the spec cannot drift. The Spring service implements the same spec (springdoc or openapi-generator can check it).
4. **Nothing above the Services changes.** Pages, Hooks, Services and the Presentation Lake already go through `src/lib/http` and its same-origin `/api`.

Trade-off: an SPA is not indexed as well as server-rendered pages. If search engines matter, `nuxt generate` can prerender the public pages from the API at deploy time — to decide with BVRio (Q-B6).

## 4. Backend layout (proposal)

```text
backend/                                  (Maven or Gradle — BVRio's choice)
  src/main/java/org/bvrio/portalguanabara/
    catalog/       CatalogController  → CatalogService  → EntryDao, TaxonomyTermDao …   GET /api/catalog/*
    institutions/  InstitutionController → InstitutionService → PartyDao                GET /api/catalog/institutions
    geography/     MapController → MapService → MunicipalityDao                         GET /api/catalog/map
    submissions/   SubmissionController → SubmissionService → SubmissionDao             POST /api/submissions
    editorial/     EntryAdminController, ReviewController → EditorialService → …        /api/admin/**  (sign-in)
    shared/        i18n (Accept-Language), errors ({ statusCode, data.code }), audit, cache headers
    config/        SecurityConfig, WebConfig
  src/main/resources/
    application.yml, db/migration/        (Flyway — to confirm)
  src/test/java/…  MockMvc tests per controller; contract test against openapi.json
```

- **Security:** `GET /api/catalog/**` and `POST /api/submissions` are public; `/api/admin/**` requires a JWT with an editor role (OAuth2 resource server, already in BVRio's starters). Actuator only on the internal network.
- **Languages:** Spring's `AcceptHeaderLocaleResolver` (pt-BR default; en, es, fr). Controlled vocabularies come from `taxonomy_term_translation`; free text and proper names stay in Portuguese. Responses carry `Vary: Accept-Language`.
- **Caching:** public reads send `Cache-Control: public, max-age=300`; CloudFront caches per path + query + `Accept-Language`. Publishing an entry can invalidate `/api/catalog/*`.
- **Errors:** the shape the web app already reads — `{ statusCode, statusMessage, data: { code } }` (e.g. `CATALOG_ENTRY_NOT_FOUND`).

## 5. Data (proposal)

[`backend-schema.sql`](backend-schema.sql) mirrors the Catalog Domain model the web app reads today (Core v2.0):

| Table | Holds |
|---|---|
| `entry` (+ `entry_term`, `entry_place`, `entry_party`, `entry_source`, `entry_periodicity`, `entry_publication_year`) | Initiatives and studies; `ref` is the workbook ID, never reused (D-047); `publication_status` draft → published → retired; `version` for optimistic locking |
| `taxonomy_term` (+ `_translation`) | Every controlled list (keywords, mechanisms, site/institution/source types, indicators, bay sectors) with en/es/fr labels |
| `place`, `municipality` | Places by type (D-051); municipalities with the official outline |
| `party` | Institutions and people (people stay hidden until the LGPD answer, Q22); logos only with authorisation |
| `source` | Links, DOI, venue, year |
| `submission` | Public suggestions waiting for review |
| `audit_event`, `import_run` | Who changed what; the load from the Sheet |

The read services' rules (filters, facets, counts, "unknown is never a bucket", period overlap, search without accents) are specified by the Domain's tests (`packages/catalog-domain/src/read/*.tests.ts`) — the Java services should reproduce them; the contract test catches shape differences, the domain tests list the behaviours.

### Map outlines — where to store them (to decide)

The Map Journey draws provisional, simplified outlines (IBGE-derived, `data/municipality-boundaries.json`, ~42 KB for the 20 municipalities in the v0.8 view) and, since v0.8, hand-drawn **bay sector zones** (`data/bay-sectors.json`: Interior, Transição, Entrada, Fora da Baía as polygons in the water; Baía inteira has no zone). Options for the official ones:

| Option | Pros | Cons |
|---|---|---|
| **A. MySQL spatial** — `municipality.boundary MULTIPOLYGON SRID 4326` + precomputed `boundary_simplified` (GeoJSON) served by `GET /api/catalog/map` | One source of truth; spatial queries later (which municipality or bay sector a point is in; geolocated actions) | Import tooling for the IBGE mesh; MySQL's spatial support is narrower than PostGIS |
| **B. Static file** — simplified TopoJSON/GeoJSON on S3/CloudFront; the API sends only counts | Cheapest; outlines change once a year | No spatial queries; two sources to keep in step |
| **C. JSON column only** — simplified GeoJSON in MySQL | Simple | Same limits as B, inside the database |

**Recommendation: A**, loading IBGE's official mesh (*Malha Municipal*) and the bay sectors as polygons; `GET /api/catalog/map` keeps its contract, so the front does not change.

## 6. Retiring the Sheet: editing and suggestions

| Phase | What | Who signs in |
|---|---|---|
| **1. Load** | One-off import of the Sheet into MySQL. The validated rules already exist (`pnpm catalog:import` → snapshot); a small exporter turns the snapshot into SQL, so the Core v2.0 rules are not rewritten in Java. The Sheet becomes read-only. | Developer |
| **2. Edit** | An editors' area: create, change, publish and retire entries; manage vocabularies, institutions and translations. Every change goes to `audit_event`. | Editors (BVRio staff) |
| **3. Suggest** | A public form on the portal (new Journey, e.g. *Contribuir*): anyone suggests a new initiative or study, or a correction to an entry. Suggestions wait in `submission`; an editor approves (the entry is created or changed) or rejects. Captcha, rate limit, consent, contact erased after the retention period. | Nobody (public) |

Editors need a sign-in even though the public does not. The cheapest path is BVRio's existing Keycloak **for staff only**, validated by Spring's OAuth2 resource server — the public site keeps no login. The editors' area is a front-end decision too: the architecture contracts keep only `clients-webapp` in scope, so it is either a protected part of this App or reopening `backoffice-webapp` (already declared in the manifests' App list). Smallest change: a `backoffice` context inside `clients-webapp`, behind the sign-in — to confirm before building (Q-B8).

## 7. Order of work

1. **Repository and database** (Uriel): new repository, MySQL in homologation.
2. **Read API parity:** Spring service for the five public reads, filled from the Sheet (phase 1); passes the OpenAPI contract and the Domain's behaviours.
3. **Front as SPA in homologation:** `nuxt generate` to S3; CloudFront routes `/api/*` to the Spring service (same origin, Q-B1).
4. **Official map outlines** (option A).
5. **Editorial** (phase 2) → **suggestions** (phase 3) → Sheet retired.

## 8. Repository

Done in v0.9.34: [`bvrio/portal-guanabara`](https://github.com/bvrio/portal-guanabara) holds the pnpm/Turborepo workspace in `frontend/` and the Spring project in `backend/` (a README with the plan until the code lands). The contract stays in `frontend/packages/catalog-domain/openapi.json`, where the frontend tests check it; it can move to a shared `api/` folder at the root once the backend reads it too.

## 9. Questions for BVRio

| # | Question | Default until answered |
|---|---|---|
| Q-B1 | Same origin (`/api/*` routed by CloudFront to core-bvrio) or a separate API host? | **Answered: same origin** (v0.9.1 — the API path is fixed to `/api`, dev proxy via `API_PROXY_TARGET`) |
| Q-B2 | Maven or Gradle; Java and Spring Boot versions used in core-bvrio? | BVRio's current ones |
| Q-B3 | Migrations: Flyway (or Liquibase) in core-bvrio? | Flyway |
| Q-B4 | Inside core-bvrio, a path prefix (`/api/portal-guanabara/…`) or its own context? | `/api/…` routed by CloudFront |
| Q-B5 | MySQL version on RDS (spatial support: 8.0+)? | 8.0 |
| Q-B6 | SEO: is a pure SPA acceptable, or prerender public pages at deploy? | SPA; prerender later if needed |
| Q-B7 | Editors' sign-in: BVRio's Keycloak for staff only? | Keycloak, staff only |
| Q-B8 | Editors' area: inside `clients-webapp` (protected) or a separate backoffice app? | Inside, `backoffice` context |
| Q-B9 | Suggestions: captcha provider, retention of contact data, who reviews? | To define |
| Q-B10 | Map outlines: option A (MySQL spatial), B or C? | A |
| Q-B11 | Person names (LGPD, Q22) — still hidden? | Hidden |
