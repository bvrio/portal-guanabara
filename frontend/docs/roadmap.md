# Portal Guanabara — Frontend roadmap

The step-by-step plan from the React template to the Portal Guanabara web app. Each phase ends with a verifiable outcome.

**Scope change (November 2026).** BVRio decided on **one public web app and no BFF** (root `AGENTS.md` §0, Core v2.0 D-042). The old Phase 4 (real BFF) and Phase 5 (more Apps) are out of scope; the data-access question they answered is now Phase 4 below and waits on BVRio. See `docs/architecture/no-bff.md`.

## Phase 0 — Machine setup ✅

Follow `docs/setup/macos.md`.

## Phase 1 — Run the starter ✅ (v0.1)

Monorepo, translated contracts, Presentation Lake in Vue, `clients-webapp` with 5 routes, architecture validation.

## Phase 2 — Team foundations ⏸ deferred

Skipped while the project has a single developer, and waiting on BVRio's answers about repository hosting and CI (questionnaire Q27–Q28). Pick it up before a second person joins:

1. Company Git remote; protect `main`.
2. CI: `pnpm install --frozen-lockfile` → `pnpm verify` → `pnpm build` → `build-storybook`.
3. ESLint flat config (`@nuxt/eslint`) + Prettier (or Biome).
4. CODEOWNERS derived from Journey ownership.
5. Production deployment target (Node server, container or Nitro preset).

## Phase 3 — Complete the V0 seed ✅ (v0.2)

- [x] User Journey: Overview hub + `User/Details` + `User/Management` (profile, password, communication preferences).
- [x] Journey Manifest schema v1 (`packages/journey-manifests`) for Authentication, Home and User.
- [x] Mock backend on Nitro (`/mock-bff/*`): session, personas, operations, Feature Management.
- [x] Feature Management consumer, Feature Flags, tracking derived from manifests, `NuxtLink` adapter, DEV toolbar.

Authentication and User are now **demo Journeys** (no logins, D-042); BVRio decides whether they stay (Q20).

## Phase 3b — Catalog Journey ✅ (v0.3)

- [x] `packages/catalog-domain`: workbook importer with the Core v2.0 rules (all or nothing, report, placeholders as absences, partial dates, permanent IDs), snapshot, read services, 30 tests.
- [x] App API without a BFF: `server/api/catalog/*` (overview, list with facets, details; 404 for unknown IDs; cache headers).
- [x] Catalog Journey Manifest with a parameterized page (`/catalog/:id`); validator, navigation and tracking support `:param` segments.
- [x] Pages: Overview (key numbers, four distributions, highlights), List (search, filters and paging in the URL), Details (facts, places, parties, sources, narrative, not-found state).
- [x] Presentation Lake: Shared `Tag`, `DescriptionList`, `StatCard`, `BarList`, `Select`, `Pagination`, `EmptyState`; twelve `Journeys/Catalog` patterns; stories for both.
- [x] Person names behind the `catalogPersonNames` flag, decided on the server (on in `nuxt dev`, off in builds).
- [x] `src/lib/bff` → `src/lib/http` (`apiClient`, `mockBffClient`).

## Design system — Bay + Comlurb ✅ (v0.4)

- 60/30/10 palette: névoa canvas, baía structure, soft Comlurb orange with black text for actions; meaning colours for the kind duo, keyword categories, bay sectors and status ([`design-system.md`](design-system.md)).
- Duotone icon set in `Shared/foundations/Icon`: interface glyphs, the bay mark traced from the real shoreline (Ilha do Governador, Fundão, Paquetá), five sector glyphs, the project/study duo and twenty keyword glyphs; `CatalogIcon` maps catalogue codes to them.
- Site header and footer (`Shared/features`), `PageHero`, link buttons; Home, Catalog overview, list (compact filter toolbar with icon toggle, pills and active chips) and entry page redesigned.
- Entry summaries now carry their bay sectors (`CatalogEntrySummary.sectors`).

## Home + Catalog rework ✅ (v0.5)

