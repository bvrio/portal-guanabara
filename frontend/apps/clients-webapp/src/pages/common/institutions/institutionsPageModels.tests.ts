import { describe, expect, it } from 'vitest';

import {
  institutionFiltersFromQuery,
  institutionQueryFromRoute,
  routeQueryFromInstitutionFilters,
  toInstitutionItem,
} from './institutionsPageModels';

describe('institutions page models', () => {
  it('round-trips the directory query through the URL', () => {
    const query = institutionQueryFromRoute({ q: ' uff ', kind: 'study', role: 'author', type: 'academica', sort: 'name', page: '2', x: 'y' });
    expect(query).toEqual({ q: 'uff', kind: 'study', role: 'author', type: 'academica', sort: 'name', page: 2 });
    expect(routeQueryFromInstitutionFilters(institutionFiltersFromQuery(query), query.page)).toEqual({
      q: 'uff',
      kind: 'study',
      role: 'author',
      type: 'academica',
      sort: 'name',
      page: '2',
    });
    expect(institutionQueryFromRoute({ kind: 'person', role: 'coordinator', page: '1' })).toEqual({});
  });

  it('maps an institution and its logo onto the card', () => {
    const summary = {
      code: 'uff',
      name: 'UFF',
      type: { code: 'academica', label: 'Acadêmica' },
      entries: 11,
      projects: 3,
      studies: 8,
      roles: [{ role: 'author' as const, count: 8 }],
    };
    expect(toInstitutionItem(summary)).toEqual({ ...summary, type: 'Acadêmica' });
    expect(toInstitutionItem(summary, '/emblems/institutions/uff.svg').logo).toBe('/emblems/institutions/uff.svg');
  });
});
