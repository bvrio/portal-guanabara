# Map Journey

**App:** `clients-webapp` · **Context:** `common` · **Journey:** `map` (public) · **Since:** v0.7

The municipalities around Guanabara Bay and the bay's sectors, with what the catalogue has in each, one click away in the side drawer. Municipalities are shaded **green by their entries** (v0.9.5 — green is neither kind) and carry an **orange badge** with their initiatives and a **purple circle** for their studies, sized by count (v0.8). The outlines are **provisional** (simplified, IBGE-derived) and the sector zones are **hand-drawn**; where the official geometry is stored is decided with BVRio — see [`backend.md` §5](backend.md#map-outlines--where-to-store-them-to-decide).

## Page

| Page | Path | Route file | Implementation | Features |
|---|---|---|---|---|
| Explore | `/map` | `src/app/map/index.vue` | `pages/common/map/explore/ExplorePage.vue` | `map.municipalities`, `map.sectors`, `map.drawer` |

The header's fourth tab, **Mapa**, and the "Municípios com atuação" key number on Início ("Ver no mapa") lead here.

## Data flow

```text
data/municipality-boundaries.json (20 RJ municipalities, provisional) ─┐
data/bay-sectors.json (4 hand-drawn zones, provisional) ───────────────┤
snapshot (entries × municipality and sector places) ───────────────────┴→ getCatalogReader(locale).getMap()
  → GET /api/catalog/map                                   server/api/catalog/map.get.ts
  → MapService → useGetCatalogMap                          services/common/map · hooks/common/map
  → ExplorePage → MunicipalityMap + MunicipalityList + BaySectorList (Journeys/Map) and the Catalog drawer
```

`CatalogMap` (`@portal-guanabara/catalog-domain/contracts`, `openapi.json`): the view (bounds), every municipality with its IBGE code, outline (GeoJSON MultiPolygon coordinates) and entries / initiatives / studies — the ones with entries first — plus `unknown` (entries without a confirmed municipality), **`sectors`** (v0.8: every bay sector in the zones' order — head of the bay → open sea — with entries / initiatives / studies, its zone as a MultiPolygon or `null` for *Baía inteira*, and a `label` point in the water), `unknownSectors` and the source note. A municipality's or sector's count is the same as the Catalog's `municipality=` / `sector=` filter (tested).

## Outlines (provisional)

**View (v0.8).** `MAP_VIEW` is west −43.56, south −23.04, east −42.76, north −22.50: the bay, its mouth and the eight municipalities' badges, so the bay reads about 1.4× larger than v0.7's view; municipalities that do not touch it are no longer in the file.

`pnpm catalog:boundaries --file <municipios-poligonos.json>` rebuilds `packages/catalog-domain/data/municipality-boundaries.json` from the open npm package `ibge-cidades-com-poligonos` (IBGE municipalities × outlines, ISC): RJ municipalities that touch the view, coordinates rounded to 4 decimals, repeated points dropped. Unpack the package in a folder of its own and pass the path — the file is data, never executed. The outlines are coarse; the official IBGE *Malha Municipal* replaces them when the backend stores it.

## Bay sectors (provisional, v0.8)

`data/bay-sectors.json` (`BaySectorZones`, `src/model/baySectors.ts`) draws the mapping team's division as zones in the water. Only the lines across the water matter — the map draws the land over the rest:

| Sector | Zone | Line |
|---|---|---|
| Interior | north of 22.79°S | north shores of Ilha do Governador and Paquetá |
| Transição | 22.79°S – 22.88°S | down to the Rio–Niterói bridge (Caju → Ponta da Armação) |
| Entrada | 22.88°S – the mouth | the mouth: Pão de Açúcar → Fortaleza de Santa Cruz |
| Fora da Baía | a half-disc of ~11 km past the mouth | — |
| Baía inteira | none — a pill over the sea (v0.9.9) | — |

The lines are approximate. Transição has a single entry today (a study also tagged Interior); it is kept as recorded and the question goes to the mapping team rather than folding it into another sector. The official division — and its geometry — is decided with BVRio.

## Presentation (`Journeys/Map`)

| Unit | What |
|---|---|
| `projection.ts` | Equirectangular projection scaled by the cosine of the middle latitude; SVG path of a MultiPolygon; badge point (centroid of the largest ring) |
| `scale.ts` | Four classes of **entries** from the maximum (1 · max/8 · max/4 · max/2 → 1–2, 3–5, 6–10, 11–22 today), filled with four steps of the mangue green (`--color-map-place-1…4`, v0.9.5; by initiatives in Comlurb orange in v0.8); `studyRadius` sizes the purple circles by area (12 → 29 map units) |
| `MunicipalityMap` | SVG: water, then the sector zones (dashed, tinted on hover/focus), neighbours in névoa grey, municipalities with entries as buttons (click, Enter, Space) with an orange badge (initiatives) and a purple circle (studies); **municipality names** over their markers (v0.9.30); sector names and markers on top; caption with name and counts on hover/focus (outside the frame since v0.9.13, positioned by `--map-caption-left`); legend (initiative classes, study circles, sem entradas, água, setores). Phones: markers ×1.7, caption under the map. Emits `select` / `selectSector`; `v-model:highlighted` / `v-model:highlighted-sector` |
| `MapKindCounts` (v0.9.5) | Initiatives over studies, one per line with the kind's dot — used by both lists so they stay narrow; none is written as a number (“0 iniciativas”, v0.9.6) so the lines align. In each row the colour swatch and the total are centred on the row (v0.9.6) |
| `MunicipalityList` | `layout`: `list` (default) or `grid` (v0.9.8, the horizontal variation). The same municipalities as a list (colour by initiatives, name, initiatives × studies, count) — the map's text alternative; hover/focus highlights the map (`v-model:highlighted`) |
| `BaySectorList` | The sectors with entries as a list (dashed swatch for zones, solid for Baía inteira, name, initiatives × studies, count); hover/focus highlights the zone |
| `MapLocator` (v0.9) | A small static map for the catalogue entry page: the same outlines at width 600, `role="img"` with the places named in `label`; `highlighted` municipalities filled in the Mapa's green (`tone="place"`, default since v0.9.14 — `--color-map-place-3`, mangue 300; `project` / `study` paint a kind's colour on request), `highlightedSectors` zones tinted (Baía inteira has no zone). No interaction — the card links to the Mapa |

