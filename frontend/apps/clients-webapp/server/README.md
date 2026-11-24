# Server (Nitro)

There is **no BFF** (BVRio, November 2026). `server/` holds the App's own server code, served by Nuxt's Nitro server:

| Folder | What it is | Status |
|---|---|---|
| `server/api/catalog/*` + `server/catalog/` | **Catalog API** — thin HTTP routes over the Catalog Domain read services (`@portal-guanabara/catalog-domain`) | Product code |
| `server/routes/mock-bff/*` + `server/mock-bff/` + `server/middleware/mock-bff.ts` | **Mock backend** of the demo Authentication and User Journeys (logins are out of scope, D-042) | DEV demo — see [Questions for BVRio](../../../docs/architecture/no-bff.md) Q20 |
| `server/middleware/legacy-routes.ts` | **301s for moved pages**, query kept (v0.5: `/catalog/list` → `/catalog`) | Product code |

```text
Page → Hook → Service ──HTTP──► /api/catalog/*  ──► Catalog Domain read services ──► snapshot (today) / PostgreSQL (later)
Page → Hook → Service ──HTTP──► /mock-bff/*     (demo Journeys only)
```

During SSR the request-bound fetch calls these routes **in-process** (no network hop); in the browser they are plain same-origin HTTP calls.

## Rules

- `server/` is **not** Frontend code. Nothing in `src/` may import from `server/`, and nothing in `server/` may import from `src/` or the Presentation Lake (`pnpm architecture:validate`).
- Server routes stay thin: parse the request, call the Domain, shape nothing. Presentation decisions (how a partial date or an unknown value reads) belong to the Presentation Lake.
- Frontend code imports only the **types** of `@portal-guanabara/catalog-domain/contracts`; the snapshot and the importer never reach the browser bundle.
- Person names leave the server only when the `catalogPersonNames` Feature Flag is on (`server/catalog/personNames.ts`). The flag is on in `nuxt dev` and off in builds until BVRio answers the LGPD question.

## Catalog API

```text
GET /api/catalog/overview                → CatalogOverview
GET /api/catalog/entries                 → CatalogListResult
    ?q&kind=project|study&status=active|in_implementation|ended|published|in_progress
     &from=YYYY-MM&to=YYYY-MM&keyword&municipality&sector&mechanism&institution&sort=recent|name&page&pageSize
    facets: kinds, statuses, keywords, municipalities, sectors, mechanisms, institutions, period { first, last }
GET /api/catalog/institutions            → CatalogInstitutionListResult   (since v0.6)
    ?q&kind=project|study&role=executor|funder|partner|author&type&sort=entries|name&page&pageSize
    facets: kinds, roles, types, unknownTypes
GET /api/catalog/entries/:ref            → CatalogEntryDetails   (ref = workbook ID, D-047)
                                           404 { data.code: CATALOG_ENTRY_NOT_FOUND }
GET /api/catalog/map                     → CatalogMap   (since v0.7: municipality outlines + entries)
```

Every route reads `Accept-Language` (`server/catalog/locale.ts`): controlled vocabularies come back in pt-BR (default), en, es or fr; responses carry `Vary: accept-language`. The full contract — the one the Spring Boot backend implements (docs/architecture/backend.md) — is `packages/catalog-domain/openapi.json`, checked against these responses by the Domain's tests.

Unknown filter codes are dropped (the response echoes the `query` it understood). Responses carry `cache-control: public, max-age=300` outside development; the data changes only when a new snapshot is deployed.

## Mock backend of the demo Journeys

State is in memory and resets when the dev server restarts.

### Seeded accounts (password `teste1234`)

| E-mail | User Type | Capabilities |
|---|---|---|
| `interessado@teste.com` | interested | — |
| `titular@teste.com` | holder | — |
| `premium@teste.com` | holder | holder-premium |

Accounts created through Registration are `interested`.

### Endpoints

```text
POST /mock-bff/authentication/login            { email, password }
POST /mock-bff/authentication/logout
POST /mock-bff/authentication/registration     { fullName, cpf, phone, email, password, passwordConfirmation }
POST /mock-bff/authentication/password-reset   { email }
GET  /mock-bff/user/profile
PUT  /mock-bff/user/profile                    { fullName, cpf, phone, email }
PUT  /mock-bff/user/password                   { currentPassword, newPassword, newPasswordConfirmation }
GET  /mock-bff/user/preferences
PUT  /mock-bff/user/preferences                { email, sms, whatsapp }
GET  /mock-bff/feature-management/:journey     → { journey, granted, reason, features }
GET  /mock-bff/dev/personas                    (DEV only)
GET  /mock-bff/dev/session                     (DEV only)
PUT  /mock-bff/dev/session                     { accountId | null }  (DEV only)
```

Errors use HTTP status codes plus a stable `data.code` (e.g. `INVALID_CREDENTIALS`, `PASSWORD_MISMATCH`, `FORBIDDEN`).

### Turning it off

Set `NUXT_MOCK_BFF_ENABLED=false` (the routes then answer 404). Removing the demo Journeys altogether (if BVRio confirms Q20) means deleting `server/mock-bff`, `server/routes/mock-bff`, `server/middleware/mock-bff.ts` and the Authentication and User Journeys.
