# Frontend Architecture Contract — Portal Guanabara (Vue 3 + Nuxt 4)

## Purpose

This document defines how the Frontend implements the product architecture defined by the root contract.

It applies to Web and Mobile applications in the Frontend monorepo.

The Web Apps are implemented with **Nuxt 4** and **Vue 3** (Composition API, `<script setup lang="ts">`). The architecture, folder taxonomy and naming are inherited unchanged from the original React/Next.js template; only framework mechanics are adapted. See `docs/migration/react-to-vue.md` for the full translation map.

**Current scope (root `AGENTS.md` §0):** one App, `clients-webapp`, and **no BFF**. Where this contract says "BFF", read the App's own server routes (`server/api`, today the Catalog) or, for the demo Authentication and User Journeys, the DEV mock backend (`server/routes/mock-bff`). See `docs/architecture/no-bff.md`.

---

# 1. Frontend Architecture in One Picture

```text
App
  ↓
Journey
  ↓
Page
  ├── Hook
  │    └── Service
  │         └── HTTP: App API (server/api) · DEV mock backend (demo Journeys)
  │
  └── Presentation Lake
```

A Page is the application orchestration layer.

A Hook accesses an HTTP-capable operation exposed by the Journey Service. In Vue, a Hook is a **composable** (`useGetUser`, `useUpdateUser`).

A Service is the public application facade for a Journey and communicates over HTTP with the App's API (there is no BFF).

Presentation remains inside the Presentation Lake.

---

# 2. Applications

Current Web Apps:

```text
clients-webapp      (bootstrapped — the only App in scope)
partners-webapp     (out of scope, BVRio November 2026)
backoffice-webapp   (out of scope)
```

Mobile Apps (out of scope):

```text
clients-app
partners-app
```

Do not create another App for a new Journey, Feature, Capability, or User Type without an approved architectural decision.

---

# 3. App Filesystem

Pages, Hooks and Services are organized as global responsibility folders inside each App and grouped by User Type context where applicable.

Example:

```text
clients-webapp/
├── nuxt.config.ts
└── src/
    ├── app.vue          ← root component (Next.js app/layout.tsx)
    ├── app/             ← routing layer (Nuxt routing directory, renamed)
    ├── pages/
    │   ├── common/
    │   ├── interested/
    │   └── holder/
    ├── hooks/
    │   ├── common/
    │   ├── interested/
    │   └── holder/
    ├── services/
    │   ├── common/
    │   ├── interested/
    │   └── holder/
    ├── shared/
    │   ├── hooks/        App-local infrastructure Hooks
    │   ├── services/     App-local infrastructure Services
    │   └── dev/          DEV-only tooling (never in production bundles)
    ├── providers/
    └── lib/
server/                   App API (server/api) + DEV mock backend — not Frontend code, see §20
```

`partners-webapp` does not contain a `common/` group by default:

```text
partners-webapp/
└── src/
    ├── pages/
    │   └── partner/
    ├── hooks/
    │   └── partner/
    └── services/
        └── partner/
```

`backoffice-webapp` may organize its Journeys under:

```text
common/
backoffice/
engineer/
```

These directories classify the access context of the Journeys in the App. They are not separate Apps.

---

# 4. Nuxt Routing Layer

`src/app/` is an infrastructure and routing layer.

Nuxt's file-based routing directory is configured as `src/app/` (`dir.pages = 'app'` in `nuxt.config.ts`), because Nuxt's default name — `pages/` — is reserved in this architecture for Page implementations. This keeps the original Next.js convention intact:

```text
src/app/      → routes (thin)
src/pages/    → Page implementations
```

Route files must remain thin and delegate to Page implementations.

Do not place application orchestration, HTTP logic, business rules, or substantial presentation inside route files.

Route files are named `index.vue` inside the route folder (Next.js `page.tsx` → Nuxt `index.vue`):

```text
src/app/authentication/login/index.vue
        ↓
src/pages/common/authentication/login/LoginPage.vue
```

Path parameters are whole segments, declared as `:name` in the Journey Manifest and as a bracketed folder in the routing layer:

```text
manifest path /catalog/:id
        ↓
src/app/catalog/[id]/index.vue  →  src/pages/common/catalog/details/DetailsPage.vue
```

Static siblings win over parameters (e.g. a static `/catalog/about` before `/catalog/:id`). A page that moves keeps its old URL alive with a 301 in `server/middleware/legacy-routes.ts` (v0.5: `/catalog/list` → `/catalog`).