- **Início** now holds the catalogue panorama (the old Catalog Overview): duo, key numbers, bay sectors, themes, highlights. Sector tiles and chart bars open the entries in a **side drawer**.
- **Catálogo** is the list at `/catalog` (301 from `/catalog/list`, query kept). Cleaner bands: no breadcrumb, eyebrow or repeated title — only the explanation.
- New filters: **status** (Ativa, Encerrada…) and **period** (month calendar with presets). Filters are menus with icons, counts and grouping instead of native selects; bottom sheets on phones.
- **Guided tour** on Início (flag `homeGuidedTour` now on by default, kept as a kill switch).
- **Cards rule:** 1 / 2 / 3 columns (`CardGrid`), content width 1440px from 1600px.
- Manifests: the overview features moved to Home (`home.catalog-*`); tracking covers the drawer, the tour and filter use.

## Instituições, official mark, anchored filters ✅ (v0.6)

- **Instituições** tab (new Journey `institutions`, `/institutions`): every institution with its type, initiatives × studies and roles; a click opens its entries in the drawer. Domain `listInstitutions` + `GET /api/catalog/institutions`; the Catálogo gains an **Instituição** filter.
- **Drawer with stacked filters** on Início and Instituições: removable chips and “+ Filtro” (dimension → value with counts).
- **Início:** “Explorar o catálogo” is now the title of the duo (button removed); the “entradas no catálogo” tile is gone; the three key numbers open what they count (active initiatives in the drawer, Instituições, the municipality chart).
- **Catálogo:** no band text; anchored `FilterPanel` with a results line (count, explanation, sort, redesigned pager).
- **Cards (option B):** objective as headline, the name as one dark reference line.
- **Official colour mark** (option D) in the header and on Início; **kind icons** now hold the bay's water outline.
- **View size** menu (“Tamanho”, top right) — rescaled in v0.7 to 100 / 110 / 120 %.
- **Emblem slots** for municipal flags and institution logos, with monogram fallback — **waiting on BVRio** for authorised files (`public/emblems/README.md`).

## Mapa, four languages, view size rescaled, backend defined ✅ (v0.7)

- **Mapa** tab (new Journey `map`, `/map`): the municipalities around the bay coloured by their entries (four classes of orange), a list beside the map, the drawer on click; the “Municípios com atuação” key number leads here. Outlines are **provisional** (IBGE-derived, simplified) — [`map.md`](architecture/map.md).
- **Languages:** Português (default), English, Español, Français — a menu right of Tamanho, a cookie, `<html lang>`, the server renders in it. Every message has en/es/fr translations (`locales/<locale>.json`, checked by `pnpm i18n:check`); controlled vocabularies (keywords, sectors, mechanisms, types) are translated by the API (`Accept-Language`); entry texts and proper names stay in Portuguese, marked `lang="pt-BR"`.
- **View size:** 100% (default, the designed size), 110%, 120% — v0.6's 80% is now 100% and v0.6's 100% is now 120%.
- **Brand mark:** centred on Início, with PORTAL on the land west of the bay's mouth and GUANABARA on the sea (wordmark variant, large sizes only).
- **Tour:** 8 steps (7 on phones) with the new language step; the tabs step names the four tabs.
- **Backend first definition** with BVRio's stack ([`backend.md`](architecture/backend.md)): core-bvrio, Spring Boot (controller → service → dao), MySQL on RDS, static SPA on S3 + CloudFront; API contract `packages/catalog-domain/openapi.json` checked against the real responses; proposed MySQL schema; plan to retire the Sheet (load → editors → public suggestions).

## Sobre nós, account in the header, structured cards ✅ (v0.8)

