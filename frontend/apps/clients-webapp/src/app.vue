<script setup lang="ts">
// Root component — the Nuxt equivalent of Next.js `app/layout.tsx`.
import { computed, defineAsyncComponent } from 'vue';

import { navigateTo, useHead, useRoute } from '#imports';
import {
  FormattedMessage,
  GuidedTour,
  SiteFooter,
  SiteHeader,
  type SiteLocaleOption,
  type SiteNavItem,
} from '@portal-guanabara/presentation-lake';

import { defaultMessages } from './app.messages';
import styles from './app.module.scss';
import { localeFlags, localeNames, localeShortNames } from './lib/i18n';
import { IntlProvider, LinkProvider } from './providers';
import { routePath } from './shared/hooks/navigation';
import { useLocale } from './shared/hooks/locale';
import { useHeroBrand } from './shared/hooks/hero-brand';
import { useGuidedTour } from './shared/hooks/guided-tour';
import { useGetSession } from './shared/hooks/session';
import { usePageViewTracking, useTracking } from './shared/hooks/tracking';
import { useViewZoom } from './shared/hooks/view-zoom';

useHead({
  title: 'Portal Guanabara',
  meta: [{ name: 'description', content: 'Portal Guanabara' }],
});

usePageViewTracking();

// View size (100 / 110 / 120 %), chosen in the header's Opções (v0.9.17).
const tracking = useTracking();
const { level: viewZoom, levels: viewZoomLevels } = useViewZoom();
function setViewZoom(level: number) {
  viewZoom.value = level as typeof viewZoom.value;
  tracking.success('site.view-zoom.change', { level });
}

// Language (Português, English, Español, Français), chosen in the header's Opções, with flags.
const { locale, locales, messages, ready, setLocale } = useLocale();
const localeOptions: SiteLocaleOption[] = locales.map((value) => ({
  value,
  label: localeNames[value],
  short: localeShortNames[value],
  flag: localeFlags[value],
}));
async function changeLocale(next: string) {
  await setLocale(next);
  tracking.success('site.locale.change', { locale: locale.value });
}

// Account (demo Journeys): initials when signed in, "Entrar" otherwise.
const { account: session } = useGetSession();
const account = computed(() => (session.value ? { ...session.value, href: routePath('userOverview') } : null));

const route = useRoute();

// The site shell: the App owns the routes; the lake draws the header.
// Início = the panorama (with the drawer); Catálogo = every entry, with search
// and filters (a tab again since v0.9.11, right after Início; the Buscar button
// is gone); Instituições = who does the work; Mapa = where; Sobre nós = who
// builds the portal.
const navItems: SiteNavItem[] = [
  { id: 'home', href: routePath('home'), label: defaultMessages.navHome, icon: 'home' },
  { id: 'catalog', href: routePath('catalogList'), label: defaultMessages.navCatalog, icon: 'catalog' },
  { id: 'institutions', href: routePath('institutionsList'), label: defaultMessages.navInstitutions, icon: 'institution' },
  { id: 'map', href: routePath('mapExplore'), label: defaultMessages.navMap, icon: 'map' },
  { id: 'about', href: routePath('aboutOverview'), label: defaultMessages.navAbout, icon: 'people' },
];

const path = computed(() => route.path.replace(/\/+$/, '') || '/');
const onCatalog = computed(() => {
  const catalog = routePath('catalogList');
  return path.value === catalog || path.value.startsWith(`${catalog}/`);
});
const currentNav = computed(() => {
  if (path.value === routePath('home')) return 'home';
  if (onCatalog.value) return 'catalog';
  if (path.value === routePath('institutionsList')) return 'institutions';
  if (path.value === routePath('mapExplore')) return 'map';
  if (path.value === routePath('aboutOverview')) return 'about';
  return undefined;
});

// Início shows the mark and the name in its hero: the header's own fade in as
// the hero's scroll under the bar (v0.9.17; gradual since v0.9.20); every
// other page shows them.
const { heroBrandShown } = useHeroBrand();
const brandReveal = computed(() => (currentNav.value === 'home' ? 1 - heroBrandShown.value : 1));

// DEV-only tooling; tree-shaken from production builds.
const DevToolbar = import.meta.dev
  ? defineAsyncComponent(() => import('./shared/dev/DevToolbar.vue'))
  : null;

// The guided tour (v0.9.31): a Page starts it, the App draws it and keeps it across pages,
// going to each step's page first — the Mapa step opens the Mapa, the next one comes back.
const guidedTour = useGuidedTour();
function onTourStep(_index: number, id: string) {
  guidedTour.current.value = id;
  const step = guidedTour.steps.value.find((item) => item.id === id);
  // A step without a path yet (the entry page, known once the drawer loads) stays where it is.
  if (step?.path && step.path !== route.path) void navigateTo(step.path);
}
function endTour(event: 'finish' | 'skip', data: Record<string, string | number>) {
  guidedTour.current.value = null;
  tracking.success(`home.guided-tour.${event}`, data);
}

// Render only once the language's messages are in (server and hydration alike).
await ready;
</script>

<template>
  <!-- Keyed by language: a new language remounts the tree with its messages. -->
  <IntlProvider :key="locale" :locale="locale" :messages="messages">
    <LinkProvider>
      <div :class="styles.shell">
        <SiteHeader
          :home-href="routePath('home')"
          :items="navItems"
          :current-id="currentNav"
          :zoom-levels="viewZoomLevels"
          :zoom="viewZoom"
          :locales="localeOptions"
          :locale="locale"
          :account="account"
          :sign-in-href="routePath('authenticationLogin')"
          :brand-reveal="brandReveal"
          @update:zoom="setViewZoom"
          @update:locale="changeLocale"
        />
        <NuxtPage />
        <SiteFooter :home-href="routePath('home')">
          <FormattedMessage v-bind="defaultMessages.footer" />
        </SiteFooter>
      </div>
      <GuidedTour
        v-model:open="guidedTour.open.value"
        :steps="guidedTour.steps.value"
        @step="onTourStep"
        @finish="(steps) => endTour('finish', { steps })"
        @skip="(position, id) => endTour('skip', { step: id, position: position + 1 })"
      />
    </LinkProvider>
  </IntlProvider>

  <component :is="DevToolbar" v-if="DevToolbar" />
</template>