The root component `src/app.vue` replaces Next.js `app/layout.tsx`: it mounts App-level providers and `<NuxtPage />`. Global styles live in `src/app/globals.scss` and are registered through `css` in `nuxt.config.ts`.

Route-level Nuxt features (`definePageMeta`, route middleware, layouts) belong to the routing layer; Page orchestration remains in `src/pages/`.

---

# 5. Page, Hook and Service Boundaries

The following are architectural invariants:

```text
Page → Hook                 ✅
Page → Presentation         ✅
Page → Service              ❌

Hook → Service              ✅
Hook → Hook                 ❌

Service → HTTP endpoint     ✅   (App API / DEV mock backend)
Service → Presentation      ❌

Presentation → Hook         ❌
Presentation → Service      ❌
Presentation → HTTP         ❌
```

The Page is responsible for orchestrating Hooks, access decisions, and presentation.

A Hook is a Vue composable. It should represent an HTTP-capable operation and should be named after that operation where practical:

```text
useGetPricing
useUpdatePricing
useDeletePricing
```

Read operations may use Nuxt `useAsyncData` inside the Hook so data is fetched during SSR and hydrated. Imperative operations (create/update/delete) return reactive operation state (`execute`, `status`, `pending`, `error`, `data`) — see `src/lib/createOperation.ts`. Helpers used by Hooks must live in `lib/` and must not be named `use*`, so the `Hook → Hook ❌` rule stays checkable. Example: `lib/i18n` — `localeState()` is the visitor's language; the HTTP transport sends it as `Accept-Language` and data Hooks put it in their `useAsyncData` key, so a language change refetches translated vocabularies.

A Service is the Journey's public HTTP facade inside the App.

The default is one public Service facade per Journey in an App. Internal decomposition may be introduced when justified without changing the public boundary.

Service files follow:

```text
services/<context>/<journey>/
├── <Journey>Service.types.ts   public contract (interface, request/response, error codes)
├── <Journey>Service.ts         create<Journey>Service(http) + the facade instance Hooks import
├── <Journey>Service.tests.ts   tests with a fake HTTP transport
└── index.ts                    public exports
```

Services call HTTP through `src/lib/http`, never `$fetch` directly:

```text
apiClient       API_BASE_PATH = '/api' (fixed)       (same origin, Q-B1 — the App's own API in dev, core-bvrio via CloudFront in production)
mockBffClient   runtimeConfig.public.mockBffBaseUrl  (/mock-bff — DEV backend of the demo Journeys)
```

Both forward the visitor's cookies during SSR (in-process calls to the App's server routes) and normalize failures into `HttpError { status, code }`; the same values are exposed as `statusCode` and `data.code`, so they survive `useAsyncData` wrapping the error (`errorCodeOf(error.value)`). On the server the client must be invoked synchronously inside a Nuxt context, so a Service method calls the client before any `await`.

Hooks never call the HTTP client directly.

When a Domain package publishes its response types (e.g. `@portal-guanabara/catalog-domain/contracts`), Services, Hooks and Pages import them with `import type` only; importing the Domain implementation from `src/` is rejected by `pnpm architecture:validate`, so server code and data never reach the browser bundle.

Mapping shared by the Pages of one Journey (API response → Presentation Lake props, URL query ↔ request) may live next to them as `pages/<context>/<journey>/<journey>PageModels.ts` (e.g. `catalogPageModels.ts`). It holds pure functions — no Hooks, no Services.

---

# 6. Journey Organization

A Journey can contain multiple Pages.

Pages, Hooks and Services remain in their global App folders, organized by the Journey they implement.

The Presentation Lake has its own Journey organization and must not be forced to mirror the App's User Type grouping.

For example:

```text
App
├── pages/
│   └── holder/
│       └── accreditation/
│
├── hooks/
│   └── holder/
│       └── accreditation/
│
└── services/
    └── holder/
        └── accreditation/
```

while the Presentation Lake may use:

```text
presentation-lake/src/Journeys/Accreditation/
```

The Presentation Lake should know that it implements the Accreditation Journey. It should not need to know that a particular consumer classifies that Journey as Holder.

---

# 7. Presentation Lake

The Presentation Lake is the frontend's shared product presentation architecture.

It is independent of App authorization, routing, HTTP, BFF implementation, analytics providers, Hooks, and Services.

