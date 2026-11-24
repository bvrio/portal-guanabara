# Portal Guanabara

Frontend monorepo for **Portal Guanabara**, organized around **Journeys** and built with **Vue 3 + Nuxt 4**.

> This is the `frontend/` folder of the [`bvrio/portal-guanabara`](https://github.com/bvrio/portal-guanabara) repository (overview in [`../README.md`](../README.md)); the API service lives in [`../backend/`](../backend/README.md). Every command below runs from this folder.

It is the Vue/Nuxt translation of the Journey-Domain `template-frontend` (React + Next.js). The architecture, folder taxonomy and naming conventions are preserved; only framework mechanics change. See [`docs/migration/react-to-vue.md`](docs/migration/react-to-vue.md).

> **New machine?** Start with [`docs/setup/macos.md`](docs/setup/macos.md) — a step-by-step guide from a clean MacBook to the running app.

## Current scope (v0.9.34 = v0.1, November 2026)

**One public web app, no BFF.** BVRio decided on a single App, `clients-webapp`; the other Apps of the template are out of scope and there are no public logins (Core v2.0, D-042). Today its own server routes serve the data; the target agreed with BVRio is a **Spring Boot backend in core-bvrio over MySQL**, with the web app shipped as a **static SPA on S3 + CloudFront** — [`docs/architecture/backend.md`](docs/architecture/backend.md) and the API contract [`packages/catalog-domain/openapi.json`](packages/catalog-domain/openapi.json). Background: [`docs/architecture/no-bff.md`](docs/architecture/no-bff.md).

## Core architecture

```text
App
  ↓
Journey
  ↓
Page
  ├── Hook          (Vue composable)
  │    └── Service
  │         └── HTTP → App API (server/api) · DEV mock backend (demo Journeys)
  │
  └── Presentation Lake
```

```text
packages/catalog-domain   workbook importer (Core v2.0 rules) + read services
        ↑
apps/clients-webapp/server/api/catalog/*   thin routes, the App's own API
```

## Applications

```text
Web
├── clients-webapp      ← the only App in scope (Nuxt 4)
├── partners-webapp     ← out of scope
└── backoffice-webapp   ← out of scope

Mobile
├── clients-app         ← out of scope
└── partners-app        ← out of scope
```

`clients-webapp` organizes Journeys by `common/`, `interested/` and `holder/`.

## App folder convention (Nuxt)

```text
apps/clients-webapp/
├── nuxt.config.ts        srcDir: 'src' · dir.pages: 'app'
├── server/               api/catalog (App API) · routes/mock-bff (DEV demo) — not Frontend code
├── locales/              pt-BR.json (source, pnpm i18n:extract) · en.json · es.json · fr.json (translations)
├── tests/nuxt/           Nuxt runtime tests of Hooks and Pages
└── src/
    ├── app.vue           root component  (Next.js app/layout.tsx)
    ├── app/              routing layer   (thin index.vue files; [id] for parameters)
    ├── pages/            Page implementations
    ├── hooks/            Hooks (composables) per context/journey
    ├── services/         Journey Service facades (HTTP)
    ├── shared/           feature-management · feature-flag · tracking · navigation · emblems · view-zoom · locale · session · guided-tour · dev toolbar
    ├── providers/        IntlProvider · LinkProvider (NuxtLink adapter)
    └── lib/              http client (apiClient, mockBffClient) · i18n (locales, localeState) · createOperation
```

Nuxt's routing folder is renamed from `pages/` to `app/` so that `pages/` keeps its architectural meaning (Page implementations), exactly like the Next.js template.

## Packages

```text
packages/presentation-lake     Vue component library + Storybook (no data access, no Nuxt)
packages/journey-manifests     Journey → Pages → Features → access requirements (schema v1)
packages/catalog-domain        Catalog importer, snapshot, read services, vocabulary translations, map outlines and bay sectors
                               and the API contract (openapi.json) — framework-free
```

## Presentation Lake

```text
packages/presentation-lake/src/
├── Journeys/          About · Authentication · Catalog · Institutions · Map · User
├── Shared/
│   ├── foundations/   tokens (Bay + Comlurb palette, 60/30/10) · styles · i18n · Typography · Icon · BrandMark
│   ├── primitives/    CardGrid (1 / 2 / 3 columns) · Inline
│   ├── components/    Alert · BarList · Button · Card · Checkbox · DescriptionList · Drawer · Emblem · EmptyState
│   │                  FilterMenu · FilterPanel · GuidedTour · Input · Link · PageHero · PageTitle · Pagination · Popover
│   │                  Select · StatCard · Tag
│   └── features/      BasicData · SiteFooter · SiteHeader
└── Utils/
```

`Shared` is ordered by architectural complexity, not alphabetically. Shared units and the Catalog patterns have Storybook stories (`@storybook/vue3-vite`).

Colours, icons and the 60/30/10 layout rule: [`docs/design-system.md`](docs/design-system.md).

## Journeys

```text
/                                  Home ("Início")   panorama of the catalogue — "Explorar o catálogo" duo, institutions and
                                                     municipalities, bay sectors, themes, mechanisms, studies by academia,
                                                     highlights — with a side drawer where filters stack ("+ Filtro") and
                                                     a guided tour ("Começar o tour")
/catalog                           Catalog · List ("Catálogo", a tab again since v0.9.11)  every entry in an anchored filter panel: search, kind, status,
                                                     period, keyword, sector, municipality, institution, mechanism, sort,
                                                     paging — all in the URL; only filters that would
                                                     change the results are offered
/institutions                      Institutions · List ("Instituições")  every institution (roles, counts, type), its
                                                     entries in the drawer
/map                               Map · Explore ("Mapa")  the municipalities in green by entries, orange badges for initiatives, purple circles for
                                                     their studies, the bay sectors as zones in the water (provisional
                                                     outlines and zones) and the whole bay as a pill; a caption
                                                     in the colour of the place; entries in the drawer
/about                             About · Overview ("Sobre nós")  the FAPERJ project and partners, the team (two FAPERJ
                                                     fellows, the Instituto BVRio team) and the two
                                                     scholarships; photos pending
/catalog/:id                       Catalog · Details  one entry by its workbook ID as a compact summary: key facts,
                                                     results, Onde | O quê, mini map, participants (open
                                                     their entries in the drawer), sources
/authentication/*                  Authentication      (demo — no logins in scope; "Entrar" / initials avatar in the header)
/user/*                            User                (demo)
```

Header tabs: **Início**, **Catálogo**, **Instituições**, **Mapa**, **Sobre nós**; the account sits at the far right (“Entrar”, or an avatar with your initials). One row (v0.9.17): the mark and the name at the far left, the tabs in the middle, **Opções** and the account at the far right; when it does not fit, the name and the words of Opções and Entrar go first, then the bar keeps only the mark, the account and a **menu** (☰) with the tabs, Idioma and Tamanho. **Opções** sets the view size — 100% (default), 110% or 120% (tablets and up) — and the language, each with its flag: **Português** (default), **English**, **Español**, **Français** (`locales/<locale>.json`, checked by `pnpm i18n:check`; the API translates the controlled vocabularies through `Accept-Language`).

The Catalog is built from the mapping team's workbook: [`docs/architecture/catalog.md`](docs/architecture/catalog.md); the Institutions and Map Journeys read the same data: [`docs/architecture/institutions.md`](docs/architecture/institutions.md), [`docs/architecture/map.md`](docs/architecture/map.md). The backend plan with BVRio (Spring Boot in core-bvrio, MySQL, static SPA) and the API contract: [`docs/architecture/backend.md`](docs/architecture/backend.md), [`packages/catalog-domain/openapi.json`](packages/catalog-domain/openapi.json). The V0 seed status is in [`docs/architecture/v0.md`](docs/architecture/v0.md).

## Journey Manifests, Feature Management and Feature Flags

The Catalog is public and uses Feature Flags only: `catalogPersonNames` shows coordinators and study authors by name (on in `nuxt dev`, off in builds until BVRio answers the LGPD question; the server enforces it). The demo Journeys keep Feature Management, resolved by the DEV mock backend from the manifests.

Mock personas for the demo Journeys (password `teste1234`): `interessado@teste.com`, `titular@teste.com`, `premium@teste.com`. In DEV, the toolbar in the bottom-left corner switches persona and Feature Flags.

## Contracts

Read the root `AGENTS.md` first (§0 holds the current scope). Frontend rules: `apps/AGENTS.md`, `packages/presentation-lake/AGENTS.md`. Domain rules: `packages/catalog-domain/AGENTS.md`. The `agents/` directory contains specialized construction and platform-governance agents.

## Tech stack (November 2026)

| Concern | Choice |
|---|---|
| Runtime | Node.js 26 LTS (`.node-version`) — Nuxt also supports Node 22.22+ / 24.15+ |
| Package manager / monorepo | pnpm 12 workspaces + Turborepo 2 |
| Framework | Nuxt 4.6 · Vue 3.5 · vue-router 5 |
| Language | TypeScript 6.0 (pinned — TypeScript 7 is not yet supported by `vue-tsc`) |
| Styling | SCSS + CSS Modules, design tokens as CSS custom properties |
| i18n | vue-intl 8 (FormatJS) · `@formatjs/cli` extraction |
| Tests | Vitest 5 · @testing-library/vue · jsdom · @nuxt/test-utils + happy-dom |
| Component docs | Storybook 10 (`@storybook/vue3-vite`) |
| Data | Catalog snapshot (JSON, from the workbook via `read-excel-file`) today; MySQL behind a Spring Boot API in core-bvrio next (`docs/architecture/backend.md`) |

## Environment model

```text
DEV   → local individual development
CONST → Construction: collaborative integration and validation
PROD  → controlled production releases
```

```text
DEV   → http://portalguanabara.dev.com.br/<journey>
CONST → https://portalguanabara.cons.com.br/<journey>
PROD  → https://portalguanabara.com.br/<journey>
```

See [`dev/nginx/README.md`](dev/nginx/README.md) for the optional one-time local Nginx setup.

## Development

```bash
pnpm install
pnpm dev:clients                 # clients-webapp on http://127.0.0.1:3000
API_PROXY_TARGET=http://localhost:8080 pnpm dev:clients   # same-origin /api proxied to a running Spring service
```

Quality gates:

```bash
pnpm verify                      # architecture:validate + i18n:check + typecheck + test
pnpm build                       # nuxt build → apps/clients-webapp/.output
pnpm storybook                   # http://localhost:6006
```

Data and copy:

```bash
pnpm catalog:import --file <workbook.xlsx> [--dry-run] [--without-persons]
pnpm catalog:boundaries --file <municipios-poligonos.json>   # provisional map outlines (docs/architecture/map.md)
pnpm i18n:extract                # after editing any *.messages.ts; then add en/es/fr in locales/
```

Deterministic local port: `clients-webapp → 3000`. When local Nginx is configured, use the Product Identity hostname rather than the port.

## Next steps

See [`docs/roadmap.md`](docs/roadmap.md).
