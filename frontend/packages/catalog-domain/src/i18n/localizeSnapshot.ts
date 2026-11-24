import type { CatalogSnapshot, ReferenceItem } from '../model/snapshot.ts';

import type { CatalogLocale } from './catalogLocale.ts';
import { type TaxonomyList, translateTaxonomyLabel } from './taxonomyLabels.ts';

/**
 * The snapshot with its controlled vocabularies in `locale`. Read services
 * stay language-agnostic: they read labels from whichever snapshot they get.
 * Free text and proper names are left as they are (Portuguese).
 */
export function localizeSnapshot(snapshot: CatalogSnapshot, locale: CatalogLocale): CatalogSnapshot {
  if (locale === 'pt-BR') return snapshot;

  const translate = <T extends ReferenceItem>(list: TaxonomyList, items: readonly T[]): T[] =>
    items.map((item) => ({ ...item, name: translateTaxonomyLabel(list, item.code, locale) ?? item.name }));

  return {
    ...snapshot,
    keywords: translate('keywords', snapshot.keywords),
    mechanisms: translate('mechanisms', snapshot.mechanisms),
    siteTypes: translate('siteTypes', snapshot.siteTypes),
    institutionTypes: translate('institutionTypes', snapshot.institutionTypes),
    sourceTypes: translate('sourceTypes', snapshot.sourceTypes),
    indicators: translate('indicators', snapshot.indicators),
    places: snapshot.places.map((place) =>
      place.type === 'sector'
        ? { ...place, name: translateTaxonomyLabel('sectors', place.slug, locale) ?? place.name }
        : place,
    ),
  };
}
