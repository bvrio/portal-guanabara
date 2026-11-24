# Catalog Journey

**App:** `clients-webapp` · **Context:** `common` · **Journey:** `catalog` (public) · **Since:** v0.3

The catalog publishes every initiative and study about waste in Guanabara Bay that the mapping team recorded in the workbook. It follows the Core v2.0 database document; where Core v2.0 marks something Proposed, the importer warns instead of rejecting.

## Pages

| Page | Path | Route file | Implementation | Features |
|---|---|---|---|---|
| List | `/catalog` | `src/app/catalog/index.vue` | `pages/common/catalog/list/ListPage.vue` | search and filters |
| Details | `/catalog/:id` | `src/app/catalog/[id]/index.vue` | `pages/common/catalog/details/DetailsPage.vue` | entry details, mini map, participant drawer, person names |

**v0.5:** the old Overview (`/catalog`) was merged into **Home** (`/`, Home Journey): both halves of the catalogue, key numbers, bay sectors, distributions and highlights now open the site, and a click on a sector tile or on a bar opens the entries in a **side drawer** instead of leaving the page. The site header has two tabs — **Início** (Home) and **Catálogo** (this list). The List moved from `/catalog/list` to `/catalog`; the server answers old links with a 301 that keeps the query (`server/middleware/legacy-routes.ts`).

**v0.8:** there is **no Catálogo tab** any more — **Buscar** (header, top right) opens this List and is marked current here, and Início's drawer covers browsing. Entry cards follow **option 2, “Estruturado e Escaneável”**: kind tile and label with the status badge, the name as the title, the objective, a meta row (*Local*, *Período* or *Publicação*) and *Temas* chips ([design system](../design-system.md)). On Início the “Iniciativas ativas” tile and the municipality chart are gone (the Mapa tab covers places); a new **Estudos por academia** chart lists academic institutions by the studies they take part in (`listInstitutions({ type: 'academica', kind: 'study', sort: 'entries' })`) and opens the drawer with *Instituição* + *Tipo: Estudo*.

**v0.8.1:** the overview's distribution buckets carry **`projects` and `studies`** (`CatalogKindBucket`; count = projects + studies) so Início can split each keyword bar into initiatives (orange) and studies (purple); the list facets keep plain buckets.

**v0.9 — compact entry page and smarter filters:**

- **Details** answers first, in the header: kind, status, name, objective and a key-facts strip (`CatalogEntryKeyFacts`: when — or *Publicado em* for studies —, municipalities, bay sectors, ID). The “← Catálogo” link is gone. Below: the reported results as a callout tinted by kind (`CatalogEntryNarrative part="results" :kind`), one card with **Onde** and **O quê** side by side (`CatalogEntryFacts group="where" | "what"`), and the mapping notes behind a closed disclosure (`part="notes"`). Beside it: **No mapa** (`MapLocator` from `useGetCatalogMap`, municipalities matched by name, sectors by code; links to `/map`), **Quem participa** (`CatalogEntryParties selectable` with emblems; an institution opens its entries in the shared drawer) and **Fontes** (host and one-line path).
- The entry's parties carry the institution's **`code`** (slug, `null` for people and unlinked names) so the page can open the drawer with `institution=<code>` — `CatalogPartyView.code` in the contract and `openapi.json` (0.9.0).
- **Filters that can narrow:** `CatalogFilters` (with `total`) and the drawer's “+ Filtro” offer a dimension only when one value would narrow the results (0 < count < total) or it is in use; the drawer says when nothing is left to add.
- Início: the cards are striped by what they count (`CatalogDistribution` `tone` → orange, purple or both) and mechanisms carry their icon slot (`itemIcons="mechanism"` → `CatalogMechanismIcon`). “Ver as 24 iniciativas / Ver os 17 estudos” under Destaques were removed.

**v0.9.1 — entry header card:** the header is a card the width of the content (`CatalogEntryHeader`: kind chip `lg` + status + ID on one line, name, objective, *when* alone and larger — `publicationYears` for studies, the period otherwise — and a photo place, `photo`). Municipalities and bay sectors moved on top of the mini map (`CatalogEntryKeyFacts` with `parts` and `layout="stack"`) and are no longer repeated under Onde; **Fontes** is an open card in the main column, after the mapping notes.

**v0.9.14 — map card:** the municipalities and the bay sectors sit **side by side** over the mini map (`CatalogEntryKeyFacts layout="row"`: the sector to the right of the municipality, wrapping to the next line only when the lists are long), and the mini map paints the municipalities in the **Mapa's green** (`MapLocator` default `tone="place"`) instead of the entry's kind colour, so it reads like the big map.

**v0.9.20:** Início's *Explorar o catálogo* shows four cards of one design (`CatalogExploreCard`): the two kinds, Instituições (grey) and Municípios (green), the last two from the overview's totals.

**v0.9.18:** the overview's highlights are **three per kind** (were four), shown on Início as small entry cards; every mechanism has its **glyph** (`catalogMechanismIcons`), in the *Mecanismo* menu and chip, the drawer and the entry page.

