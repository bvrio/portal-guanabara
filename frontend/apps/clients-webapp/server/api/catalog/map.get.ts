import { defineEventHandler } from 'h3';

import { getCatalogReader } from '@portal-guanabara/catalog-domain';

import { cachePublicly } from '../../catalog/cache';
import { catalogLocale } from '../../catalog/locale';

/** GET /api/catalog/map → CatalogMap (municipality outlines + entries, since v0.7) */
export default defineEventHandler((event) => {
  cachePublicly(event);
  return getCatalogReader(catalogLocale(event)).getMap();
});
