<script setup lang="ts">
/**
 * Home (clients-webapp · common · Home Journey). Since v0.5 it is also the
 * catalogue's panorama — both halves, key numbers, bay sectors, themes,
 * mechanisms, studies by academic institution and highlights — with previews
 * in a side drawer, plus the guided tour (started from the hero).
 */
import { computed, h, onMounted, ref, watch, type VNode } from 'vue';
import { useIntl } from 'vue-intl';

import { useHead } from '#imports';
import {
  Alert,
  type BarListItem,
  BrandMark,
  Button,
  CatalogDistribution,
  CatalogHighlights,
  CatalogExploreCard,
  CatalogKindDuo,
  CardGrid,
  type CatalogResultsDimension,
  CatalogResultsDrawer,
  CatalogSectorGrid,
  type CatalogSectorTile,
  FormattedMessage,
  formatMessage,
  Icon,
  PageHero,
} from '@portal-guanabara/presentation-lake';

import { useGetCatalogOverview } from '~/hooks/common/catalog';
import { useListInstitutions } from '~/hooks/common/institutions';
import { useFeatureFlag } from '~/shared/hooks/feature-flag';
import { useFeatureManagement } from '~/shared/hooks/feature-management';
import { type SiteTourStep, useGuidedTour } from '~/shared/hooks/guided-tour';
import { useHeroBrand } from '~/shared/hooks/hero-brand';
import { routePath } from '~/shared/hooks/navigation';
import { useTracking } from '~/shared/hooks/tracking';

import { catalogListHref, toBarItems, toEntryItem } from '../catalog/catalogPageModels';
import { useCatalogResultsDrawer } from '../catalog/catalogResultsDrawer';

import { defaultMessages } from './HomePage.messages';
import styles from './HomePage.module.scss';

const intl = useIntl();
/** "Portal Guanabara" as two lines under the hero's mark: the first word, then the rest. */
const brandLines = computed(() => {
  const [first = '', ...rest] = formatMessage(intl, defaultMessages.brand).trim().split(/\s+/);
  return rest.length ? [first, rest.join(' ')] : [first];
});
const tracking = useTracking();

useHead({ title: formatMessage(intl, defaultMessages.documentTitle) });

// Feature Management (decision) + Feature Flag (rollout), the catalogue
// panorama and the academic institutions with studies
// (Page → Hook → Service → /api/catalog, no BFF).
const [homeAccess, catalog, academia] = await Promise.all([
  useFeatureManagement('home'),
  useGetCatalogOverview(),
  useListInstitutions({ type: 'academica', kind: 'study', sort: 'entries', pageSize: 48 }),
]);
const { data: overview, error: overviewError, refresh: refreshOverview, status: overviewStatus } = catalog;

// The title names both halves in their colours: <study> purple, <act> orange,
// each with a black contour half as thick as the mark's islands (v0.9.17, halved v0.9.18; drawn by
// CSS from `data-outline`). <line> is one line of the title: the break falls
// after "pela" (v0.9.17), and each language places its own.
const wordText = (chunks: (VNode | string)[]) => chunks.map((chunk) => (typeof chunk === 'string' ? chunk : '')).join('');
const titleTags = {
  line: (chunks: VNode[]) => h('span', { class: styles.titleLine }, chunks),
  study: (chunks: VNode[]) => h('span', { class: styles.titleStudy, 'data-outline': wordText(chunks) }, chunks),
  act: (chunks: VNode[]) => h('span', { class: styles.titleAct, 'data-outline': wordText(chunks) }, chunks),
};

// The hero shows the mark and the name; the header's own fade in as these
// scroll under the bar (v0.9.20: watched on the mark and name, not the band).
const heroBrand = ref<HTMLElement | null>(null);
useHeroBrand().watchHero(heroBrand);

const guidedTourFlag = useFeatureFlag('homeGuidedTour');
const guideAvailable = computed(() => guidedTourFlag.value && homeAccess.isFeatureEnabled('home.guided-tour'));

