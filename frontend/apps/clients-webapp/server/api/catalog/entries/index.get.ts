import { defineEventHandler, getQuery } from 'h3';

import { getCatalogReader } from '@portal-guanabara/catalog-domain';

import { cachePublicly } from '../../../catalog/cache';
import { parseCatalogListQuery } from '../../../catalog/listQuery';
import { catalogLocale } from '../../../catalog/locale';

/** GET /api/catalog/entries?q&kind&status&from&to&keyword&municipality&sector&mechanism&institution&sort&page&pageSize → CatalogListResult */
export default defineEventHandler((event) => {
  cachePublicly(event);
  return getCatalogReader(catalogLocale(event)).listEntries(parseCatalogListQuery(getQuery(event)));
});