Its structure is:

```text
packages/
└── presentation-lake/
    └── src/
        ├── Journeys/
        ├── Shared/
        │   ├── foundations/
        │   ├── primitives/
        │   ├── components/
        │   └── features/
        └── Utils/
```

---

# 8. Shared Presentation Levels

Shared presentation uses an intentional complexity progression:

```text
Foundations
    ↓
Primitives
    ↓
Components
    ↓
Features
```

### Foundations

Defines the product's visual language:

```text
Typography
Spacing
Colors
Sizing
Radius
Elevation
Aliases / tokens
```

### Primitives

Defines fundamental interaction elements:

```text
Button
Link
Icon
Checkbox
Radio
Select
Input
```

### Components

Defines reusable presentation compositions:

```text
Card
Table
Drawer
Sidebar
Modal
Tabs
Snackbar
Form
VideoPlayer
Carousel
```

### Features

Defines reusable product capabilities that are larger than presentation Components.

Examples:

```text
price-suggestion
```

A Shared Feature may contain state, behavior, validation, multiple components, tracking integration points, Feature Management integration points, and other product behavior while remaining independent of a specific Journey.

---

# 9. Input Family

`Shared/components/input` is a family boundary for specialized inputs.

Examples:

```text
NumberInput
EmailInput
CurrencyInput
CEPInput
PasswordInput
PasscodeInput
```

Additional specialized inputs may be added when needed.

Validation intrinsic to the input type may live with the input implementation.

Business validation must remain in the appropriate Journey or business layer.

---

# 10. Journey Presentation

Journey-specific presentation patterns live inside:

```text
packages/presentation-lake/src/Journeys/<Journey>/
```

When an existing Shared pattern cannot semantically satisfy a requirement, create the new semantic pattern here first.

The creator must be able to explain why the existing Shared pattern does not satisfy the requirement.

Do not create a new Journey pattern merely because a local API or visual variation is convenient.

---

# 11. Promotion to Shared

When the same semantic presentation capability is later needed by another Journey, promote it to the appropriate Shared level.

Conceptually:

```text
Journeys/A/pattern
      +
Journeys/B/pattern need
      ↓
Shared/<appropriate-level>/pattern
      ↓
Both Journeys consume Shared
```

Equivalent implementations must not remain independently maintained.

Shared is a demonstrated promotion, not a speculative destination.

---

# 12. Storybook

Every reusable Shared presentation unit with meaningful visual or behavioral representation should have a Storybook story.

This includes:

```text
Primitives
Components
Shared Features
```

Foundations should have Storybook representation when their visual usage can be meaningfully demonstrated.

Storybook uses the `@storybook/vue3-vite` framework inside `packages/presentation-lake` (`pnpm storybook`).

Storybook should document:

```text
Variants
Visual states
Interaction states
Composition
Accessibility expectations
Usage
```

Journey-specific contextual implementations do not require Storybook by default.

Storybook is the primary human- and agent-readable demonstration of a Shared presentation contract.

---

# 13. Presentation States

Presentation units should explicitly consider applicable states such as:

```text
Loading
Empty
Error
Content / Success
```

Empty is an important state but does not imply a global Empty component.

The meaning of the state belongs to the Component or Feature that owns it.

For example:

```text
Table
├── loading
├── empty
├── error
└── content
```

A Feature may define a more specific empty or unavailable state when product semantics require it.

---

# 14. App-local Shared Infrastructure

Some reusable capabilities are shared across Journeys but belong only to one App.

These belong under the App's `shared/` area.

Examples may include:

```text
shared/hooks/feature-management/     useFeatureManagement(journey)
shared/hooks/feature-flag/           featureFlags registry + useFeatureFlag(name)
shared/hooks/tracking/               useTracking(), usePageViewTracking()
shared/hooks/navigation/             routes (derived from manifests), goToRoute()
shared/hooks/alerts/
shared/hooks/emblems/                official flags and logos registry + useEmblems() (files in public/emblems)
shared/hooks/view-zoom/              view size 100 / 110 / 120 % (cookie + data-zoom on <html>) + useViewZoom()
shared/hooks/locale/                 language pt-BR / en / es / fr (cookie + <html lang>, messages loaded per language) + useLocale()
shared/hooks/session/                who is signed in, for the site header (v0.8): useGetSession() → account { name, initials } | null; refreshSession() after login/logout
shared/services/feature-management/  FeatureManagementService (BFF)
shared/services/session/             SessionService (GET /mock-bff/authentication/session)
shared/dev/                          DEV toolbar (persona + flag overrides)
```

