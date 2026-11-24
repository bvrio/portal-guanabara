# Presentation Lake Contract

## Purpose

This document defines the local implementation rules for `packages/presentation-lake`.

It refines — and must not contradict — the root `AGENTS.md` and `apps/AGENTS.md` (§7–§13).

---

# 1. What the Presentation Lake is

The Presentation Lake is the frontend's shared product presentation architecture, implemented as a **Vue 3 component package** (`@portal-guanabara/presentation-lake`).

It is consumed by the Nuxt Apps as source (`build.transpile` in each App's `nuxt.config.ts`). It is not a Nuxt module and does not depend on Nuxt.

---

# 2. Boundaries

The Presentation Lake must not depend on:

```text
App code (~/…, @/…)
Nuxt (#imports, nuxt, #app)
vue-router / <NuxtLink>
HTTP / BFF / Services / Hooks
authentication state, authorization, Capabilities
Feature Management, Feature Flags
analytics providers
application-wide i18n catalogs
```

These rules are checked by `pnpm architecture:validate`.

Presentation units receive data through props and slots and report user intent through emits.

Access decisions arrive as plain props decided by the Page (e.g. `showPremiumBenefits`, `guideAvailable`); units never know about Feature Management, Feature Flags, User Types or Capabilities.

Routing: `Link` accepts an App-provided component through `provideLinkComponent()`; the lake never imports a router.

---

# 3. Structure

```text
src/
├── Journeys/
│   └── <Journey>/
│       └── <Pattern>/
│           └── Components/<SubComponent>/   (optional)
├── Shared/
│   ├── foundations/   tokens, styles, i18n, Typography, Icon (duotone icon set), BrandMark (colour mark: header and Início only)
│   ├── primitives/    CardGrid, Inline
│   ├── components/    Alert, BarList, Button, Card, Checkbox, DescriptionList, Drawer, Emblem, EmptyState,
│   │                  FilterMenu, FilterPanel, Input, Link, PageHero, PageTitle, Pagination, Popover,
│   │                  Select, StatCard, Tag
│   └── features/      BasicData, SiteFooter, SiteHeader
└── Utils/
```

`Shared` is ordered by architectural complexity, not alphabetically:

```text
Foundations → Primitives → Components → Features
```

A lower level must not import a higher level.

A new semantic pattern starts in `Journeys/<Journey>/` and is promoted to `Shared/<level>/` only after demonstrated cross-Journey reuse (`apps/AGENTS.md` §10–§11).

Do not create `Journeys/Shared`.

---

# 4. Unit anatomy

Every presentation unit is a folder named after the unit:

```text
Button/
├── Button.vue             component (types in a plain <script lang="ts"> block)
├── Button.module.scss     CSS Module styles
├── Button.messages.ts     default message descriptors (when the unit owns copy)
├── Button.tests.ts        Vitest + @testing-library/vue
├── Button.stories.ts      Storybook (Shared units with visual meaning)
└── index.ts               public exports (component + types)
```

Every public unit is re-exported through the nearest `index.ts` and finally through `src/index.ts`.

---

# 5. Component API rules

```text
props    → defineProps<XProps>() with exported XProps
content  → default slot; named slots for rich content (#label, #hint, #error)
intent   → defineEmits (e.g. submit) — never callback props
value    → v-model through defineModel
classes  → native `class` fallthrough (no className prop)
```

Native attributes and listeners fall through to the unit's natural root element. When the natural target is not the root (e.g. `Input`), use `defineOptions({ inheritAttrs: false })` and forward `$attrs` explicitly.

Explicitly consider presentation states (loading, empty, error, content) where they apply.

---

# 6. Styling

- Use CSS Modules (`X.module.scss`) imported in `<script setup>`.
- Use semantic tokens (`--color-text-primary`, `--spacing-4`, …), not raw palette values, in Shared units.
- Colour follows 60/30/10 (see `docs/design-system.md`): 60% névoa canvas and surfaces (`--color-bg-*`, `--color-surface*`), 30% baía structure (`--color-structure-*`, `--color-text-heading`), 10% soft Comlurb orange with black text for primary actions and selected states (`--color-action-primary*`, `--color-selected-*`, `--color-accent*`). Meaning colours (kind, keyword category, sector, status) appear only as small marks next to a text label.
- Card collections use `CardGrid` (1 / 2 / 3 columns at < 720 / 720–1599 / ≥ 1600px); do not hand-roll card grids.
- Floating menus and pickers use `Popover` (teleported, bottom sheet on phones); side panels use `Drawer`. Both close on Esc and return focus.
- Base styles that consumers are expected to override (e.g. `Link`, `PageHero`'s overlap) use zero-specificity selectors (`:where(.root)`), so a consumer class wins whatever order the CSS chunks load in production.
- Official third-party emblems (municipal flags, institution logos) are never part of the lake: `Emblem` receives a URL from the App, which serves files BVRio supplies with authorisation, and falls back to a monogram.
- Icons come from `Shared/foundations/Icon` (24 grid, 1.75 line, duotone layers coloured through `--icon-tint`, `--icon-accent`, `--icon-secondary`). Draw new glyphs on the grid; never copy third-party icon paths. Catalogue concepts (kind, sector, keyword) go through `CatalogIcon`, which owns their meaning colours.
- Charts use the data tokens (`--color-data-series-1`, `--color-data-track`): one validated hue, thin marks, values and labels in text tokens, never color alone (see `BarList`). A second series needs a palette validated for color-vision deficiency before it is added.
- Global foundations are exported as `@portal-guanabara/presentation-lake/styles`; Apps import them once in `src/app/globals.scss`.
- No brand assets, third-party fonts or copied third-party source.

---

# 7. i18n

- Copy owned by a unit lives in `X.messages.ts` using `defineMessages` from `Shared/foundations/i18n`.
- Render copy with `<FormattedMessage v-bind="defaultMessages.key" />` or `<Typography :message="…" />`.
- Message ids: `presentationLake.<area>.<unit>.<key>`.
- The App owns the `IntlProvider` and translated catalogs; the Presentation Lake only provides default messages.
- For plain-string results (attributes, option labels, values inside other messages) use `formatMessage(intl, descriptor, values)` from `Shared/foundations/i18n`.
- Labels shared by the patterns of one Journey may live in `Journeys/<Journey>/<Journey>.messages.ts` (e.g. `Catalog.messages.ts`).
- `pnpm i18n:check` validates ids (unique, `presentationLake.` prefix) and ICU syntax.

---

# 8. Testing contract

- Tests are colocated: `X.tests.ts`.
- Do not assert production UI copy through hardcoded strings. Prefer roles, states, attributes, IDs and behavior; when a message must be asserted, reference the unit's message descriptor.
- Use `tests/renderWithIntl.ts`, which derives a test catalog from default messages.
- Avoid asserting generated CSS Module class names; when a class is the contract, import the module and use its resolved name.

---

# 9. Storybook

Every reusable Shared unit with meaningful visual or behavioral representation has a story (`@storybook/vue3-vite`). Journey-specific units do not require stories by default; when they have them (e.g. `Journeys/Catalog`), titles start with `Journeys/<Journey>/`. Sample data for tests and stories lives in `tests/fixtures/`.

The Storybook preview renders with the `pt-BR` locale, like the App.

```bash
pnpm storybook          # from the repository root
```

---

# 10. Verification

```bash
pnpm --filter @portal-guanabara/presentation-lake typecheck
pnpm --filter @portal-guanabara/presentation-lake test
pnpm --filter @portal-guanabara/presentation-lake build-storybook
```
