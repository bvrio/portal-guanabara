# Presentation Lake

Brand-neutral Vue 3 presentation foundation for the **Portal Guanabara** monorepo (`@portal-guanabara/presentation-lake`).

Read `AGENTS.md` in this folder before adding or changing units.

```text
src/
├── Journeys/
│   ├── About/            AboutWorkInProgress · AboutTestimonial · AboutPersonCard
│   ├── Authentication/   LoginConfirmation (+ Components/LoginForm)
│   ├── Catalog/          entry cards, filters, drawer, distributions, key numbers, entry page parts
│   ├── Institutions/     InstitutionCard · InstitutionFilters
│   ├── Map/              MunicipalityMap · MunicipalityList
│   └── User/             CommunicationPreferences · PasswordChange · UserOverview
├── Shared/
│   ├── foundations/   tokens · styles · i18n (FormattedMessage) · Typography · Icon · BrandMark
│   ├── primitives/    CardGrid · Inline
│   ├── components/    Alert · BarList · Button · Card · Checkbox · DescriptionList · Drawer · Emblem · EmptyState ·
│   │                  FilterMenu · FilterPanel · GuidedTour · Input · Link · PageHero · PageTitle · Pagination · Popover ·
│   │                  Select · StatCard · Tag
│   └── features/      BasicData · SiteFooter · SiteHeader
└── Utils/             cx · searchable · cssZoom
```

## Usage from a Nuxt App

```vue
<script setup lang="ts">
import { Button, FormattedMessage } from '@portal-guanabara/presentation-lake';
import { defaultMessages } from './MyPage.messages';
</script>

<template>
  <Button variant="secondary" @click="save">
    <FormattedMessage v-bind="defaultMessages.save" />
  </Button>
</template>
```

Global foundations (tokens + base styles), once per App:

```scss
// src/app/globals.scss
@use '@portal-guanabara/presentation-lake/styles';
```

## i18n

`vue-intl` (FormatJS) replaces `react-intl`. Message descriptors keep the same shape:

```ts
export const defaultMessages = defineMessages({
  welcome: { id: 'presentationLake.home.welcome.title', defaultMessage: 'Olá, {name}' },
});
```

`vue-intl` ships no component, so the lake provides `FormattedMessage` (in `Shared/foundations/i18n`). The App owns the `IntlProvider` and catalogs.

## Commands

```bash
pnpm test              # Vitest + @testing-library/vue (jsdom)
pnpm typecheck         # vue-tsc
pnpm storybook         # http://localhost:6006
pnpm build-storybook
```

## Boundaries

The Presentation Lake does not own authentication, authorization/capabilities, feature management, feature flags, routing, BFF communication, analytics providers, application-level providers, or application-wide i18n catalogs.

`Link` is routing-agnostic: it renders a plain `<a href>` unless the App provides a link component with `provideLinkComponent()` (clients-webapp provides `<NuxtLink>` in `src/providers/LinkProvider.vue`), so internal links navigate client-side without the lake knowing about Nuxt.

Journey units report intent through emits (`submit`, `logout`, `start-guide`) and accept Page-owned feedback through a `feedback` slot (usually an `<Alert>`).