`shared/services/` mirrors the global `services/` responsibility for App-local infrastructure: a shared Hook may call a shared Service; Pages never call Services (shared or not).

`shared/dev/` is tooling, not product presentation: it is rendered only when `import.meta.dev` is true and is tree-shaken from production builds.

These must not be promoted to monorepo packages merely because multiple Journeys consume them.

Promotion requires a genuine cross-App ownership boundary.

---

# 15. Feature Management Consumer

The Frontend requests Feature Management for the Journey it is entering or rendering.

Conceptually:

```text
Page / Journey navigation
        ↓
Feature Management Hook
        ↓
BFF Feature Management endpoint
        ↓
Journey access + Feature access
```

The Frontend should not supply its Capability as an authority claim.

The BFF derives User Type and Capabilities from the authenticated context.

The frontend consumes the resulting decision.

A Page is responsible for reacting to the decision, including preventing access to unavailable Journeys or Features.

A Page may therefore determine whether a Journey appears or is reachable based on BFF-provided Feature Management decisions.

Implementation:

```ts
// Page
const userAccess = await useFeatureManagement('user');      // GET <bff>/feature-management/user
if (!userAccess.granted.value) {
  await goToJourneyDenied(userAccess.reason.value, route.fullPath); // login (with return path) or Home
}
const canChangePassword = computed(() => userAccess.isFeatureEnabled('user.change-password'));
```

The decision shape is `{ journey, granted, reason: 'unauthenticated' | 'forbidden' | null, features: Record<featureKey, boolean> }`. Feature keys are typed from the Journey Manifests. The BFF still enforces authorization on every operation.

---

# 16. Feature Flags

Feature Flags are temporary frontend engineering controls.

Use them for:

```text
New implementation rollout
Experiment
Temporary development behavior
Progressive release
```

Do not use them for:

```text
Authorization
User Type definition
Capability definition
Journey ownership
Permanent product rules
```

Feature Flags must remain in the Frontend monorepo for the current architecture.

Implementation:

- Every flag is declared in `shared/hooks/feature-flag/featureFlags.ts` with `description`, `owner`, `removeBy` and `defaultValue`.
- Values come from `runtimeConfig.public.featureFlags` (`NUXT_PUBLIC_FEATURE_FLAGS_<NAME>=true`); in DEV the toolbar can override them through a cookie.
- Pages combine both mechanisms explicitly, e.g. `guidedTourFlag.value && homeAccess.isFeatureEnabled('home.guided-tour')`: the flag controls rollout, Feature Management controls access.
- Delete the flag and its checks once the rollout is complete.

---

# 17. Tracking

Tracking is an App/Page concern, not a Presentation Lake concern.

Presentation units must not directly call analytics providers.

Common events may include:

```text
page_viewed
feature_exposure
success
error
empty
```

`empty` must represent a meaningful product state, not a transient internal implementation state.

The application should derive App and Journey context from the runtime route/URL whenever possible.

For example:

```text
/clients/registration/details
```

can provide:

```text
App     = clients
Journey = registration
Page    = details
```

Do not manually duplicate architectural context when it can be derived reliably.

Implementation:

- `shared/hooks/tracking` derives `{ app, journey, page }` from the current path through the Journey Manifests.
- `usePageViewTracking()` (called once in `app.vue`) emits `page_viewed` after every page render.
- Pages use `useTracking()` for `feature_exposure` (when a gated Feature is shown), `success` and `error` (with the BFF error code).
- The `TrackingAdapter` is the only place that knows the analytics provider. DEV logs to the console (`[tracking] …`).

---

# 18. Mobile Architecture

Mobile Apps use the same Journey ecosystem as Web.

The initial strategy is:

```text
Native Home
    ↓
Journey WebView
```

The app may navigate between Journeys using Journey-aware navigation.

If navigation would discard unsaved Journey state, the user must be warned before proceeding.

The mobile container must not access arbitrary Journey URLs without respecting the application's Journey and access model.

---

# 19. Testing

Tests should be colocated with the responsibility they verify where practical.

Examples:

```text
XPage.vue + XPage.tests.ts
useGetX.ts + useGetX.tests.ts
XService.ts + XService.tests.ts
Component.vue + Component.tests.ts
```

