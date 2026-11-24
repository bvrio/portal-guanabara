import snapshot from '../../data/catalog-snapshot.json' with { type: 'json' };

import type { CatalogSnapshot } from '../model/snapshot.ts';

import { localizeSnapshot } from './localizeSnapshot.ts';
import { TAXONOMY_LABELS, type TaxonomyList } from './taxonomyLabels.ts';

const published = snapshot as unknown as CatalogSnapshot;

describe('taxonomy labels', () => {
  const lists: [TaxonomyList, readonly { code: string }[]][] = [
    ['keywords', published.keywords],
    ['mechanisms', published.mechanisms],
    ['siteTypes', published.siteTypes],
    ['institutionTypes', published.institutionTypes],
    ['sourceTypes', published.sourceTypes],
    ['indicators', published.indicators],
    ['sectors', published.places.filter((place) => place.type === 'sector').map((place) => ({ code: place.slug }))],
  ];

  it.each(lists)('translates every %s code of the published snapshot into en, es and fr', (list, items) => {
    const missing = items
      .filter(({ code }) => {
        const labels = TAXONOMY_LABELS[list][code];
        return !labels?.en || !labels.es || !labels.fr;
      })
      .map(({ code }) => code);
    expect(missing).toEqual([]);
  });

  it('localizes the vocabularies and leaves free text and proper names alone', () => {
    const spanish = localizeSnapshot(published, 'es');
    expect(spanish.keywords.find((item) => item.code === 'manguezal')?.name).toBe('Manglar');
    expect(spanish.places.find((place) => place.id === 'sector:entrada')?.name).toBe('Entrada');
    expect(spanish.places.find((place) => place.id === 'sector:fora-da-baia')?.name).toBe('Fuera de la bahía');
    expect(spanish.places.filter((place) => place.type === 'municipality')).toEqual(
      published.places.filter((place) => place.type === 'municipality'),
    );
    expect(spanish.entries).toBe(published.entries);
    expect(localizeSnapshot(published, 'pt-BR')).toBe(published);
  });
});
