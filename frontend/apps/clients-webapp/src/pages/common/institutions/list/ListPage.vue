<script setup lang="ts">
/**
 * Instituições · List (clients-webapp · common · Institutions Journey, v0.6).
 * Every institution in the catalog; a click opens its entries in the
 * catalogue drawer, where more filters can be stacked.
 */
import { computed, onMounted, ref, shallowRef, watch } from 'vue';
import { useIntl } from 'vue-intl';

import { useHead, useRoute } from '#imports';
import type { CatalogInstitutionListResult } from '@portal-guanabara/catalog-domain/contracts';
import {
  Alert,
  Button,
  CardGrid,
  CatalogResultsDrawer,
  EmptyState,
  FormattedMessage,
  formatMessage,
  InstitutionCard,
  InstitutionFilters,
  type InstitutionItem,
  Pagination,
} from '@portal-guanabara/presentation-lake';

import { useListInstitutions } from '~/hooks/common/institutions';
import { useEmblems } from '~/shared/hooks/emblems';
import { goToRoute } from '~/shared/hooks/navigation';
import { useTracking } from '~/shared/hooks/tracking';

import { useCatalogResultsDrawer } from '../../catalog/catalogResultsDrawer';
import {
  institutionFilterOptions,
  institutionFiltersFromQuery,
  institutionQueryFromRoute,
  routeQueryFromInstitutionFilters,
  toInstitutionItem,
} from '../institutionsPageModels';

import { defaultMessages } from './ListPage.messages';
import styles from './ListPage.module.scss';

const intl = useIntl();
const route = useRoute();
const tracking = useTracking();
const emblems = useEmblems();

useHead({ title: formatMessage(intl, defaultMessages.documentTitle) });

const query = computed(() => institutionQueryFromRoute(route.query));
const { data, error, status, refresh } = await useListInstitutions(query);

// Keep the last result on screen while the next one loads.
const result = shallowRef<CatalogInstitutionListResult | undefined>(data.value ?? undefined);
watch(data, (value) => {
  if (value) result.value = value;
});

const filters = ref(institutionFiltersFromQuery(query.value));
watch(query, (value) => {
  filters.value = institutionFiltersFromQuery(value);
});

const busy = computed(() => status.value === 'pending');
const items = computed(() => result.value?.items.map((item) => toInstitutionItem(item, emblems.institutionLogo(item.code))) ?? []);
const options = computed(() => institutionFilterOptions(result.value));
const resultsSection = ref<HTMLElement | null>(null);

function applyFilters() {
  const routeQuery = routeQueryFromInstitutionFilters(filters.value);
  tracking.success('institutions.directory.apply', {
    filters: Object.keys(routeQuery).filter((key) => key !== 'page' && routeQuery[key] !== undefined),
  });
  void goToRoute('institutionsList', routeQuery);
}

function clearFilters() {
  tracking.success('institutions.directory.clear');
  void goToRoute('institutionsList');
}

async function changePage(page: number) {
  await goToRoute('institutionsList', routeQueryFromInstitutionFilters(filters.value, page));
  resultsSection.value?.scrollIntoView({ block: 'start' });
}

// ------------------------------------------------------ entries drawer
const drawer = useCatalogResultsDrawer({ feature: 'institutions.drawer', tracking });

function openInstitution(institution: InstitutionItem) {
  drawer.show([{ dimension: 'institution', code: institution.code, label: institution.name }]);
}

watch(
  () => result.value?.total,
  (total) => {
    if (import.meta.client && total === 0) tracking.empty('institutions.directory');
  },
);

onMounted(() => {
  tracking.featureExposure('institutions.directory');
  if (items.value.some((item) => item.logo)) tracking.featureExposure('institutions.logos');
  if (result.value?.total === 0) tracking.empty('institutions.directory');
  if (error.value) tracking.error('institutions.list.load');
});
</script>

<template>
  <main :class="styles.root">
    <!-- The header already says "Instituições": the panel explains the list. -->
    <h1 :class="styles.visuallyHidden"><FormattedMessage v-bind="defaultMessages.title" /></h1>
    <!-- The structure band behind the panel: as tall as it and anchored with it (v0.9.23). -->
    <div :class="styles.filterBand">
      <div :class="styles.filterBandInner">
        <InstitutionFilters v-model="filters" :class="styles.filters" :options="options" :busy="busy" @submit="applyFilters" @clear="clearFilters">
          <template #summary>
            <strong v-if="result" :class="styles.total" data-testid="institutions-total">
              <FormattedMessage v-bind="defaultMessages.total" :values="{ total: result.total }" />
            </strong>
            <span :class="styles.about"><FormattedMessage v-bind="defaultMessages.introduction" /></span>
          </template>
          <template #pagination>
            <Pagination v-if="result" :page="result.page" :page-count="result.pageCount" :disabled="busy" @change="changePage" />
          </template>
        </InstitutionFilters>
      </div>
    </div>

    <div :class="styles.content">
      <Alert v-if="error && !result" variant="error">
        <FormattedMessage v-bind="defaultMessages.loadError" />
        <Button variant="secondary" size="sm" :loading="busy" @click="refresh()">
          <FormattedMessage v-bind="defaultMessages.retry" />
        </Button>
      </Alert>

      <section
        v-else-if="result"
        ref="resultsSection"
        :class="styles.results"
        aria-labelledby="institutions-results-heading"
        :aria-busy="busy || undefined"
      >
        <h2 id="institutions-results-heading" :class="styles.visuallyHidden" aria-live="polite">
          <FormattedMessage v-bind="defaultMessages.count" :values="{ total: result.total }" />
        </h2>

        <EmptyState v-if="!items.length">
          <template #title><FormattedMessage v-bind="defaultMessages.emptyTitle" /></template>
          <FormattedMessage v-bind="defaultMessages.emptyDescription" />
          <template #actions>
            <Button variant="secondary" @click="clearFilters"><FormattedMessage v-bind="defaultMessages.clearFilters" /></Button>
          </template>
        </EmptyState>

        <CardGrid v-else as="ol" :class="[styles.list, busy && styles.loading]">
          <li v-for="institution in items" :key="institution.code">
            <InstitutionCard :institution="institution" :heading-level="3" @select="openInstitution" />
          </li>
        </CardGrid>

        <Pagination :class="styles.bottomPagination" :page="result.page" :page-count="result.pageCount" :disabled="busy" @change="changePage" />
      </section>
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
