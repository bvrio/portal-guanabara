import { describe, expect, it } from 'vitest';

import {
  catalogListHref,
  filtersFromQuery,
  listQueryFromRoute,
  routeQueryFromFilters,
  toBarItems,
  toEntryItem,
} from './catalogPageModels';

describe('catalog page models', () => {
  it('builds drill-down and entry links', () => {
    expect(catalogListHref()).toBe('/catalog');
    expect(catalogListHref({ keyword: 'macrolixo', municipality: '' })).toBe('/catalog?keyword=macrolixo');
    expect(toBarItems([{ code: 'niteroi', label: 'Niterói', count: 11 }], 'municipality')).toEqual([
      { id: 'niteroi', label: 'Niterói', value: 11, href: '/catalog?municipality=niteroi' },
    ]);
    expect(toBarItems([{ code: 'macrolixo', label: 'Macrolixo', count: 28, projects: 20, studies: 8 }], 'keyword')).toEqual([
      { id: 'macrolixo', label: 'Macrolixo', value: 28, href: '/catalog?keyword=macrolixo', projects: 20, studies: 8 },
    ]);

    const item = toEntryItem({
      ref: 36,
      kind: 'study',
      name: 'Microplastic',
      objective: null,
      status: null,
      start: null,
      end: null,
      ongoing: false,
      municipalities: [],
      sectors: [{ code: 'interior', label: 'Interior' }],
      keywords: [{ code: 'microplastico', label: 'Microplástico' }],
      publicationYears: [2019],
    });
    expect(item.href).toBe('/catalog/36');
    expect(item.keywords[0]?.href).toBe('/catalog?keyword=microplastico');
    expect(item.sectors[0]?.href).toBe('/catalog?sector=interior');
  });

  it('round-trips the list query through the URL', () => {
    const query = listQueryFromRoute({
      q: ' lixo ',
      kind: 'study',
      status: 'active',
      from: '2020-01',
      to: '2024-13',
      keyword: ['macrolixo'],
      institution: 'uff',
      sort: 'name',
      page: '3',
      x: 'y',
    });
    expect(query).toEqual({
      q: 'lixo',
      kind: 'study',
      status: 'active',
      from: '2020-01',
      keyword: 'macrolixo',
      institution: 'uff',
      sort: 'name',
      page: 3,
    });

    const filters = filtersFromQuery(query);
    expect(routeQueryFromFilters(filters, query.page)).toEqual({
      q: 'lixo',
      kind: 'study',
      status: 'active',
      from: '2020-01',
      to: undefined,
      keyword: 'macrolixo',
      municipality: undefined,
      sector: undefined,
      mechanism: undefined,
      institution: 'uff',
      sort: 'name',
      page: '3',
    });
    expect(listQueryFromRoute({ kind: 'person', page: '1' })).toEqual({});
  });
});
