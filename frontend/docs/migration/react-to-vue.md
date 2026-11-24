# React / Next.js → Vue / Nuxt translation map

Portal Guanabara is a translation of the React/Next.js `template-frontend`. **The architecture does not change.** This document lists every place where framework mechanics had to be adapted, and why.

Rule of thumb: if something is not listed here, it keeps the original name, location and meaning.

---

## 1. Toolchain

| Concern | React template | Portal Guanabara |
|---|---|---|
| Framework | Next.js 16 (App Router) | Nuxt 4.6 |
| UI library | React 19 | Vue 3.5 (Composition API, `<script setup lang="ts">`) |
| Router | Next.js App Router | vue-router 5 (file-based via Nuxt) |
| i18n | react-intl 10 | vue-intl 8 + `@formatjs/intl` (same FormatJS core) |
| Tests | Vitest + @testing-library/react | Vitest 5 + @testing-library/vue |
| Storybook | `@storybook/react-vite` | `@storybook/vue3-vite` |
| Typecheck | `tsc --noEmit` | `vue-tsc --noEmit` (lake) · `nuxt typecheck` (app) |
| TypeScript | 5.9 | 6.0 (pinned; TS 7 not supported by vue-tsc yet) |
| Package manager | pnpm 11 | pnpm 12 |
| Monorepo | Turborepo 2 | Turborepo 2 (unchanged) |
| Package scope | `@frontend-template/*` | `@portal-guanabara/*` |

---

## 2. App filesystem

The one real collision: **Nuxt's routing folder is called `pages/`**, which in our architecture means *Page implementations*. Instead of renaming our layer, Nuxt is configured so the routing folder is `src/app/` — exactly where Next.js keeps routes.

```ts
// apps/clients-webapp/nuxt.config.ts
export default defineNuxtConfig({
  srcDir: 'src',
  dir: { pages: 'app' },
});
```

| React / Next.js | Nuxt | Notes |
|---|---|---|
| `src/app/layout.tsx` | `src/app.vue` | Root component: providers + `<NuxtPage />` + `useHead` metadata |
| `src/app/page.tsx` | `src/app/index.vue` | Route `/` |
| `src/app/authentication/login/page.tsx` | `src/app/authentication/login/index.vue` | Thin route → Page |
| `src/app/globals.scss` | `src/app/globals.scss` | Registered via `css: ['~/app/globals.scss']` |
| `src/pages/**` | `src/pages/**` | **Unchanged** — Page implementations |
| `src/hooks/**` | `src/hooks/**` | **Unchanged** — Hooks are now Vue composables |
| `src/services/**` | `src/services/**` | **Unchanged** |
| `src/shared/**` | `src/shared/**` | **Unchanged** |
| `src/providers/IntlProvider.tsx` | `src/providers/IntlProvider.vue` | Uses `provideIntl` from vue-intl |
| `src/lib/` | `src/lib/` | Utilities used by Hooks (never named `use*`) |
| `next.config.ts` | `nuxt.config.ts` | See §6 |
| `next-env.d.ts`, `.next/` | `.nuxt/`, `.output/` | Generated — git-ignored |

Folders Nuxt would auto-register (`components/`, `composables/`, `utils/`) are **forbidden** in Apps and checked by `pnpm architecture:validate`, because auto-registration hides architecture boundaries.

---

## 3. File naming

| React | Vue |
|---|---|
| `Button.tsx` | `Button.vue` |
| `Button.module.scss` | `Button.module.scss` (same) |
| `Button.messages.ts` | `Button.messages.ts` (same) |
| `Button.tests.tsx` | `Button.tests.ts` |
| `Button.stories.tsx` | `Button.stories.ts` |
| `index.ts` | `index.ts` (same) |
| `Card.tsx` (Card + Card.Row + Card.Cell) | `Card.vue`, `CardRow.vue`, `CardCell.vue` + `index.ts` combining them as `Card.Row` / `Card.Cell` |

Vue allows one component per SFC, so compound components are split into files and recombined in `index.ts`. Usage in templates stays `<Card.Row>`.

---

## 4. Component API

| React | Vue | Example |
|---|---|---|
| props interface | `defineProps<Props>()` + exported `Props` type in a plain `<script lang="ts">` block | `Button.vue` |
| default prop values | reactive props destructure | `const { size = 'md' } = defineProps<ButtonProps>()` |
| `children` | default `<slot />` | `<Button>Salvar</Button>` |
| `ReactNode` props (`label`, `hint`, `error`) | named slots **or** string props | `<template #label>…</template>` |
| callback props (`onSubmit`) | `defineEmits` + `@submit` | `<BasicData @submit="handleSubmit" />` |
| `value` + `onChange` | `v-model` (`defineModel`) | `<Input v-model="email" />` |
| `className` | native `class` (attribute fallthrough) | `<PageTitle class="x" />` |
| `{...props}` spread to DOM | automatic attribute fallthrough / `v-bind="$attrs"` | `Input` forwards attrs to `<input>` |
| `useState` | `ref` / `reactive` | |
| `useMemo` | `computed` | |
| `useEffect` | `watch` / `onMounted` | |
| `'use client'` | not needed | Nuxt hydrates every component |

