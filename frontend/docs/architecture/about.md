# About Journey — “Sobre nós”

**App:** `clients-webapp` · **Context:** `common` · **Journey:** `about` (public) · **Since:** v0.8 · **Content:** v0.9 (from the FAPERJ proposal) · **Team:** v0.9.3 · **Status:** photos pending

Who makes Portal Guanabara, what research it comes from and who funds it: the project sent to FAPERJ (*“Proj BVRio Faperj”*), the people behind the portal and the two scholarships. v0.9.3 removed the year-one schedule, the milestones and the testimonial, and named the team.

## Page

| Page | Path | Route file | Implementation | Features |
|---|---|---|---|---|
| Overview | `/about` | `src/app/about/index.vue` | `pages/common/about/overview/OverviewPage.vue` | `about.project`, `about.team`, `about.funding` |

Manifest: `packages/journey-manifests/src/journeys/about.manifest.ts`. Header tab **Sobre nós** (icon `people`) after Mapa (the footer links to the tabs were removed in v0.9.15).

## Sections (in order)

| Section | `data-section` | Presentation | Content (source) |
|---|---|---|---|
| Hero | — | `PageHero descriptionWidth="full"` (v0.9.12: the intro takes the content's full width) | intro: applied research of Instituto BVRio with FAPERJ scholarships |
| O projeto | `project` | project card (`[data-fact]`) + partners panel (`[data-partner]`) | project name (kept in Portuguese in every language), objective, facts (institution, funding, 24 months, pilot case Pescando Resíduos), partners (COOPROMAR, UFRJ, INEA, Ogyre) — FAPERJ proposal |
| Quem faz o portal | `team` | two groups (`[data-team]` = `fellows`, `bvrio`), each a subheading and a row of `AboutPersonCard` (`data-person-role`); “Em construção · Fotos chegam em breve.” | see below |
| Bolsas FAPERJ | `funding` | text + two cards (`[data-scholarship]` = `me2`, `de2`) | up to 12 months, 40 h a week, the plan covers 24 months with renewal; the focus of each scholarship |

### The team (v0.9.3)

Grouped the way BVRio's own team page groups people (bvrio.org/about-us, *BVRio Group*): a subheading per group, then a card per person with photo, name, role and a short bio.

| Group | `data-person-role` | Name | Role | Field / bio |
|---|---|---|---|---|
| Bolsistas FAPERJ | `student` | Glauber Amarante e Silva | Bolsista Mestre-Empresa (ME2) | Área principal: Engenharia de Software · data, indicators, this portal, the indicator matrix on Pescando Resíduos |
| | `doctor` | Raissa Celina da Costa Sousa | Bolsista Doutor-Empresa (DE2) | Área principal: Oceanografia Física · methodology, comparable indicators, MRV criteria |
| Equipe Instituto BVRio | `succar` | Pedro Succar | Diretor de Economia Circular | bio after BVRio's page |
| | `accioly` | Maria Accioly | Especialista em Economia Circular | bio after BVRio's page |
| | `miranda` | Juliana Miranda | Analista Júnior de Economia Circular | bio after BVRio's page |
| | `bertoche` | Uriel Bertoche | Gerente de TI | bio after BVRio's page |

Rules:

- Names are proper names, written in the page as they are (never translated); roles, fields and bios are messages with en/es/fr.
- Bios are short summaries in our words of BVRio's public team page; update them if BVRio's page changes.
- **Photos come from the people themselves** — not from the web, BVRio's site included; the card shows a dashed placeholder until then (`photo` prop).
- No official logos (FAPERJ, BVRio, universities, partners) copied from the web — the same rule as `public/emblems`.

## Presentation Lake (`Journeys/About`)

| Pattern | Props / slots | Notes |
|---|---|---|
| `AboutWorkInProgress` | `tone?: 'default' \| 'inverse'`; default slot = what is missing | Soft-orange pill with a clock and “Em construção” (`[data-work-in-progress]`). |
| `AboutPersonCard` | `photo?: string` (URL), `headingLevel?: 2 \| 3 \| 4`; slots `#name`, `#role`, `#area` (v0.9.3), default (bio) | Round photo (decorative, `alt=""` — the name follows), or a dashed placeholder with the `user` icon (`[data-photo-placeholder]`); content top-aligned so cards in a row line up. |

Each has `.vue`, `.module.scss`, `.tests.ts`, `.stories.ts` and `index.ts`. `AboutSchedule` and `AboutTestimonial` were removed in v0.9.3.

## Tracking

| Event | Subject |
|---|---|
| `feature_exposure` | `about.project`, `about.team`, `about.funding` |

## Tests

- Lake: `AboutWorkInProgress`, `AboutPersonCard` (`*.tests.ts`, incl. the `#area` slot).
- Nuxt runtime: `apps/clients-webapp/tests/nuxt/aboutPage.nuxt.tests.ts` — the three sections in order, facts and partners (no milestones), the two groups with their people in order, the fields of the two fellows, six photo placeholders.

## Next

Photos from each person (`photo` prop); then decide whether this copy stays in messages or moves to the backend (editable by BVRio, see [`backend.md`](backend.md)).