// ------------------------------------------------------------- panorama
const importedAt = computed(() =>
  overview.value ? intl.formatDate(new Date(overview.value.importedAt), { dateStyle: 'long' }) : '',
);
const distributions = computed(() => {
  const value = overview.value;
  if (!value) return null;
  return {
    keywords: toBarItems(value.distributions.keywords, 'keyword'),
    sectors: value.distributions.sectors.map((bucket) => ({ code: bucket.code, label: bucket.label, count: bucket.count })),
    mechanisms: toBarItems(value.distributions.mechanisms, 'mechanism'),
  };
});
// "Estudos por academia": studies each academic institution takes part in.
const academiaItems = computed<BarListItem[]>(() =>
  [...(academia.data.value?.items ?? [])]
    .filter((institution) => institution.studies > 0)
    .sort((a, b) => b.studies - a.studies || a.name.localeCompare(b.name, 'pt-BR'))
    .map((institution) => ({
      id: institution.code,
      label: institution.name,
      value: institution.studies,
      href: catalogListHref({ institution: institution.code, kind: 'study' }),
    })),
);

const highlights = computed(() => ({
  ongoing: overview.value?.highlights.ongoingProjects.map(toEntryItem) ?? [],
  recent: overview.value?.highlights.recentStudies.map(toEntryItem) ?? [],
}));

// ------------------------------------------- drawer (entries, stacked filters)
const drawer = useCatalogResultsDrawer({ feature: 'home.catalog-drawer', tracking });

const onBarSelect = (dimension: CatalogResultsDimension) => (item: BarListItem) =>
  drawer.show([{ dimension, code: item.id, label: item.label }]);
const onSectorSelect = (tile: CatalogSectorTile) => drawer.show([{ dimension: 'sector', code: tile.code, label: tile.label }]);
const onAcademiaSelect = (item: BarListItem) =>
  drawer.show([
    { dimension: 'institution', code: item.id, label: item.label },
    { dimension: 'kind', code: 'study', label: 'study' },
  ]);