## Layout (v0.9.9)

**The map alone**, centred in the panel at most 52rem wide (v0.9.10; proportions kept): no summary line, no Municípios or Setores da baía lists (the page's h1 stays for assistive tech). Under the legend one line says what the map cannot show (entries without a confirmed municipality or sector). Every place is a keyboard button with its name and count, so the map is its own text alternative; *Baía inteira*, which is not one area, is a **pill over the sea** (bottom right) with its two markers.

**The caption** (top left) is **outlined in the colour of the place under the pointer** (its green step; the light water blue for a sector; white inside since v0.9.10) and says **initiatives over studies** — no total — on the lightest orange and purple (`--color-kind-*-chip`); while the pointer is **on a marker**, that line turns to the marker's own colour (`--color-kind-project` / `--color-kind-study`).

**Caption size and place** (v0.9.13): the caption is a larger card (15rem wide, at least 9.5rem tall, a little lower than the map's top) placed **across the map's left edge**, half over the white panel: it sits on the map figure (the figure is the size container), and the page moves it left with `--map-caption-left` (−2.5rem from 960px, −6rem from 1100px). Inside: the place's name over a divider, then one row per kind with the **number large** and the word beside it (`projectsLabel` / `studiesLabel`, “0 iniciativas” kept). Without a place it shows the hint, centred. In containers up to 560px it sits under the map at full width.

**The band** (v0.9.23): the structure band under the header reaches the top of the caption card — the strip above the panel (16px) + the panel's border and padding + the caption's offset in the map, which the page sets as `--map-caption-top` (a `MunicipalityMap` hook, 32px), so the two stay in line.

`MunicipalityList` (incl. its `grid` variation, v0.9.8) and `BaySectorList` stay in the Presentation Lake with their stories, unused by the page since v0.9.9.

## Markers open their kind (v0.9.6)

A click on a place opens its entries; a click **on one of its markers** opens them already filtered by that kind — the orange badge adds *Tipo: Iniciativa*, the purple circle *Tipo: Estudo* (`MunicipalityMap` emits `select(place, kind)` / `selectSector(sector, kind)`). Markers answer the pointer (thicker outline on hover). Markers scale with the map's width: ×1.7 under 560px, ×1.35 up to 760px.

**Short names** (v0.9.6): the Municípios list shows *D. de Caxias* and *S.J. Meriti* (`MUNICIPALITY_SHORT_NAMES` in `mapPageModels.ts`, `MapMunicipality.shortName`); the full name stays the row's accessible name and title, and is used on the map, its caption and the drawer.

**The guided tour** (v0.9.31) opens this page at its Mapa step and lights the panel (`data-tour="map"`), caption included.

**Names on the map** (v0.9.30): each municipality with entries is named over its markers — dark capitals (15 units, bold, a white halo), smaller than the sectors' teal names, so places on land and zones in the water read apart. A name longer than 16 characters gives way to its short one (*S.J. Meriti*); *Duque de Caxias* fits in full. The names are one layer above every shape (no neighbour covers them) that lets the pointer through, and they are hidden for assistive tech (each municipality button already carries its name). The hovered municipality's name turns to the structure blue. Hidden under 560px, where the map is too small for them to read; the caption names the place on tap. Neighbours without entries stay unnamed.

## Drawer

A click on the map opens the shared catalogue drawer (`useCatalogResultsDrawer`) with `Município: <name>` or `Setor: <name>`; more filters stack with "+ Filtro", and "Abrir no Catálogo" opens `/catalog?municipality=<slug>&…` or `/catalog?sector=<slug>&…`. On computers the map stays in view (sticky) while the two lists scroll.

## Tracking

| Event | Subject |
|---|---|
| `feature_exposure` | `map.municipalities`, `map.sectors`; `map.drawer` on the first drawer |
| `success` | `map.municipality.select` / `map.sector.select` `{ code, source: map \| list, kind? }` (`kind` when a marker was clicked) · `map.drawer.open` / `filter-add` / `filter-remove` / `filter-clear` |
| `error` | `catalog.map.load`; `catalog.list.load` `{ source: 'map.drawer' }` |

## Tests

Domain (`createCatalogReader.tests.ts` — municipality and sector counts, order, agreement with the list filters, published map and sectors; `buildBoundaries.tests.ts`), contract (`openapi.tests.ts`), Service, page models, lake (`projection.tests.ts` incl. `studyRadius`, `MunicipalityMap` — classes by initiatives, markers, zones, legend; `MunicipalityList`; `BaySectorList`), Nuxt runtime (`catalogPages.nuxt.tests.ts` — map markers, zones, sector list and drawer; `locale.nuxt.tests.ts` — French).