Tests use Vitest. Presentation tests use `@testing-library/vue`.

Units that depend on the Nuxt runtime (Hooks using `useAsyncData`, Pages) are tested inside a real Nuxt runtime with `@nuxt/test-utils` (`mountSuspended`, `registerEndpoint`). They live in `apps/<app>/tests/nuxt/**/X.nuxt.tests.ts` — outside `src/` because they may serve endpoints with the App's real server handlers. Vitest runs two projects: `unit` (Node, `#imports` stubbed) and `nuxt`.

Copy is checked too: `pnpm i18n:check` validates every `*.messages.ts` (unique ids, owner prefixes, valid ICU) and that `locales/pt-BR.json` is up to date.

Shared presentation units should also be represented in Storybook.

Tests must validate both behavior and relevant architectural assumptions.

---

# 20. Mock-first Development and the App API

Frontend work may begin against a mocked Service while the real endpoint is still progressing.

Preferred flow:

```text
Page
  ↓
Hook
  ↓
Service
  ↓
Mock
```

Later:

```text
Page
  ↓
Hook
  ↓
Service
  ↓
Real endpoint (the App API, server/api)
```

The Hook and Service contracts should remain stable during this transition.

Do not couple the Page directly to mocks in a way that requires architectural rewiring later.

In clients-webapp both live **behind HTTP**, served by Nitro:

```text
server/api/catalog/*     App API: thin routes over the Catalog Domain read services (product code)
server/routes/mock-bff/* DEV mock backend of the demo Journeys (session cookie, personas,
                         Feature Management from the Journey Manifests); NUXT_MOCK_BFF_ENABLED=false turns it off
```

There is no BFF to switch to. If the data source changes (snapshot → PostgreSQL, or a separate read API), only the Domain read services — or what answers the same-origin `/api` (CloudFront, `API_PROXY_TARGET` locally) — change; Services, Hooks and Pages keep their contracts.

`server/` is not Frontend code: `src/` must not import it and it must not import `src/` or the Presentation Lake (checked by `pnpm architecture:validate`). Server routes stay thin; privacy decisions (e.g. the `catalogPersonNames` flag) are taken there so hidden data never leaves the server. See `apps/clients-webapp/server/README.md`.

---

# 21. Agent Operating Rules

Before changing frontend code, an agent should:

1. Read the root contract.
2. Read this Frontend contract.
3. Read the most specific local `AGENTS.md` files.
4. Identify the App and Journey.
5. Read the relevant Journey Manifest (`packages/journey-manifests/src/journeys/<journey>.manifest.ts`).
6. Search the Presentation Lake Shared levels.
7. Check Storybook when evaluating existing Shared presentation.
8. Check Journey-specific presentation when no Shared implementation applies.
9. Understand Feature Management and Capability context.
10. Distinguish Feature Management from Feature Flags.
11. Implement within Page → Hook → Service boundaries.
12. Run appropriate verification (`pnpm verify` = `architecture:validate` + `i18n:check` + `typecheck` + `test`).
13. Review the diff for architecture violations.

Do not invent a new folder taxonomy for local convenience.

Do not bypass a Shared implementation that is semantically equivalent.

Do not promote a pattern to Shared without demonstrated semantic reuse.

---

# 22. Final Frontend Principles

```text
Apps own interaction surfaces.

Journeys own product experiences.

Pages orchestrate.

Hooks access HTTP operations.

Services communicate over HTTP (App API; no BFF).

Presentation Lake owns presentation.

Shared presentation is deliberately layered:
Foundations → Primitives → Components → Features.

Journey-specific presentation starts in presentation-lake/Journeys.

Shared presentation is promoted after demonstrated reuse.

Shared presentation units have Storybook contracts.

Feature Management comes from the server (today the DEV mock backend of the demo Journeys).

Authorization context is derived on the server, never in the browser.

Feature Flags are temporary frontend controls.

Tracking belongs to App/Page infrastructure.

Mobile consumes Journeys through the same product architecture.

AI must operate inside these boundaries.
```

---

# 23. Local DEV runtime

Web Apps must expose deterministic local ports so they can run independently and can be routed through the local Nginx Product Identity layer.

```text
clients-webapp      → 3000
partners-webapp     → 3001   (out of scope)
backoffice-webapp   → 3002   (out of scope)
```

Agents should prefer running only the relevant App when validating an isolated change:

```bash
pnpm --filter clients-webapp dev
```

