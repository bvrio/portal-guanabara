import type { CatalogInstitutionQuery } from '@portal-guanabara/catalog-domain/contracts';

import { apiClient, type HttpClient, type HttpQuery } from '~/lib/http';

import type { InstitutionsService } from './InstitutionsService.types';

function toHttpQuery(query: CatalogInstitutionQuery): HttpQuery {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== ''));
}

export function createInstitutionsService(http: HttpClient): InstitutionsService {
  return {
    listInstitutions: (query) => http.get('/catalog/institutions', toHttpQuery(query)),
  };
}

/** Institutions Journey Service facade (same-origin `/api`, Q-B1). */
export const institutionsService = createInstitutionsService(apiClient);