// ------------------------------------------------------------ guided tour
// The App draws the tour and keeps it across pages (v0.9.31): each step names its page, and the
// Mapa step opens the Mapa before coming back here for the sectors. v0.9.32: passing balloons
// (`auto`, 2s, a pointer tapping the tab) carry the visitor between pages, and the tour ends on
// the page of the first entry of the drawer.
const guidedTour = useGuidedTour();
const home = routePath('home');
/** How long a passing balloon stays before the tour moves on by itself (v0.9.32; 2s until v0.9.33). */
const TOUR_PASSING_MS = 1000;
const tourSteps: SiteTourStep[] = [
  { id: 'navigation', path: home, target: '[data-site-nav]', icon: 'list', title: defaultMessages.tourNavigationTitle, body: defaultMessages.tourNavigationBody },
  // Language and view size live together in Opções since v0.9.17 (hidden in the phone bar: skipped there).
  { id: 'options', path: home, target: '[data-site-options]', icon: 'sliders', title: defaultMessages.tourOptionsTitle, body: defaultMessages.tourOptionsBody },
  { id: 'explore', path: home, target: '[data-tour="explore"]', icon: 'catalog', title: defaultMessages.tourExploreTitle, body: defaultMessages.tourExploreBody },
  { id: 'to-map', path: home, target: '[data-nav="map"], [data-stat="municipalities"]', auto: TOUR_PASSING_MS, pointer: true, icon: 'map', title: defaultMessages.tourToMapTitle },
  // v0.9.31: on the Mapa page itself (the App goes there): browse the map for the compiled results.
  { id: 'map', path: routePath('mapExplore'), target: '[data-tour="map"]', appears: true, icon: 'map', title: defaultMessages.tourMapTitle, body: defaultMessages.tourMapBody },
  { id: 'to-home', path: routePath('mapExplore'), target: '[data-nav="home"], [data-site-brand]', auto: TOUR_PASSING_MS, pointer: true, icon: 'home', title: defaultMessages.tourToHomeTitle },
  { id: 'sectors', path: home, target: '[data-tour="sectors"]', icon: 'bay', title: defaultMessages.tourSectorsTitle, body: defaultMessages.tourSectorsBody },
  // v0.9.28: all three charts, then a row, then the drawer the row opens (the tour opens it). The
  // Catálogo step is gone: the tabs, the explore cards and the drawer already lead there.
  { id: 'charts', path: home, target: '[data-tour="charts"]', icon: 'tag', title: defaultMessages.tourChartsTitle, body: defaultMessages.tourChartsBody },
  { id: 'row', path: home, target: '[data-tour="charts"] [data-dimension="keyword"] [data-item]', icon: 'arrow-right', title: defaultMessages.tourRowTitle, body: defaultMessages.tourRowBody },
  { id: 'drawer', path: home, target: '[data-drawer]', appears: true, icon: 'list', title: defaultMessages.tourDrawerTitle, body: defaultMessages.tourDrawerBody },
  { id: 'drawer-filter', path: home, target: '[data-drawer] [data-drawer-add]', appears: true, icon: 'filter', title: defaultMessages.tourFilterTitle, body: defaultMessages.tourFilterBody },
  // v0.9.32: an entry of the drawer, then its page — the tour ends there. The page is the drawer's
  // first entry, known once the drawer has loaded (see below).
  { id: 'entry', path: home, target: '[data-drawer] article[data-ref]', appears: true, icon: 'document', title: defaultMessages.tourEntryTitle, body: defaultMessages.tourEntryBody },
  { id: 'to-entry', path: home, target: '[data-drawer] article[data-ref]', auto: TOUR_PASSING_MS, pointer: true, icon: 'document', title: defaultMessages.tourToEntryTitle },
  { id: 'details', path: '', target: '[data-tour="entry"]', appears: true, icon: 'document', title: defaultMessages.tourDetailsTitle, body: defaultMessages.tourDetailsBody },
  // v0.9.33: back to Início to say goodbye, by the Início tab (the balloon stays on the entry page).
  { id: 'to-home-end', path: '', target: '[data-nav="home"], [data-site-brand]', auto: TOUR_PASSING_MS, pointer: true, icon: 'home', title: defaultMessages.tourToHomeTitle },
  { id: 'goodbye', path: home, target: '[data-testid="home-tour"]', icon: 'star', title: defaultMessages.tourGoodbyeTitle, body: defaultMessages.tourGoodbyeBody },
];
/**
 * Steps that show the drawer: the tour opens it on the keyword chart's first row and closes it
 * when the visitor goes back to a step before them. When the tour ends there the drawer stays
 * open for the visitor to use (v0.9.29; closing it as the tour vanished felt abrupt).
 */
const TOUR_DRAWER_STEPS = new Set(['drawer', 'drawer-filter', 'entry', 'to-entry']);
let tourOpenedDrawer = false;

// Immediate: coming back here with ← from the entry page, the drawer opens again on arrival.
watch(guidedTour.current, (id) => {
  if (!id || !guidedTour.open.value) return;
  if (!TOUR_DRAWER_STEPS.has(id)) {
    if (tourOpenedDrawer) drawer.open.value = false;
    tourOpenedDrawer = false;
    return;
  }
  const row = distributions.value?.keywords[0];
  if (drawer.open.value || !row) return;
  drawer.show([{ dimension: 'keyword', code: row.id, label: row.label }], { source: 'guided-tour' });
  tourOpenedDrawer = true;
}, { immediate: true });
// The last step's page: the first entry of the drawer the tour opened.
watch(
  () => drawer.items.value[0]?.ref,
  (ref) => {
    if (ref === undefined || !tourOpenedDrawer || !guidedTour.open.value) return;
    const path = routePath('catalogDetails', { id: ref });
    guidedTour.steps.value = guidedTour.steps.value.map((step) => (step.id === 'details' ? { ...step, path } : step));
  },
);
// The tour ended (finish or skip): a drawer it opened is the visitor's now.
watch(guidedTour.open, (open) => {
  if (!open) tourOpenedDrawer = false;
});

function handleStartGuide() {
  guidedTour.start(tourSteps);
  tracking.success('home.guided-tour.start');
}

