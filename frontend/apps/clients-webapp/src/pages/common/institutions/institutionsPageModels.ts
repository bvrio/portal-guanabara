/**
 * Mapping for the Institutions Page: URL query ↔ directory query, API
 * response → Presentation Lake props (adding the official logos the App has).
 */
import type {
  CatalogInstitutionListResult,
  CatalogInstitutionQuery,
  CatalogInstitutionSummary,
} from '@portal-guanabara/catalog-domain/contracts';
import type {
  InstitutionFiltersOptions,
  InstitutionFiltersValue,
  InstitutionItem,
} from '@portal-guanabara/presentation-lake';
import type { LocationQuery } from 'vue-router';

const ROLES = ['executor', 'funder', 'partner', 'author'] as const;

function single(value: LocationQuery[string] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === 'string' && first.trim() ? first.trim() : undefined;
}

/** URL query → directory query. The API validates codes; here only the shape. */
export function institutionQueryFromRoute(query: LocationQuery): CatalogInstitutionQuery {
  const result: { -readonly [K in keyof CatalogInstitutionQuery]: CatalogInstitutionQuery[K] } = {};
  const kind = single(query.kind);
  const sort = single(query.sort);
  const page = Number(single(query.page));

  const q = single(query.q);
  if (q) result.q = q;
  if (kind === 'project' || kind === 'study') result.kind = kind;
  const role = ROLES.find((candidate) => candidate === single(query.role));
  if (role) result.role = role;
  const type = single(query.type);
  if (type) result.type = type;
  if (sort === 'name' || sort === 'entries') result.sort = sort;
  if (Number.isInteger(page) && page > 1) result.page = page;
  return result;
}

export function institutionFiltersFromQuery(query: CatalogInstitutionQuery): InstitutionFiltersValue {
  return {
    q: query.q ?? '',
    kind: query.kind ?? '',
    role: query.role ?? '',
    type: query.type ?? '',
    sort: query.sort ?? 'entries',
  };
}

/** Filters (+ page) → URL query; defaults are left out so URLs stay short. */
export function routeQueryFromInstitutionFilters(
  filters: InstitutionFiltersValue,
  page = 1,
): Record<string, string | undefined> {
  return {
    q: filters.q.trim() || undefined,
    kind: filters.kind || undefined,
    role: filters.role || undefined,
    type: filters.type || undefined,
    sort: filters.sort === 'entries' ? undefined : filters.sort,
    page: page > 1 ? String(page) : undefined,
  };
}

export function toInstitutionItem(item: CatalogInstitutionSummary, logo?: string): InstitutionItem {
  return {
    code: item.code,
    name: item.name,
    type: item.type?.label ?? null,
    entries: item.entries,
    projects: item.projects,
    studies: item.studies,
    roles: item.roles,
    ...(logo ? { logo } : {}),
  };
}

export function institutionFilterOptions(result: CatalogInstitutionListResult | undefined): InstitutionFiltersOptions {
  const facets = result?.facets;
  return {
    allKinds: facets?.allKinds ?? result?.total ?? 0,
    kinds: facets?.kinds.map((bucket) => ({ value: bucket.code, count: bucket.count })) ?? [],
    roles: facets?.roles.map((bucket) => ({ value: bucket.code, count: bucket.count })) ?? [],
    types: facets?.types.map((bucket) => ({ value: bucket.code, label: bucket.label, count: bucket.count })) ?? [],
  };
}
