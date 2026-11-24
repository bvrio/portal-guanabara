import sectors from '../../data/bay-sectors.json' with { type: 'json' };
import boundaries from '../../data/municipality-boundaries.json' with { type: 'json' };
import snapshot from '../../data/catalog-snapshot.json' with { type: 'json' };

import { type CatalogLocale, DEFAULT_CATALOG_LOCALE } from '../i18n/catalogLocale.ts';
import { localizeSnapshot } from '../i18n/localizeSnapshot.ts';
import type { BaySectorZones } from '../model/baySectors.ts';
import type { MunicipalityBoundaries } from '../model/boundaries.ts';
import type { CatalogSnapshot } from '../model/snapshot.ts';

import { type CatalogReader, createCatalogReader } from './createCatalogReader.ts';

const readers = new Map<CatalogLocale, CatalogReader>();

/**
 * Reader over the published snapshot (data/catalog-snapshot.json) and the
 * provisional municipality boundaries and bay sector zones, bundled with the server build — one per
 * language of the controlled vocabularies. When the backend replaces the
 * snapshot, this is the one function that changes: callers keep the
 * CatalogReader contract.
 */
export function getCatalogReader(locale: CatalogLocale = DEFAULT_CATALOG_LOCALE): CatalogReader {
  let reader = readers.get(locale);
  if (!reader) {
    reader = createCatalogReader(localizeSnapshot(snapshot as unknown as CatalogSnapshot, locale), {
      boundaries: boundaries as unknown as MunicipalityBoundaries,
      sectors: sectors as unknown as BaySectorZones,
    });
    readers.set(locale, reader);
  }
  return reader;
}
