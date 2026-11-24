import { describe, expect, it } from 'vitest';

import { parseCatalogInstitutionQuery, parseCatalogListQuery, parseEntryRef } from './listQuery';

describe('catalog query parsing', () => {
  it('keeps the known parameters and drops the rest', () => {
    expect(
      parseCatalogListQuery({
        q: '  lixo  ',
        kind: 'study',
        keyword: ['macrolixo', 'x'],
        sort: 'name',
        page: '2',
        pageSize: 'abc',
        extra: 'ignored',
      }),
    ).toEqual({ q: 'lixo', kind: 'study', keyword: 'macrolixo', sort: 'name', page: 2 });

    expect(parseCatalogListQuery({ kind: 'person', sort: 'random', page: '-1' })).toEqual({});
  });

  it('reads the institution filter', () => {
    expect(parseCatalogListQuery({ institution: 'uff' })).toEqual({ institution: 'uff' });
  });

  it('parses the institution directory query', () => {
    expect(
      parseCatalogInstitutionQuery({ q: ' uff ', kind: 'study', role: 'author', type: 'academica', sort: 'name', page: '2' }),
    ).toEqual({ q: 'uff', kind: 'study', role: 'author', type: 'academica', sort: 'name', page: 2 });
    expect(parseCatalogInstitutionQuery({ kind: 'person', role: 'coordinator', sort: 'recent' })).toEqual({});
  });

  it('reads the status and a period of months', () => {
    expect(parseCatalogListQuery({ status: 'active', from: '2020-01', to: '2024-12' })).toEqual({
      status: 'active',
      from: '2020-01',
      to: '2024-12',
    });
    expect(parseCatalogListQuery({ status: 'archived', from: '2020-13', to: '2024' })).toEqual({});
  });

  it('reads workbook IDs only', () => {
    expect(parseEntryRef('36')).toBe(36);
    expect(parseEntryRef('036')).toBeNull();
    expect(parseEntryRef('36abc')).toBeNull();
    expect(parseEntryRef(undefined)).toBeNull();
  });
});
