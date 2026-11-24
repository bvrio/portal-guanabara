import type { CatalogListQuery } from '@portal-guanabara/catalog-domain/contracts';

import { apiClient, type HttpClient, type HttpQuery } from '~/lib/http';

import type { CatalogService } from './CatalogService.types';

function toHttpQuery(query: CatalogListQuery): HttpQuery {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== ''));
}

export function createCatalogService(http: HttpClient): CatalogService {
  return {
    getOverview: () => http.get('/catalog/overview'),
    listEntries: (query) => http.get('/catalog/entries', toHttpQuery(query)),
    getEntry: (ref) => http.get(`/catalog/entries/${encodeURIComponent(String(ref))}`),
    submitContribution: (request) => http.post('/submissions', request),
  };
}

/** Catalog Journey Service facade (same-origin `/api`, Q-B1). */
export const catalogService = createCatalogService(apiClient);
