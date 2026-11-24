/**
 * State of the catalogue drawer shared by Pages outside the Catalog list
 * (Início, Instituições): the stacked filters, the preview through the list
 * Hook, the options for “+ Filtro” (facets within the current results), the
 * link to the Catálogo and the official emblem of the leading filter.
 *
 * Page-level module (Page → Hook): it calls the Hook, never a Service.
 */
import { computed, ref } from 'vue';

import type { CatalogListQuery, CatalogListResult } from '@portal-guanabara/catalog-domain/contracts';
import type {
  CatalogResultsDimension,
  CatalogResultsFilter,
  CatalogResultsOption,
} from '@portal-guanabara/presentation-lake';

import { useListCatalogEntries } from '~/hooks/common/catalog';
import { useEmblems } from '~/shared/hooks/emblems';
import type { Tracker } from '~/shared/hooks/tracking';

import { catalogListHref, toEntryItem } from './catalogPageModels';

const PREVIEW_SIZE = 24;

type Facets = CatalogListResult['facets'];
const FACET_OF: Record<CatalogResultsDimension, keyof Omit<Facets, 'period'>> = {
  kind: 'kinds',
  status: 'statuses',
  keyword: 'keywords',
  sector: 'sectors',
  municipality: 'municipalities',
  institution: 'institutions',
  mechanism: 'mechanisms',
};

export interface CatalogResultsDrawerOptions {
  /** Tracking subject, e.g. `home.catalog-drawer` or `institutions.drawer`. */
  feature: string;
  tracking: Tracker;
}

export function useCatalogResultsDrawer({ feature, tracking }: CatalogResultsDrawerOptions) {
  const emblems = useEmblems();
  const open = ref(false);
  const filters = ref<CatalogResultsFilter[]>([]);
  let exposed = false;

  const query = computed<CatalogListQuery>(() => ({
    ...Object.fromEntries(filters.value.map((filter) => [filter.dimension, filter.code])),
    pageSize: PREVIEW_SIZE,
  }));
  const preview = useListCatalogEntries(query, { enabled: () => open.value, server: false });

  const items = computed(() => preview.data.value?.items.map(toEntryItem) ?? []);
  const total = computed(() => preview.data.value?.total ?? 0);
  const loading = computed(() => preview.status.value === 'pending');
  const error = computed(() => Boolean(preview.error.value));

  const facets = computed(() => {
    const value = preview.data.value?.facets;
    const result: Partial<Record<CatalogResultsDimension, CatalogResultsOption[]>> = {};
    if (!value) return result;
    for (const [dimension, key] of Object.entries(FACET_OF) as [CatalogResultsDimension, keyof Omit<Facets, 'period'>][]) {
      result[dimension] = value[key].map((bucket) => ({ value: bucket.code, label: bucket.label, count: bucket.count }));
    }
    return result;
  });

  const listHref = computed(() =>
    catalogListHref(Object.fromEntries(filters.value.map((filter) => [filter.dimension, filter.code]))),
  );

  const emblem = computed(() => {
    const lead = filters.value[0];
    if (lead?.dimension === 'municipality') return { shape: 'flag' as const, src: emblems.municipalityFlag(lead.code) };
    if (lead?.dimension === 'institution') return { shape: 'logo' as const, src: emblems.institutionLogo(lead.code) };
    return undefined;
  });

  /** `source` tells who opened it when it was not the visitor (e.g. `guided-tour`). */
  function show(next: CatalogResultsFilter[], options: { source?: string } = {}) {
    filters.value = next;
    open.value = true;
    if (!exposed) {
      exposed = true;
      tracking.featureExposure(feature);
    }
    const lead = next[0];
    tracking.success(`${feature}.open`, {
      ...(lead ? { dimension: lead.dimension, code: lead.code, filters: next.length } : {}),
      ...(options.source ? { source: options.source } : {}),
    });
  }

  function add(filter: CatalogResultsFilter) {
    filters.value = [...filters.value.filter((item) => item.dimension !== filter.dimension), filter];
    tracking.success(`${feature}.filter-add`, { dimension: filter.dimension });
  }

  function remove(dimension: CatalogResultsDimension) {
    filters.value = filters.value.filter((filter) => filter.dimension !== dimension);
    tracking.success(`${feature}.filter-remove`, { dimension });
  }

  function clear() {
    filters.value = [];
    tracking.success(`${feature}.filter-clear`);
  }

  function retry() {
    void preview.refresh().then(() => {
      if (preview.error.value) tracking.error('catalog.list.load', { source: feature });
    });
  }

  return { open, filters, items, total, loading, error, facets, listHref, emblem, show, add, remove, clear, retry };
}