The root `pnpm dev` remains available for full local integration.

The browser-facing DEV URL should use the configured Product Identity rather than the local port.

Each Product Identity hostname must be listed in `vite.server.allowedHosts` in the App's `nuxt.config.ts` (the Nuxt/Vite equivalent of Next.js `allowedDevOrigins`).

---

# 24. Vue / Nuxt Implementation Conventions

### Files and naming

Naming is unchanged from the React template; only extensions change:

```text
React / Next.js                 Vue / Nuxt
──────────────────────────────  ──────────────────────────────
Component.tsx                   Component.vue
Component.module.scss           Component.module.scss  (same)
Component.messages.ts           Component.messages.ts  (same)
Component.tests.tsx             Component.tests.ts
Component.stories.tsx           Component.stories.ts
index.ts                        index.ts               (same)
app/<route>/page.tsx            app/<route>/index.vue
app/layout.tsx                  app.vue
```

Components, Pages and Journey presentation units are PascalCase. One component per `.vue` file; compound components (e.g. `Card`, `Card.Row`, `Card.Cell`) are separate SFCs combined in `index.ts`.

### SFC structure

```vue
<script lang="ts">
// Exported public types (props, variants) live here.
export interface ButtonProps { variant?: 'primary' | 'secondary' }
</script>

<script setup lang="ts">
// Imports, props, emits, state.
import styles from './Button.module.scss';
const { variant = 'primary' } = defineProps<ButtonProps>();
</script>

<template>…</template>
```

### React → Vue component API

```text
props                      → defineProps<Props>() (reactive destructure for defaults)
children                   → default <slot />
ReactNode props (label)    → named slots (#label) or string props
onX callback props         → defineEmits — parent listens with @x
value + onChange           → v-model (defineModel)
className                  → native `class` (attribute fallthrough)
useState / useMemo         → ref / reactive / computed
useEffect                  → watch / onMounted
```

### Imports

Nuxt auto-imports are disabled (`imports.autoImport: false`, no component dirs). Import Vue APIs from `vue` and Nuxt APIs from `#imports`. Architecture boundaries must be visible in import statements so `scripts/validate-architecture.mjs` can enforce them.

Do not create `src/components/`, `src/composables/` or `src/utils/` in an App: those are Nuxt auto-registration folders and would bypass the taxonomy.

### Styling

CSS Modules + SCSS remain the styling contract. Import the module in `<script setup>` (`import styles from './X.module.scss'`) and bind classes with `:class="styles.root"`. Use design tokens (CSS custom properties) from the Presentation Lake foundations.

### i18n

`react-intl` is replaced by `vue-intl` (FormatJS). Message descriptors keep the exact same shape (`{ id, defaultMessage, description }`) and stay colocated in `*.messages.ts`. Render them with the Presentation Lake `<FormattedMessage v-bind="defaultMessages.title" />`. The App owns `IntlProvider` (`src/providers/`) and translated catalogs.

Message ids follow `clients.<pageName>.<key>` in Apps and `presentationLake.<area>.<unit>.<key>` in the Presentation Lake.

`pnpm i18n:extract` collects every descriptor with `@formatjs/cli` into `apps/clients-webapp/locales/pt-BR.json`, the source catalog other locales will mirror (`locales/<lang>.json`, loaded by `IntlProvider`). pt-BR renders from the default messages, so the catalog is not loaded at runtime yet. Copy never lives in `.vue` files, and `defineMessages` is only called in `*.messages.ts`. For plain-string results (attributes, values inside other messages) use the lake's `formatMessage(intl, descriptor, values)`.

---

# 25. Journey Manifests in Apps

Journey Manifests live in `packages/journey-manifests` (schema owned by architecture — see its `AGENTS.md` and `docs/architecture/journey-manifest.md`).

Apps use them to:

- derive the route table (`shared/hooks/navigation/routes.ts`), concrete paths for parameterized routes (`routePath('catalogDetails', { id: 36 })`) and tracking context (static paths first, then `:param` patterns);
- type Feature keys (`isFeatureEnabled('user.change-password')`).

Apps must never evaluate access requirements themselves — that is the server's job.

`pnpm architecture:validate` fails when a manifest Page has no route file or Page implementation, or when a route file is not declared by any manifest. New Journey work therefore starts with the manifest:

```text
manifest → route file (src/app) → Page (src/pages) → Hooks → Service → presentation
```

