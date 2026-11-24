# Institutions Journey

**App:** `clients-webapp` · **Context:** `common` · **Journey:** `institutions` (public) · **Since:** v0.6

Every institution in the catalog — who executes, funds, partners in or signs the work — with its entries one click away. It reads the same mapping workbook as the Catalog: an institution is a party of kind `institution` in the snapshot (people are never listed here).

## Page

| Page | Path | Route file | Implementation | Features |
|---|---|---|---|---|
| List | `/institutions` | `src/app/institutions/index.vue` | `pages/common/institutions/list/ListPage.vue` | `institutions.directory`, `institutions.drawer`, `institutions.logos` |

The header's third tab, **Instituições**, and the "Instituições envolvidas" key number on Início lead here.

## Data flow

```text
snapshot (parties + entries) → getCatalogReader().listInstitutions(query)   packages/catalog-domain/src/read
  → GET /api/catalog/institutions?q&kind&role&type&sort&page&pageSize       server/api/catalog/institutions.get.ts
  → InstitutionsService → useListInstitutions                                services/common/institutions · hooks/common/institutions
  → ListPage → InstitutionFilters + InstitutionCard (Journeys/Institutions) and the Catalog drawer
```

Per institution the reader returns its type (when the workbook tells it), how many initiatives and studies it takes part in (each entry once) and the number of entries per role. Facets — kinds, roles, types — are counted in institutions against the other active filters; `allKinds` (v0.9.22, contract 0.9.1) counts the institutions of any kind under the same filters, each once — the toggle's "Todos", which is not the sum of the two kinds because an institution can work in both; `unknownTypes` counts institutions without a type (50 of 63 today: a question for the mapping team).

| Filter | URL | Rule |
|---|---|---|
| Name | `q=` | accents and case ignored |
| Works in | `kind=project\|study` | at least one entry of that kind |
| Role | `role=executor\|funder\|partner\|author` | at least one entry in that role |
| Type | `type=<institutionTypes code>` | known types only |
| Sort | `sort=entries\|name` | most entries first (default) or A–Z |

**Cards (v0.9):** a 4px stripe on top tells what the institution takes part in — orange (initiatives only), purple (studies only) or half and half (both), mirrored in `data-kinds` (`project`, `study`, `both`); the counts beside the kind icons say the same in words.

**v0.9.4:** like the Catálogo, the filter panel is glued to the header and anchored there (rounded, 12px wider than the cards on each side since v0.9.7); rows of cards have more air between them.

**v0.9.22 — filters laid out like the Catálogo's.** Row 1: **Todos · Iniciativas · Estudos** with counts (`Components/InstitutionKindToggle`, Journey-local — the Catálogo's `CatalogKindToggle` stays in its own Journey, no cross-Journey import), the name search and Buscar. Row 2: the **Papel** and **Tipo** pills (the "Atua em" pill is gone: the toggle does its job). Row 3, only with filters in use: **Filtros ativos** — the name, the role and the type as removable chips — and *Limpar filtros* on the right (the kind shows in the toggle, not as a chip). Every choice submits at once, as before.

## Drawer

A click on an institution opens the shared catalogue drawer (`useCatalogResultsDrawer`, `pages/common/catalog/catalogResultsDrawer.ts`) with the filter `Instituição: <name>`; more filters stack with “+ Filtro”, and “Abrir no Catálogo” opens `/catalog?institution=<slug>&…`.

## Official logos and flags

`Emblem` (Shared) shows an institution's official logo or a municipality's flag next to its name, falling back to a monogram (logos) or the dimension icon (flags). Files are **not** collected from the web: BVRio supplies them — flags from official municipal sources, logos only with each institution's authorisation — into `apps/clients-webapp/public/emblems/` and registers them in `src/shared/hooks/emblems/emblems.ts`. Until then every institution shows its monogram.

**Research to do (v0.9 note):** most institutions publish a logo and 50 of 63 have no type in the workbook. Both are worth a research pass on the web — but the result is a **list for BVRio** (institution, suggested type with its source, where the official logo lives), not files or types added to the portal directly: types go back into the mapping workbook, and logos come in only with each institution's permission, as above.

**Logo catalogue (v0.9.23).** The research pass on logos is a Sheet, *Portal Guanabara — logos das instituições* (https://claude.ai/artifact/GLnfHUy5cLh7LB2DBURQzc), one row per institution of the portal (63, by its portal code): where its official logo lives (a brand manual or page, the official site, or BVRio's own partners page), its rules of use, and a status — *Manual oficial* 14, *Site oficial* 13, *Site da BVRio* 3, *Pedir autorização* 3 (FAPESP, Unifesp, MPRJ), *A confirmar* 11, *Para a Dra.* 14 (small local groups and ambiguous names, listed on their own tab for the mapping team) and *Sem logo* 5 (collective names such as *Colônias de pescadores*, which keep the icon). It points at the official files; none is copied into the portal. A logo moves to `public/emblems/` only with the institution's permission, and its row then reads *Recebida*.

**Manuals read (v0.9.24).** Where an institution publishes a brand manual, its rules decide: *Pronta para adicionar* — official files public and no prior authorization asked of third parties: **Instituto BVRio, Prefeitura de Niterói (horizontal at least 4 cm ≈ 151px wide), UERJ (files of the Portal Uerj, symbol and logotype never apart) and Unicamp (at least 10 mm ≈ 38px tall)**; *Pedir autorização* — UFRJ (the Reitoria), CAPES (a website is not among the uses it allows), Governo do RJ (SECTI); *Pedir arquivos* — UFF (digital minimums: 180px standard, 220px horizontal, 85px vertical or symbol), UFRRJ, CNPq, PUC-Rio and FAPERJ publish no files; *A confirmar* — Fiocruz (third-party rule not read) and UFRGS (page unreachable). The four ready logos wait for their files: this workspace's network does not reach those sites, so they come from a browser into `public/emblems/institutions/` (by portal code), then get registered, at sizes that keep each manual's minimum.

## Tracking

| Event | Subject |
|---|---|
| `feature_exposure` | `institutions.directory`; `institutions.drawer` on the first drawer; `institutions.logos` when a logo is shown |
| `success` | `institutions.directory.apply` `{ filters: [dimensions] }` · `institutions.directory.clear` · `institutions.drawer.open` `{ dimension, code, filters }` · `institutions.drawer.filter-add` / `filter-remove` `{ dimension }` · `institutions.drawer.filter-clear` |
| `empty` / `error` | `institutions.directory` / `institutions.list.load`; `catalog.list.load` `{ source: 'institutions.drawer' }` |

## Tests

Domain (`createCatalogReader.tests.ts` — directory, filters, facets, institution filter), server (`listQuery.tests.ts`), Service, page models, lake (`InstitutionCard` — incl. the kind stripe, `data-kinds`; `InstitutionFilters`, `Emblem`, drawer), Nuxt runtime (`catalogPages.nuxt.tests.ts` — list, URL filters, drawer).