**v0.9.11:** **Catálogo is a tab again**, right after Início, and the Buscar button is gone (the List's own panel is the search; the guided tour's last step points at the tab).

**v0.9.4:** the header's floating Buscar shows on Início only; on this List the filter panel is **glued to the header** (starts at its lower edge, anchored at `--layout-header-height`; rounded corners and 12px wider than the cards on each side since v0.9.7) and rows of cards have more air between them. In the drawer, a filter in use can be **swapped** from “+ Filtro” (its values come from the facet counted without it).

**v0.7:** labels of the controlled vocabularies (keywords, sectors, mechanisms, site/institution/source types, indicators) follow the visitor's language through `Accept-Language` (`packages/catalog-domain/src/i18n`: `TAXONOMY_LABELS`, `localizeSnapshot`, one reader per language); a test fails when a code in the snapshot has no en/es/fr label. The API contract is `packages/catalog-domain/openapi.json`, validated against every read by `src/contracts/openapi.tests.ts`.

**v0.6:** the List has no band text — the explanation, the count, the sort and the pages sit on the results line of an **anchored filter panel** (`FilterPanel`, sticky under the site header from 720px). Entry cards lead with the objective; the name stays as one short dark reference line (option B). A new **Instituição** filter (searchable) joins the others, and the same institution filter powers the Instituições Journey ([`institutions.md`](institutions.md)). The drawer on Início and Instituições now **stacks filters**: each is a removable chip and “+ Filtro” adds another (dimension, then value with counts within the current results).

`:id` is the workbook ID — the permanent public reference (D-047). Unknown or malformed IDs answer **404** with a not-found state.

The List keeps all state in the URL (`?q&kind&status&from&to&keyword&municipality&sector&mechanism&institution&sort&page`), so every result set is linkable and the back button works.

### Filters