---

## 5. Hooks and Services

React custom hooks become **composables** with the same names and locations.

```text
Page → Hook → Service → App API (server/api)      Catalog — there is no BFF (BVRio, Nov 2026)
Page → Hook → Service → DEV mock backend          demo Authentication and User Journeys
```

| Operation type | Implementation |
|---|---|
| Read (`useGetUser`) | Nuxt `useAsyncData` → SSR fetch + hydration. Pages `await` it. |
| Write (`useLogin`, `useUpdateUser`) | `createOperation(fn)` from `src/lib/` → `{ execute, status, pending, error, data }` |
| Service → HTTP | `src/lib/http`: `apiClient` (`/api`) and `mockBffClient` (`/mock-bff`) — Nuxt `$fetch` / request fetch with SSR cookie forwarding; errors as `HttpError { status, code }` (was `src/lib/bff` until v0.2) |
| Hook / Page runtime tests | `@nuxt/test-utils` (`mountSuspended`, `registerEndpoint`) in `tests/nuxt/**/*.nuxt.tests.ts` |
| Dynamic route `app/catalog/[id]/page.tsx` | `src/app/catalog/[id]/index.vue`; manifest path `/catalog/:id` |

Service files: `<Journey>Service.types.ts` (contract), `<Journey>Service.ts` (factory + facade), `<Journey>Service.tests.ts`, `index.ts`.

Since v0.2 the mocks live behind HTTP (`apps/clients-webapp/server`, Nitro routes under `/mock-bff/*`) instead of `*.mock.ts` files inside the Services. Since v0.3 the same Nitro server hosts the App's real API (`server/api/catalog/*`) — see `docs/architecture/no-bff.md`.

---

## 6. `next.config.ts` → `nuxt.config.ts`

| Next.js | Nuxt |
|---|---|
| `transpilePackages: ['@frontend-template/presentation-lake']` | `build.transpile: ['@portal-guanabara/presentation-lake']` |
| `allowedDevOrigins: ['grafycafe.dev.com.br']` | `vite.server.allowedHosts: ['portalguanabara.dev.com.br']` |
| `reactStrictMode` | n/a |
| `next dev --hostname 127.0.0.1 --port 3000` | `nuxt dev --host 127.0.0.1 --port 3000` |
| `next start` | `node .output/server/index.mjs` (Nitro) |
| `metadata` export in layout | `useHead()` in `app.vue` |
| implicit imports | `imports.autoImport: false` — import from `vue` / `#imports` explicitly |

---

## 7. i18n

Message files are unchanged in shape:

```ts
// LoginPage.messages.ts
import { defineMessages } from '@portal-guanabara/presentation-lake';

export const defaultMessages = defineMessages({
  title: { id: 'clients.loginPage.title', defaultMessage: 'Entre na sua conta' },
});
```

Rendering:

```tsx
// React
<FormattedMessage {...defaultMessages.title} />
```

```vue
<!-- Vue -->
<FormattedMessage v-bind="defaultMessages.title" />
```

`vue-intl` has no `<FormattedMessage>` component, so the Presentation Lake provides one (`Shared/foundations/i18n/FormattedMessage.vue`). `Typography` keeps its `message` + `values` props.

---

## 8. Tests

```ts
// React
render(<Button onClick={onClick}>Test action</Button>);

// Vue
render(Button, { attrs: { onClick }, slots: { default: 'Test action' } });
```

- `fireEvent.change(input, { target: { value } })` → `await fireEvent.update(input, value)`
- callback assertions → `emitted('submit')`
- `renderWithIntl` installs the vue-intl plugin with a catalog derived from default messages.

---

## 9. Things fixed during the translation

Recorded so the original React template can be corrected too:

1. `scripts/validate-architecture.mjs` required `packages/presentation-lake/AGENTS.md`, `apps/clients-app` and `apps/partners-app`, which did not exist — the check always failed. The Presentation Lake contract now exists; unbuilt Apps are reported as *planned* warnings.
2. `HomeWelcome.tests.tsx` asserted copy that was not in `HomeWelcome.messages.ts` (and hardcoded copy, against the testing contract).
3. `LoginConfirmation.tests.tsx` expected the register link first, but the component renders “Esqueceu a senha?” first.
4. `Card.module.scss` referenced undefined tokens (`--color-surface-default`, `--color-background-subtle`).
5. `LoginPage.module.scss` and `Input.module.scss` contained duplicated rule blocks.
6. Message ids were normalized to `clients.<pageName>.<key>` (Home used `clientsWebapp.home.*`).
7. `routes.ts` was missing the reset-password route that the Login page links to.
8. `dev/nginx/README.md` used `$(brew --prefix nginx)/etc/...`; Homebrew keeps the config at `$(brew --prefix)/etc/nginx/nginx.conf`.
9. Brand leftovers (Grafycafé / Graphycafé) replaced by Portal Guanabara.

`LoginForm` source files were too deeply nested to be read during the translation, so the Vue `LoginForm` was rebuilt from its usage, tests and public types (`mode: 'login' | 'reset-password'`, ids `login-email` / `login-password`). Review its copy against the original.
