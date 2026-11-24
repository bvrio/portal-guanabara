import { defineEventHandler, getQuery } from 'h3';

import { getCatalogReader } from '@portal-guanabara/catalog-domain';

import { cachePublicly } from '../../catalog/cache';
import { parseCatalogInstitutionQuery } from '../../catalog/listQuery';
import { catalogLocale } from '../../catalog/locale';

/** GET /api/catalog/institutions?q&kind&role&type&sort&page&pageSize → CatalogInstitutionListResult */
export default defineEventHandler((event) => {
  cachePublicly(event);
  return getCatalogReader(catalogLocale(event)).listInstitutions(parseCatalogInstitutionQuery(getQuery(event)));
});