| Filter | URL | Control | Rule |
|---|---|---|---|
| Kind | `kind=project\|study` | segmented toggle with the hand / lens icons and counts | "Todos" shows both icons |
| Status | `status=active\|ended…` | menu with status dots | confirmed statuses only; offered only when entries have them |
| Period | `from=YYYY-MM&to=YYYY-MM` | month calendar with presets (este ano, últimos 12 meses, últimos 5 anos) | entries whose activity (start → end, or → today while ongoing) overlaps the months; entries with no start never match while a period is set |
| Keyword | `keyword=<code>` | menu grouped by category, with keyword icons | |
| Bay sector | `sector=<slug>` | menu with the sector maps | |
| Municipality, mechanism | `municipality=`, `mechanism=` | menus | |
| Institution | `institution=<slug>` | menu with a search field (63 options) | entries the institution takes part in, in any role (executor, funder, partner, authors' institution) |
| Text | `q=` | search field | accents and case ignored |

Every menu shows counts computed against the other active filters (facets), and the active filters appear as removable chips with their icons. Menus are `FilterMenu` listboxes in a popover (keyboard: arrows, Home/End, Enter, Esc; long lists add a search field); on phones they open as bottom sheets. The results line holds the count and the explanation (left), the sort and the pager (right); on phones, where the panel is not anchored, the pager repeats under the list.

## Data flow

```text
workbook (Geral + Listas)
  → pnpm catalog:import --file <xlsx>          packages/catalog-domain/src/cli/import.ts
  → importCatalog() — Core v2.0 rules           src/importer/importCatalog.ts (pure)
  → data/catalog-snapshot.json + data/import-report.md
  → getCatalogReader()                          src/read/
  → /api/catalog/overview · /entries · /entries/:ref · /institutions · /map    apps/clients-webapp/server/api/catalog
  → CatalogService · InstitutionsService → useGetCatalogOverview / useListCatalogEntries / useGetCatalogEntry / useListInstitutions
  → Pages (Home: panorama + drawer · Catalog: list, details · Institutions: list + drawer)
  → Presentation Lake (Shared + Journeys/Catalog + Journeys/Institutions)
```

## How the workbook becomes the catalog

| Workbook | Snapshot (Core v2.0 shape) | Rule |
|---|---|---|
| `ID` | `entries[].ref` | Positive, unique; added and retired IDs are reported |
| `Mecanismo de atuação` = `não se aplica` | `kind: 'study'` (else `'project'`) | The workbook has no kind column — inferred, and reported |
| `Data de início/fim` | `{ date, precision }`; `em curso` → `ongoing` | `2021-12-DD` = month, `2022-MM-DD` = year (D-033) |
| `Setor`, `Município`, `Bairro`, `Rios`, `UC`, `Colônia` | `places` by type | Declared territory (D-028) |
| `Instituições Executoras` | executors (initiatives) or authors' institutions (studies) | Asked to the mapping team |
| `Executores`, `Financiadoras`, `Parceiras` | parties with roles | One link table for every role (D-030) |
| `Coordenador Geral`, `Autores (estudos)` | person parties with a note | Left out with `--without-persons`; hidden by the flag |
| `DOI ou link` (`" ; "`) | one source per link | Type/venue/year paired only when there is one link |
| `não se aplica`, `não encontrado`, `sem informação`, `Não confirmado` | absence | Never a value; counted in the report (D-032) |
| Pendências, Lacunas, Categorias | — | Not imported (D-042) |

Errors (missing columns, duplicate IDs, values not in Listas, invalid dates) reject the whole import and leave the snapshot unchanged. Warnings are published with it; the current ones are the basis of the questions to the mapping team.

## Presentation

Shared units added for the catalog, each with a story: `Tag`, `DescriptionList`, `StatCard`, `BarList` (ranked bars, values printed at the tip; since v0.8.1 the whole row is the link or — with `selectable` — the button, bars can take one `color` or be split into `segments` said in words), `Select`, `Pagination`, `EmptyState`, since v0.5 `Popover`, `Drawer` and the `CardGrid` primitive, and since v0.6 `FilterMenu` (promoted from the Catalog), `FilterPanel`, `Emblem` and interactive `StatCard`s.

Journey patterns (`packages/presentation-lake/src/Journeys/Catalog`): `CatalogKeyNumbers`, `CatalogKindDuo`, `CatalogSectorGrid`, `CatalogDistribution`, `CatalogHighlights`, `CatalogEntryCard`, `CatalogFilters` (with `Components/CatalogKindToggle` and `CatalogPeriodPicker`; its menus are the Shared `FilterMenu`), `CatalogResultsDrawer`, `CatalogEntryHeader`, `CatalogEntryBadges`, `CatalogEntryFacts`, `CatalogEntryParties`, `CatalogEntrySources`, `CatalogEntryNarrative` (`part`, `kind`), `CatalogEntryKeyFacts` (v0.9), `CatalogMechanismIcon` (v0.9; glyph registry `catalogMechanismIcons.ts`, monogram slot until a glyph exists), `CatalogPeriod` (partial dates at their precision), `CatalogIcon`, `CatalogTag`. Labels of fixed lists (kind, status, periodicity, place types, roles, keyword categories) live in `Catalog.messages.ts`. Result cards use `CardGrid`: 1 column on phones, 2 up to 1599px, 3 from 1600px.

Unknown values are never drawn as a category: distributions show a note such as "8 entradas sem informação confirmada".

## Updating the data

```bash
pnpm catalog:import --file ~/Downloads/mapeamento.xlsx --dry-run   # check first
pnpm catalog:import --file ~/Downloads/mapeamento.xlsx             # write snapshot + report
git diff packages/catalog-domain/data/import-report.md             # review, then commit both files
```

The snapshot is bundled into the server build, so a new import is published by building and deploying.

## Tests

- Domain: `packages/catalog-domain` — parsers, import rules, reader incl. status, period and institution filters and the institution directory (in-memory workbooks; "today" is pinned).
- Server: `server/catalog/listQuery.tests.ts`.
- Presentation: every Catalog pattern and new Shared unit (`*.tests.ts`).
- Nuxt runtime: `apps/clients-webapp/tests/nuxt/catalogHooks.nuxt.tests.ts`, `catalogPages.nuxt.tests.ts` (Home panorama: coloured title, orange tour button, two key numbers, the academia chart and its drawer, stacked filters; List panel and filters from the URL; Institutions list and drawer; Details).

## Tracking

| Where | Event | Subject |
|---|---|---|
| Home | `feature_exposure` | `home.catalog-summary`, `home.catalog-sectors`, `home.catalog-distributions`, `home.catalog-highlights`; `home.catalog-drawer` on the first drawer opened |
| Home | `success` | `home.catalog-drawer.open` `{ dimension, code, filters }` · `home.catalog-drawer.filter-add` / `filter-remove` `{ dimension }` · `home.catalog-drawer.filter-clear` (dimension `institution` for the Estudos por academia chart; `home.key-number.select` was retired in v0.8 — the two remaining key numbers are plain links) |
| Home | `success` (tour) | `home.guided-tour.start` · `home.guided-tour.finish` `{ steps }` (steps actually shown: 7 on computers, 6 on the phone bar since v0.9.17) · `home.guided-tour.skip` `{ step, position }` |
| Site | `success` | `site.view-zoom.change` `{ level }` · `site.locale.change` `{ locale }` (both in Opções since v0.9.17) |
| Map | see [`map.md`](map.md) | `map.*` (drawer events under `map.drawer`) |
| Home | `error` | `catalog.overview.load`; `catalog.list.load` `{ source: 'home.catalog-drawer' }` |
| Institutions | see [`institutions.md`](institutions.md) | `institutions.*` (same drawer events under `institutions.drawer`) |
| List | `feature_exposure` / `empty` / `error` | `catalog.search` / `catalog.search` / `catalog.list.load` |
| List | `success` | `catalog.search.apply` `{ filters: [dimensions in use] }` (never the values) · `catalog.search.clear` |
| Details | `feature_exposure`, `empty`, `error` | `catalog.entry-details`, `catalog.entry-map` (when the mini map shows), `catalog.person-names` · `catalog.entry-details` · `catalog.entry.load` |
| Details | `success` | `catalog.entry.institution-select` `{ code }` · `catalog.entry-drawer.open` / `filter-add` / `filter-remove` / `filter-clear` (`feature_exposure` `catalog.entry-drawer` on the first drawer) |
