/**
 * Mapping shared by the Catalog Pages: API responses (Catalog Domain
 * contracts) → Presentation Lake props, and URL query ↔ list query. Pages own
 * links and URLs; the lake and the Domain know neither.
 */
import type {
  CatalogBucket,
  CatalogEntrySummary,
  CatalogLabeled,
  CatalogListQuery,
} from '@portal-guanabara/catalog-domain/contracts';
import type {
  CatalogDistributionItem,
  CatalogEntryItem,
  CatalogFiltersValue,
  CatalogTagItem,
} from '@portal-guanabara/presentation-lake';
import type { LocationQuery } from 'vue-router';

import { routePath } from '~/shared/hooks/navigation';

export type CatalogFilterDimension = 'kind' | 'status' | 'keyword' | 'municipality' | 'sector' | 'mechanism' | 'institution';

const STATUSES = ['active', 'in_implementation', 'ended', 'published', 'in_progress'] as const;
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

/** `/catalog?keyword=macrolixo` — a drill-down into the Catalog list. */
export function catalogListHref(filters: Partial<Record<CatalogFilterDimension, string>> = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
  const query = params.toString();
  return query ? `${routePath('catalogList')}?${query}` : routePath('catalogList');
}

export function catalogEntryHref(ref: number): string {
  return routePath('catalogDetails', { id: ref });
}

export function toTagItems(items: readonly CatalogLabeled[], dimension: CatalogFilterDimension): CatalogTagItem[] {
  return items.map((item) => ({ ...item, href: catalogListHref({ [dimension]: item.code }) }));
}

export function toEntryItem(entry: CatalogEntrySummary): CatalogEntryItem {
  return {
    ...entry,
    keywords: toTagItems(entry.keywords, 'keyword'),
    sectors: toTagItems(entry.sectors, 'sector'),
    href: catalogEntryHref(entry.ref),
  };
}

/** Buckets → bars; buckets split by kind (overview, v0.8) keep their initiatives × studies. */
export function toBarItems(
  buckets: readonly (CatalogBucket & { readonly projects?: number; readonly studies?: number })[],
  dimension: CatalogFilterDimension,
): CatalogDistributionItem[] {
  return buckets.map((bucket) => ({
    id: bucket.code,
    label: bucket.label,
    value: bucket.count,
    href: catalogListHref({ [dimension]: bucket.code }),
    ...(bucket.projects === undefined ? {} : { projects: bucket.projects, studies: bucket.studies ?? 0 }),
  }));
}

function single(value: LocationQuery[string] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === 'string' && first.trim() ? first.trim() : undefined;
}

/** URL query → list query. The API validates codes; here only the shape. */
export function listQueryFromRoute(query: LocationQuery): CatalogListQuery {
  const result: { -readonly [K in keyof CatalogListQuery]: CatalogListQuery[K] } = {};
  const kind = single(query.kind);
  const sort = single(query.sort);
  const page = Number(single(query.page));

  const q = single(query.q);
  if (q) result.q = q;
  if (kind === 'project' || kind === 'study') result.kind = kind;
  const status = STATUSES.find((candidate) => candidate === single(query.status));
  if (status) result.status = status;
  for (const key of ['from', 'to'] as const) {
    const value = single(query[key]);
    if (value && MONTH.test(value)) result[key] = value;
  }
  for (const key of ['keyword', 'municipality', 'sector', 'mechanism', 'institution'] as const) {
    const value = single(query[key]);
    if (value) result[key] = value;
  }
  if (sort === 'name' || sort === 'recent') result.sort = sort;
  if (Number.isInteger(page) && page > 1) result.page = page;

  return result;
}

export function filtersFromQuery(query: CatalogListQuery): CatalogFiltersValue {
  return {
    q: query.q ?? '',
    kind: query.kind ?? '',
    status: query.status ?? '',
    from: query.from ?? '',
    to: query.to ?? '',
    keyword: query.keyword ?? '',
    municipality: query.municipality ?? '',
    sector: query.sector ?? '',
    mechanism: query.mechanism ?? '',
    institution: query.institution ?? '',
    sort: query.sort ?? 'recent',
  };
}

/** Filters (+ page) → URL query; defaults are left out so URLs stay short. */
export function routeQueryFromFilters(filters: CatalogFiltersValue, page = 1): Record<string, string | undefined> {
  return {
    q: filters.q.trim() || undefined,
    kind: filters.kind || undefined,
    status: filters.status || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    keyword: filters.keyword || undefined,
    municipality: filters.municipality || undefined,
    sector: filters.sector || undefined,
    mechanism: filters.mechanism || undefined,
    institution: filters.institution || undefined,
    sort: filters.sort === 'recent' ? undefined : filters.sort,
    page: page > 1 ? String(page) : undefined,
  };
}
