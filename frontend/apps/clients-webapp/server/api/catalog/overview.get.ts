import { defineEventHandler } from 'h3';

import { getCatalogReader } from '@portal-guanabara/catalog-domain';

import { cachePublicly } from '../../catalog/cache';
import { catalogLocale } from '../../catalog/locale';

/** GET /api/catalog/overview → CatalogOverview */
export default defineEventHandler((event) => {
  cachePublicly(event);
  return getCatalogReader(catalogLocale(event)).getOverview();
});