onMounted(() => {
  if (guideAvailable.value) tracking.featureExposure('home.guided-tour');
  if (!overview.value) {
    tracking.error('catalog.overview.load');
    return;
  }
  tracking.featureExposure('home.catalog-summary');
  tracking.featureExposure('home.catalog-sectors');
  tracking.featureExposure('home.catalog-distributions');
  tracking.featureExposure('home.catalog-highlights');
});
</script>

<template>
  <main :class="styles.root">
    <PageHero :class="styles.hero" size="lg" aside-side="start" title-width="full" description-width="full">
      <template #title><FormattedMessage v-bind="defaultMessages.title" :values="titleTags" /></template>
      <template #description><FormattedMessage v-bind="defaultMessages.introduction" /></template>
      <template v-if="guideAvailable" #actions>
        <div :class="styles.tourCta">
          <Button size="lg" variant="primary" data-testid="home-tour" @click="handleStartGuide">
            <Icon name="arrow-right" size="sm" />
            <FormattedMessage v-bind="defaultMessages.tour" />
          </Button>
          <span :class="styles.tourHint"><FormattedMessage v-bind="defaultMessages.tourHint" /></span>
        </div>
      </template>
      <p v-if="importedAt" :class="styles.updated">
        <Icon name="clock" size="xs" />
        <FormattedMessage v-bind="defaultMessages.updated" :values="{ date: importedAt }" />
      </p>
      <template #aside>
        <!--
          The mark, then the name under it in two lines — PORTAL / GUANABARA (v0.9.28; over the
          mark in one line since v0.9.17), so it no longer competes with the title beside it.
        -->
        <div ref="heroBrand" :class="styles.heroBrand">
          <BrandMark :size="240" :class="styles.heroMap" />
          <p :class="styles.heroBrandName">
            <!-- A space between the lines keeps "Portal Guanabara" two words for assistive tech. -->
            <template v-for="(line, index) in brandLines" :key="index">
              <span :class="styles.heroBrandLine" :data-outline="line">{{ line }}</span>{{ index < brandLines.length - 1 ? ' ' : '' }}
            </template>
          </p>
        </div>
      </template>
    </PageHero>

    <div :class="styles.content">
      <Alert v-if="overviewError && !overview" variant="error">
        <FormattedMessage v-bind="defaultMessages.loadError" />
        <Button variant="secondary" size="sm" :loading="overviewStatus === 'pending'" @click="refreshOverview()">
          <FormattedMessage v-bind="defaultMessages.retry" />
        </Button>
      </Alert>

      <template v-else-if="overview && distributions">
        <section :class="styles.duo" aria-labelledby="home-duo-title">
          <h2 id="home-duo-title" :class="styles.sectionTitle">
            <span :class="styles.sectionTitleText">
              <Icon name="catalog" size="lg" :class="styles.sectionIcon" />
              <FormattedMessage v-bind="defaultMessages.explore" />
            </span>
          </h2>
          <!-- The four ways in, one card design (v0.9.20): the kinds, then Instituições (grey) and the Mapa (green). -->
          <div :class="styles.explore" data-tour="explore">
            <CatalogKindDuo
              :heading-level="3"
              :projects="{
                count: overview.totals.projects,
                active: overview.totals.activeProjects,
                href: catalogListHref({ kind: 'project' }),
              }"
              :studies="{ count: overview.totals.studies, href: catalogListHref({ kind: 'study' }) }"
            />
            <CardGrid :max-columns="2">
              <CatalogExploreCard
                tone="institution"
                :href="routePath('institutionsList')"
                :count="overview.totals.institutions"
                :heading-level="3"
                data-stat="institutions"
              >
                <template #title><FormattedMessage v-bind="defaultMessages.exploreInstitutionsTitle" /></template>
                <template #line><FormattedMessage v-bind="defaultMessages.exploreInstitutionsLine" /></template>
              </CatalogExploreCard>
              <CatalogExploreCard
                tone="place"
                :href="routePath('mapExplore')"
                :count="overview.totals.municipalities"
                :heading-level="3"
                data-stat="municipalities"
              >
                <template #title><FormattedMessage v-bind="defaultMessages.exploreMunicipalitiesTitle" /></template>
                <template #line><FormattedMessage v-bind="defaultMessages.exploreMunicipalitiesLine" /></template>
              </CatalogExploreCard>
            </CardGrid>
          </div>
        </section>

        <section :class="styles.section" aria-labelledby="home-sectors-title" data-tour="sectors">
          <div :class="styles.sectionHeader">
            <h2 id="home-sectors-title" :class="styles.sectionTitle">
              <span :class="styles.sectionTitleText">
                <Icon name="bay" size="lg" :class="styles.sectionIcon" />
                <FormattedMessage v-bind="defaultMessages.sectorsTitle" />
              </span>
            </h2>
            <p :class="styles.sectionDescription"><FormattedMessage v-bind="defaultMessages.sectorsDescription" /></p>
          </div>
          <CatalogSectorGrid
            :items="distributions.sectors"
            :unknown-count="overview.unknown.sectors"
            selectable
            data-dimension="sector"
            @select="onSectorSelect"
          />
        </section>

        <section :class="styles.section" aria-labelledby="home-distributions-title">
          <div :class="styles.sectionHeader">
            <h2 id="home-distributions-title" :class="styles.sectionTitle">
              <span :class="styles.sectionTitleText">
                <Icon name="tag" size="lg" :class="styles.sectionIcon" />
                <FormattedMessage v-bind="defaultMessages.distributionsTitle" />
              </span>
            </h2>
            <p :class="styles.sectionDescription"><FormattedMessage v-bind="defaultMessages.distributionsDescription" /></p>
          </div>
          <div :class="styles.distributions" data-tour="charts">
            <CatalogDistribution
              :items="distributions.keywords"
              :unknown-count="overview.unknown.keywords"
              :limit="20"
              icon="tag"
              item-icons="keyword"
              tone="kinds"
              header-align="center"
              selectable
              data-dimension="keyword"
              :class="styles.keywords"
              @select="onBarSelect('keyword')($event)"
            >
              <template #title><FormattedMessage v-bind="defaultMessages.keywordsTitle" /></template>
            </CatalogDistribution>
            <CatalogDistribution
              id="home-mechanisms"
              :items="distributions.mechanisms"
              :unknown-count="overview.unknown.mechanisms"
              icon="target"
              item-icons="mechanism"
              tone="project"
              header-align="center"
              selectable
              data-dimension="mechanism"
              @select="onBarSelect('mechanism')($event)"
            >
              <template #title><FormattedMessage v-bind="defaultMessages.mechanismsTitle" /></template>
              <template #description><FormattedMessage v-bind="defaultMessages.mechanismsDescription" /></template>
            </CatalogDistribution>
            <CatalogDistribution
              v-if="academiaItems.length"
              id="home-academia"
              :items="academiaItems"
              icon="institution"
              tone="study"
              header-align="center"
              selectable
              data-dimension="institution"
              @select="onAcademiaSelect"
            >
              <template #title><FormattedMessage v-bind="defaultMessages.academiaTitle" /></template>
              <template #description><FormattedMessage v-bind="defaultMessages.academiaDescription" /></template>
            </CatalogDistribution>
          </div>
        </section>

        <section :class="styles.section" aria-labelledby="home-highlights-title" data-tour="highlights">
          <div :class="styles.sectionHeader">
            <h2 id="home-highlights-title" :class="styles.sectionTitle">
              <span :class="styles.sectionTitleText">
                <Icon name="star" size="lg" :class="styles.sectionIcon" />
                <FormattedMessage v-bind="defaultMessages.highlightsTitle" />
              </span>
            </h2>
          </div>
          <CatalogHighlights :ongoing="highlights.ongoing" :recent="highlights.recent" />
        </section>
      </template>

    </div>

    <CatalogResultsDrawer
      v-model:open="drawer.open.value"
      :filters="drawer.filters.value"
      :facets="drawer.facets.value"
      :items="drawer.items.value"
      :total="drawer.total.value"
      :loading="drawer.loading.value"
      :error="drawer.error.value"
      :list-href="drawer.listHref.value"
      :emblem="drawer.emblem.value"
      @add="drawer.add"
      @remove="drawer.remove"
      @clear="drawer.clear"
      @retry="drawer.retry"
    />
  </main>
</template>
