import { createError, defineEventHandler, getRouterParam } from 'h3';

import { getCatalogReader } from '@portal-guanabara/catalog-domain';

import { cachePublicly } from '../../../catalog/cache';
import { catalogLocale } from '../../../catalog/locale';
import { parseEntryRef } from '../../../catalog/listQuery';
import { personNamesEnabled } from '../../../catalog/personNames';

/** GET /api/catalog/entries/:ref → CatalogEntryDetails (ref = workbook ID, D-047) */
export default defineEventHandler((event) => {
  const ref = parseEntryRef(getRouterParam(event, 'ref'));
  const entry = ref === null ? null : getCatalogReader(catalogLocale(event)).getEntry(ref, { includePersons: personNamesEnabled(event) });

  if (!entry) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Catalog entry not found',
      data: { code: 'CATALOG_ENTRY_NOT_FOUND' },
    });
  }

  cachePublicly(event);
  return entry;
});
