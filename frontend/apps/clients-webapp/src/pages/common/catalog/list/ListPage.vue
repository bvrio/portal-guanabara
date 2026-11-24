<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue';
import { useIntl } from 'vue-intl';

import { useHead, useRoute } from '#imports';
import type { CatalogListResult } from '@portal-guanabara/catalog-domain/contracts';
import {
  Alert,
  Button,
  CardGrid,
  CatalogEntryCard,
  CatalogFilters,
  type CatalogFiltersOptions,
  EmptyState,
  FormattedMessage,
  formatMessage,
  Link,
  Pagination,
} from '@portal-guanabara/presentation-lake';

import { useListCatalogEntries } from '~/hooks/common/catalog';
import { useFeatureFlag } from '~/shared/hooks/feature-flag';
import { goToRoute, routePath } from '~/shared/hooks/navigation';
import { useTracking } from '~/shared/hooks/tracking';

import { filtersFromQuery, listQueryFromRoute, routeQueryFromFilters, toEntryItem } from '../catalogPageModels';

import { defaultMessages } from './ListPage.messages';
import styles from './ListPage.module.scss';

const intl = useIntl();
const route = useRoute();
const tracking = useTracking();
const contributions = useFeatureFlag('contributionForms');

useHead({ title: formatMessage(intl, defaultMessages.documentTitle) });

// The URL is the source of truth: filters and page live in the query string.
const query = computed(() => listQueryFromRoute(route.query));
const { data, error, status, refresh } = await useListCatalogEntries(query);

// Keep the previous results on screen while the next query loads.
const result = shallowRef<CatalogListResult | undefined>(data.value ?? undefined);
watch(data, (value) => {
  if (value) result.value = value;
});

const filters = ref(filtersFromQuery(query.value));
watch(query, (value) => {
  filters.value = filtersFromQuery(value);
});

const busy = computed(() => status.value === 'pending');
const items = computed(() => result.value?.items.map(toEntryItem) ?? []);
const options = computed<CatalogFiltersOptions>(() => {
  const facets = result.value?.facets;
  const toOptions = (buckets: CatalogListResult['facets']['keywords'] = []) =>
    buckets.map((bucket) => ({ value: bucket.code, label: bucket.label, count: bucket.count }));
  return {
    kinds: facets?.kinds.map((bucket) => ({ value: bucket.code, count: bucket.count })) ?? [],
    statuses: facets?.statuses.map((bucket) => ({ value: bucket.code, count: bucket.count })) ?? [],
    period: facets?.period ?? { first: null, last: null },
    keywords: toOptions(facets?.keywords),
    municipalities: toOptions(facets?.municipalities),
    sectors: toOptions(facets?.sectors),
    mechanisms: toOptions(facets?.mechanisms),
    institutions: toOptions(facets?.institutions),
  };
});

const resultsHeading = ref<HTMLElement | null>(null);
const resultsSection = ref<HTMLElement | null>(null);

function applyFilters() {
  const routeQuery = routeQueryFromFilters(filters.value);
  // Which dimensions are in use (never their values: search terms stay private).
  tracking.success('catalog.search.apply', {
    filters: Object.keys(routeQuery).filter((key) => key !== 'page' && routeQuery[key] !== undefined),
  });
  void goToRoute('catalogList', routeQuery);
}

function clearFilters() {
  tracking.success('catalog.search.clear');
  void goToRoute('catalogList');
}

async function changePage(page: number) {
  await goToRoute('catalogList', routeQueryFromFilters(filters.value, page));
  await nextTick();
  resultsHeading.value?.focus({ preventScroll: true });
  resultsSection.value?.scrollIntoView({ block: 'start' });
}

watch(
  () => result.value?.total,
  (total) => {
    if (import.meta.client && total === 0) tracking.empty('catalog.search');
  },
);

onMounted(() => {
  tracking.featureExposure('catalog.search');
  if (result.value?.total === 0) tracking.empty('catalog.search');
  if (error.value) tracking.error('catalog.list.load');
});
</script>

<template>
  <main :class="styles.root">
    <!-- The header already says "Catálogo": no band text; the panel explains the list. -->
    <h1 :class="styles.visuallyHidden"><FormattedMessage v-bind="defaultMessages.title" /></h1>
    <!-- The structure band behind the panel: as tall as it and anchored with it (v0.9.23). -->
    <div :class="styles.filterBand">
      <div :class="styles.filterBandInner">
        <CatalogFilters
          v-model="filters"
          :class="styles.filters"
          :options="options"
          :total="result?.total"
          :busy="busy"
          @submit="applyFilters"
          @clear="clearFilters"
        >
          <template #summary>
            <strong v-if="result" :class="styles.total" data-testid="catalog-total">
              <FormattedMessage v-bind="defaultMessages.total" :values="{ total: result.total }" />
            </strong>
            <span :class="styles.about"><FormattedMessage v-bind="defaultMessages.introduction" /></span>
          </template>
          <template #pagination>
            <Pagination
              v-if="result"
              :page="result.page"
              :page-count="result.pageCount"
              :disabled="busy"
              data-testid="catalog-pagination-top"
              @change="changePage"
            />
          </template>
        </CatalogFilters>
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
        aria-labelledby="catalog-results-heading"
        :aria-busy="busy || undefined"
      >
        <h2 id="catalog-results-heading" ref="resultsHeading" :class="styles.visuallyHidden" tabindex="-1" aria-live="polite">
          <FormattedMessage v-bind="defaultMessages.count" :values="{ total: result.total }" />
        </h2>

        <EmptyState v-if="!items.length">
          <template #title><FormattedMessage v-bind="defaultMessages.emptyTitle" /></template>
          <FormattedMessage v-bind="defaultMessages.emptyDescription" />
          <template #actions>
            <Button variant="secondary" @click="clearFilters">
              <FormattedMessage v-bind="defaultMessages.clearFilters" />
            </Button>
          </template>
        </EmptyState>

        <CardGrid v-else as="ol" :class="[styles.list, busy && styles.loading]">
          <li v-for="entry in items" :key="entry.ref">
            <CatalogEntryCard :entry="entry" :heading-level="3" />
          </li>
        </CardGrid>

        <!-- Phones: the panel is not anchored, so the pages are repeated at the end. -->
        <Pagination
          :class="styles.bottomPagination"
          :page="result.page"
          :page-count="result.pageCount"
          :disabled="busy"
          @change="changePage"
        />
      </section>

      <p v-if="contributions" :class="styles.suggest" data-testid="catalog-suggest">
        <FormattedMessage v-bind="defaultMessages.suggestQuestion" />
        <Link :href="routePath('catalogContribute')"><FormattedMessage v-bind="defaultMessages.suggest" /></Link>
      </p>
    </div>
  </main>
</template>