- **Sobre nós** tab (new Journey `about`, `/about`): testimonial, the team (master's student, doctor, BVRio staff) and the FAPERJ scholarships — **work in progress**: role placeholders until names, photos and the scholarship details arrive ([`about.md`](architecture/about.md)).
- **Catálogo tab removed:** Buscar (top right) still opens the catalogue list and is marked current there; Início's drawer covers browsing.
- **Account in the header**, right of the language menu: “Entrar” (to the login page) or an avatar with the initials of the first and second names (to Minha conta). Read from `GET /authentication/session` (mock).
- **Phone menu** redone: a side drawer with the tabs, Buscar, view size (tablets), language buttons and the account. The header switches to it when it gets narrow (container query) as well as on phones.
- **Cards (option 2, “Estruturado e Escaneável”):** kind tile and label, status badge, the name as the title, the objective, then Local / Período (or Publicação) and Temas chips. Option B's objective-headline layout is retired.
- **Início:** “Quem **estuda** e quem **atua**” with estuda in the research purple and atua in the action orange; the mark sits further left; “Começar o tour” is an orange primary button with a one-line hint; the “Iniciativas ativas” tile, the municipality chart and “Por onde começar” are gone; new **Estudos por academia** chart (studies per university, opens the drawer).
- Kind duo cards adapt to their own width (container query), so two cards side by side at 120% no longer overlap.

## Início and Mapa polish ✅ (v0.8.1)

- **Início:** the hero band ends above “Explorar o catálogo”; every section title sits between two hairlines (Explorar o catálogo, Onde atuam, Temas…, Destaques — the last with a new star glyph). Tour hint: “Novo por aqui? Faça um tour pelas principais funcionalidades.”
- **Bars:** the whole row is the link/button (the name is plain text); keyword bars are split into initiatives (orange) and studies (purple) with a legend and the parts in words; *Mecanismos de atuação* bars are orange, *Estudos por academia* purple. The overview API's buckets now carry `projects` and `studies`.
- **Mapa:** municipalities coloured by **initiatives** with an orange badge; a **purple circle** per municipality for its studies, sized by count; the **bay sectors** (Interior, Transição, Entrada, Fora da Baía) as dashed zones in the water with their markers, and a *Setores da baía* list (Baía inteira included) — click opens the drawer. Zones are hand-drawn and provisional; Transição is kept as recorded (one study) and flagged to the mapping team. The map view is tighter so the bay reads larger; the map stays in view while the lists scroll.
- **Phone menu:** Início, **Buscar**, Instituições, Mapa, Sobre nós, then **Idioma** (opens in place to the four languages; the current one under its name); no dividing lines. The bar shows the account left of ☰ and Buscar in the middle; the language pill moved into the menu.

## Sobre nós content, compact entry page, two-row header ✅ (v0.9)

- **Sobre nós** filled from the FAPERJ proposal: the project (name, objective, institution, funding, 24 months, pilot case Pescando Resíduos), partners (COOPROMAR, UFRJ, INEA, Ogyre), milestones, the three roles, the two scholarships and a **first-year schedule** per scholarship (ME2 / DE2, month grid with year-2 marks). Names, photos and the testimonial still wait on the people ([`about.md`](architecture/about.md)).
- **Entry page, compact summary:** no “← Catálogo”; key facts in the header (when, where, sectors, ID); results callout in the kind colour; Onde | O quê side by side; mapping notes behind one disclosure; **mini map** (`MapLocator`); **clickable participants** open their entries in the drawer (parties now carry the institution `code`).
- **Header in two rows** on tablets and computers (mark and tools, then tabs; 112px) — long translations no longer collide; the phone bar is unchanged.
- **Filters that can narrow:** a filter is offered only when it would change the results (catalogue panel and the drawer's “+ Filtro”).
- **Colour by kind:** institution cards and Início's chart cards get a stripe — orange, purple or both; the results callout follows the entry's kind.
- **Mechanism icon slot** (`CatalogMechanismIcon`): a monogram today, a glyph per mechanism later.
- Drawer with rounded corners; `secondary` buttons outlined; “Ver as 24 iniciativas / 17 estudos” removed from Destaques.
- **Next research (needs BVRio):** official logos of the institutions (only with each one's permission) and the type of the 50 of 63 institutions without one — as a list for BVRio and the mapping workbook, not added straight to the portal.

## Header search, entry header card, same-origin API ✅ (v0.9.1)

- **Buscar** is the orange action of the header, on the tabs' row under the tools (lens in purple).
- **Início:** key-number and sector icons in the top-right corner (key numbers' icons larger); the key numbers' action label sits on the right with its arrow.
- **Entry page:** the header is a card the width of the content — one kind icon (in a larger chip), the ID beside it, *Publicado em* (or the period) alone and larger, a place for a photo; municipalities and sectors on top of the mini map; Fontes as an open card after the mapping notes.
- **API on the same origin (Q-B1 answered):** the path is fixed to `/api`; CloudFront routes it to core-bvrio; `API_PROXY_TARGET` proxies it locally to a running Spring service ([`backend.md`](architecture/backend.md)).

## Floating Buscar ✅ (v0.9.2)

- **Buscar** is larger (52px) and floats on the header's bottom edge, half outside, anchored with the header; it is centred over Início's large mark, which moved right to the content's edge (one shared slot, `--layout-header-search-slot`). Anchored filter panels and the sticky map leave room for it.

## Sobre nós: the team by name ✅ (v0.9.3)

- **Quem faz o portal** names the people: the FAPERJ fellows **Glauber Amarante e Silva** (Mestre-Empresa, Engenharia de Software) and **Raissa Celina da Costa Sousa** (Doutor-Empresa, Oceanografia Física), and the Instituto BVRio team **Pedro Succar**, **Maria Accioly**, **Juliana Miranda** and **Uriel Bertoche** — grouped and described like BVRio's own team page. Photos still come from each person.
- Removed: the year-one schedule (`AboutSchedule`), the milestones and the testimonial (`AboutTestimonial`).

## Início mark on the left, Buscar on Início only, glued filters ✅ (v0.9.4)

- **Início:** the large mark moves to the left of the title and text.
- **Buscar** (the floating orange button) shows on Início only; Catálogo and Instituições have their filter panel **glued to the header**, anchored there; rows of cards have more air.
- **Drawer “+ Filtro”:** a filter in use can always be swapped for another value with entries; the note says so when nothing new would narrow.

## Mapa: three columns and green places ✅ (v0.9.5)

- **Desktop:** *Setores da baía* left of the map, *Municípios* right; each row stacks initiatives over studies, so both lists fit beside the map.
- **Places in green:** municipalities are shaded by their entries in four steps of the mangue green, so orange means only initiatives (the badges) and purple only studies (the circles).

## Mapa polish ✅ (v0.9.6)

- The two lists are cards and narrower (the map is wider); swatch and total centred on each row; “0 iniciativas / 0 estudos”; *D. de Caxias* and *S.J. Meriti* in the list.
- A click on the orange badge opens the place's **initiatives**, on the purple circle its **studies**.

## Filter panel polish ✅ (v0.9.7)

- Catálogo and Instituições: the filter panel keeps its rounded top corners and reaches 12px past the cards on each side.

## Mapa layout ✅ (v0.9.8)

- No summary line; the **map** on the left, **Setores da baía** on the right (title centred); **Municípios** as a horizontal card under the legend, in order around the bay (Rio, S.J. Meriti, D. de Caxias, Magé, Guapimirim, Itaboraí, São Gonçalo, Niterói).

## Mapa: the map alone ✅ (v0.9.9)

- No Setores da baía or Municípios lists: the map takes the panel's width; *Baía inteira* is a pill over the sea.
- The caption takes the colour of the place under the pointer and shows initiatives over studies (no total) on the lightest orange and purple; the line of the marker under the pointer turns to its darker colour.

## Mapa size and caption ✅ (v0.9.10)

- The map is smaller (at most 52rem wide, centred, same proportions); the caption is white with only its outline in the place's colour.

## Catálogo tab back ✅ (v0.9.11)

- The **Catálogo** tab returns right after Início (header and phone menu); the **Buscar** button is removed everywhere. The tour's tabs step says five tabs; its last step points at the Catálogo tab.

## Sobre nós intro ✅ (v0.9.12)

- The Sobre nós introduction takes the page content's full width (`PageHero descriptionWidth="full"`).

## Mapa caption ✅ (v0.9.13)

- The caption is larger and lower, placed across the map's left edge into the white panel; the place's name over a divider, then the number of initiatives and of studies in large type beside their word.

## Entry page map card ✅ (v0.9.14)

- The mini map paints the entry's municipalities in the Mapa's green (no longer the kind colour); the bay sector sits to the right of the municipality instead of under it.

## Footer without links ✅ (v0.9.15)

- The footer keeps the mark, the name and the one-line description; its links to Catálogo, Instituições, Mapa and Sobre nós are gone (the header's tabs already lead there). `SiteFooter` keeps its optional `#links` slot.

## Brand mark ✅ (v0.9.16)

- The mark's rim is the same black as the bay's contours (no longer `baia-600`), the white frame is gone, and the wordmark writes PORTAL GUANABARA together on the orange sea.

## One-row header, Opções, Início hero ✅ (v0.9.17)

- **Header in one row again:** the mark and a larger *Portal Guanabara* at the far left, the tabs in the middle, **Opções** and **Entrar** at the far right. The bar measures itself: first the name and the words of Opções and Entrar go (icons stay), then it becomes the phone bar.
- **Opções** gathers language and view size: the four languages with their flags (Brazil, United Kingdom, Spain, France) and the three sizes side by side; the phone menu's languages get the flags too.
- **Início:** the header hides its mark and name while the hero shows them (computers and tablets from 880px) and shows them once the hero band has scrolled away; *Portal Guanabara* in white over the plain mark; the text further right; the title breaks after *pela*; *estuda* and *atua* get a black contour as thick as the mark's islands. The guided tour has one step for Opções (7 steps, 6 on the phone bar).

## Início polish, Opções icons, mechanism glyphs ✅ (v0.9.18)

- The title's contour is halved (about 3px); *Portal Guanabara* is larger over the mark, with even room above and below them.
- Opções has its own icons — translation (“A” and “文” bubbles), zoom (a lens with a plus) and both together on the button — and says **Zoom** in every language, so the panel is narrower.
- Início's chart cards (Palavras-chave, Mecanismos de atuação, Estudos por academia) centre their headers; **Destaques** shows three small cards per kind (the overview now returns three).
- **Ten mechanism glyphs** replace the monograms wherever mechanisms appear: Início, Catálogo's menu and chip, the drawer and the entry page.

## Início hero rebalanced ✅ (v0.9.19)

- *Portal Guanabara* is now the band's largest words (the title one size down), with the same black contour as *estuda* and *atua*; it sits at the top and the text starts lower, level with the mark; the mark and the text are centred in the band as a pair.
- The Opções button is back to its sliders icon (the combined glyph is gone); the translation and zoom icons stay on the panel's sections.

## Explorar o catálogo in four cards, smoother brand hand-over ✅ (v0.9.20)

- **Explorar o catálogo** shows four cards of one design: Iniciativas (orange), Estudos (purple), **Instituições (grey)** and **Municípios (green, the Mapa's colour)**, the grey and green on the same steps as the kinds' colours.
- Início's title starts at the same height as *Portal Guanabara* again.
- The header's mark and name fade in **as the hero's own mark and name scroll under the bar**, step by step, instead of waiting for the whole green band to leave.

## Início: mark centred on the left ✅ (v0.9.21)

- *Portal Guanabara* and the mark are centred between the window's left edge and the start of the text (the hero's content now uses the whole width on computers).

## Sector tiles in two rows, Instituições filters like the Catálogo's, larger tabs ✅ (v0.9.22)

- Início's five **bay sector tiles** sit in two rows (three, then two centred), as tall as the explore cards above, with the same icon size.
- **Instituições** filters look like the Catálogo's: **Todos · Iniciativas · Estudos** with counts beside the search, Papel and Tipo on the row below, and the filters in use as **removable chips** with *Limpar filtros*. "Todos" counts each institution once (the API now sends `facets.allKinds`; contract 0.9.1).
- The header's tabs are a little larger (15px words, 22px icons).

## Início balanced, anchored bands, logo catalogue ✅ (v0.9.23)

- **Início:** the window's left edge → *Portal Guanabara*, the name → the text, and the end of the text → the right edge are now three equal distances; the description is justified.
- **Sector tiles** keep their one-row width (a fifth of the row) with more room between them (32px), in two rows centred.
- **Catálogo and Instituições:** the green band behind the filter panel is as tall as the panel and stays anchored with it. **Mapa:** the band reaches the top of the caption card.
- **Logo catalogue:** a Sheet with the official logo source of each of the 63 institutions — manual or brand page, official site, BVRio's partners page — the rules of use, and a tab of the ones to identify with the mapping team ([`institutions.md`](architecture/institutions.md)). No logo file enters the portal before permission.

## Green band to the filter line, sector tiles like the explore cards ✅ (v0.9.24)

- **Catálogo and Instituições:** the green band behind the filter panel ends exactly at the line under the filters (it covered the whole panel in v0.9.23) and stays anchored with it.
- **Setores da baía:** names and counts in the explore cards' sizes (20px bold, 14px), the sector glyph as large as theirs.
- **Logos:** the manuals were read. Ready to add (official files, no prior authorization): Instituto BVRio, Prefeitura de Niterói, UERJ and Unicamp — waiting for the files to reach the repository. UFRJ, CAPES and the Governo do RJ ask for authorization; UFF, UFRRJ, CNPq, PUC-Rio and FAPERJ give no files (ask their communication offices); Fiocruz and UFRGS to confirm. Statuses in the logo Sheet.

## Contribution forms behind a flag ✅ (v0.9.25)

- **Contribuir com o catálogo** (`/catalog/contribute`, Catalog Journey): one form for a new initiative or study, a new institution, or a correction of either; the public sends a **suggestion**, the internal team records a **change** in their name with the same form (*Quem envia*). `?entry=36` / `?institution=uff` open the matching correction; the entry page links "Sugira uma correção" and the Catálogo "Sugira uma entrada".
- **Feature Flag `contributionForms`**: on in development, off in builds — `NUXT_PUBLIC_FEATURE_FLAGS_CONTRIBUTION_FORMS=true` turns it on (the DEV toolbar toggles it locally). Off, the page answers 404, the links disappear and `POST /api/submissions` refuses (`CONTRIBUTIONS_DISABLED`).
- `POST /api/submissions` checks the same rules as the form and keeps submissions **in memory** until the backend's `submission` table exists (backend.md §6); a restart empties it. The team mode has no sign-in yet: the staff login (Q-B7) and where the editors' area lives (Q-B8) are still BVRio's call, so a change is recorded for review, not applied.

## New mark: the G that protects the water ✅ (v0.9.26)

- The header and Início show the new mark: a G holding the bay's water, with an orange fish (who acts) and a purple one (who studies), their eyes in the G's colour. The tab icon is the G with its water.

## The G's contour and black eyes ✅ (v0.9.27)

- The G gets the same black contour as the name on Início, and the fish's eyes are black. Same mark on light (dark G) and dark (light G) backgrounds; the tab icon is unchanged.

## Tour through the charts and the drawer, name under the mark ✅ (v0.9.28)

- **Guided tour, 8 steps (7 on the phone bar):** the explore cards are one step (*Quatro portas para o catálogo*); the charts step covers all three charts; a new step points at a row (*Clique em uma linha*), then the tour **opens that row's drawer itself** and presents it — the entries, then “+ Filtro” — and closes it when it ends or goes back. The last step (*O catálogo completo*) is gone. Tour-opened drawers are tracked with `source: guided-tour`.
- **Início:** *PORTAL / GUANABARA* in two lines of capitals **under** the mark, so the name no longer competes with the title beside it.

## Map step, gentler ending, yellow waste icons ✅ (v0.9.29)

- **Tour, 9 steps (7 on the phone bar):** a new step after the explore cards points at the **Mapa** (the tab, or the Municípios card on phones) — the map is organised by municipality and bay sector. The filter step reads *Filtre como preferir — Crie suas próprias análises utilizando diversos filtros.*
- **The tour ends gently:** it fades out, the page stays where it is and the drawer it opened stays open, with focus on “+ Filtro” (it used to close the drawer and jump back to the hero at once).
- **Waste keyword icons in yellow** (Macrolixo, Microplástico, Contaminantes, Lixo náutico): a golden yellow at the other categories' level; the leaf green of Fauna and Flora is a little deeper so yellow and green stay apart (validator, all pairs).

## Municipality names on the Mapa ✅ (v0.9.30)

- Each municipality with entries is named on the map, over its markers, in dark capitals with a white halo (*S.J. Meriti* short; the others in full); hidden on phones, where the map is too small to read them.

## The tour visits the Mapa ✅ (v0.9.31)

- The tour's **Mapa step opens the Mapa page**, lights the map and says: *Navegue pelo mapa: passe o mouse ou toque em um município ou setor para ver o resultado compilado.* The next step brings the visitor back to Início (sectors, charts, the drawer).
- **Architecture:** the tour now spans two Journeys, so it was promoted from `Journeys/Home/HomeGuidedTour` to **`Shared/components/GuidedTour`** (`apps/AGENTS.md` §11; `Journeys/Home` is empty and gone). The **App shell** draws it and keeps it across pages (`src/shared/hooks/guided-tour`, `useGuidedTour`): Início gives the steps, each with its page; the App goes to each step's page. Messages moved to `presentationLake.guidedTour.*`.

## Tour: passing balloons, ending on an entry ✅ (v0.9.32)

- **Between pages, a 2-second balloon** that needs no click: a pointer taps the *Mapa* tab (*Abrindo o Mapa…*), later the *Início* tab (*Vamos voltar para o Início*), and the tour moves on by itself. Balloons are not counted in *Passo x de y*.
- **New last steps:** *Clique em uma entrada* (the drawer's first card), a balloon that opens it (*Abrindo a ficha…*), and the tour **ends on that entry's page** (*A ficha da entrada*). 11 steps (9 on phones).

## Tour: quicker balloons, goodbye on Início ✅ (v0.9.33)

- Passing balloons last **1 second** (2 before). *A ficha da entrada* lights the **whole entry page**.
- The tour now **ends back on Início**: a balloon taps the *Início* tab, then *Boa pesquisa!* on the *Começar o tour* button. 12 steps (10 on phones).
- A step whose target is already in view no longer scrolls the page.

## Repository: frontend/ and backend/ ✅ (v0.9.34 = v0.1)

- The code goes to [`bvrio/portal-guanabara`](https://github.com/bvrio/portal-guanabara): this workspace in **`frontend/`**, the API service in **`backend/`** (its README holds the plan, the stack and the open questions until the code lands), a repository README at the root. Releases are Git tags; this one is **v0.1**.
- Every command now runs inside `frontend/` (setup guide updated); nothing in the code changed.

## Phase 4 — Backend (in progress with BVRio)

The swap point is the Catalog Domain read services and the API contract; nothing above the Services changes. Plan in [`backend.md`](architecture/backend.md) §7:

1. Repository and MySQL in homologation (Uriel).
2. Spring Boot read API with parity to `openapi.json`, filled once from the Sheet.
3. Front as a static SPA (`nuxt generate`) in homologation; CloudFront routes `/api/*` to the Spring service (same origin — Q-B1 answered).
4. Official map outlines (IBGE mesh, MySQL spatial — to decide).
5. Editors' area, then public suggestions; the Sheet is retired.
6. Results tab (D-045) → reported results and charts of figures.

## Phase 5 — More Apps ✖ out of scope

Kept for reference only: `partners-webapp`, `backoffice-webapp`, `clients-app`, `partners-app` are not planned (root `AGENTS.md` §0). The editors' area of Phase 4 may reopen a `backoffice` context — to decide with BVRio (backend.md Q-B8).

## Phase 6 — Hardening (in progress)

- [x] Message extraction with `@formatjs/cli`: `pnpm i18n:extract` → `apps/clients-webapp/locales/pt-BR.json`; `pnpm i18n:check` (unique ids, owner prefixes, valid ICU, catalog up to date).
- [x] Nuxt runtime tests with `@nuxt/test-utils` for Hooks and Pages (`tests/nuxt/**/*.nuxt.tests.ts`), served by the real server handlers.
- [x] `pnpm verify` = `architecture:validate` + `i18n:check` + `typecheck` + `test`.
- [x] Translations (v0.7): `i18n:check` requires every message in en, es and fr with the source's arguments; API contract test (`openapi.tests.ts`).
- [ ] Accessibility checks (`@storybook/addon-a11y`) and a WCAG target (Q19).
- [ ] Real analytics provider behind the `TrackingAdapter`, with consent if needed (Q24).
- [ ] SEO for the public catalog: sitemap, canonical URLs, Open Graph (Q25).
- [ ] Error tracking and monitoring (Q30).
- [ ] Revisit TypeScript 7 once Vue language tools ship native support.
