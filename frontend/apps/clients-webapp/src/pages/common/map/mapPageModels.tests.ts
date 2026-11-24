import { describe, expect, it } from 'vitest';

import { toMapMunicipalities, toMapSectors, withEntries } from './mapPageModels';

describe('map page models', () => {
  it('maps the API response and keeps the ones with entries', () => {
    const geometry = [[[[-43, -22.9] as const]]];
    const municipalities = toMapMunicipalities({
      view: { west: -44, south: -23, east: -42, north: -22 },
      municipalities: [
        { code: 'niteroi', ibgeCode: '3303302', name: 'Niterói', entries: 11, projects: 5, studies: 6, geometry },
        { code: 'marica', ibgeCode: '3302700', name: 'Maricá', entries: 0, projects: 0, studies: 0, geometry },
        { code: 'sao-joao-de-meriti', ibgeCode: '3305109', name: 'São João de Meriti', entries: 1, projects: 1, studies: 0, geometry },
      ],
      unknown: 8,
      sectors: [],
      unknownSectors: 0,
      source: { name: 'IBGE', url: 'https://www.ibge.gov.br', note: 'Provisório', provisional: true },
    });
    expect(municipalities[0]).toEqual({ code: 'niteroi', name: 'Niterói', entries: 11, projects: 5, studies: 6, geometry });
    expect(municipalities[2]?.shortName).toBe('S.J. Meriti');
    // Around the bay (v0.9.8): São João de Meriti comes before Niterói.
    expect(withEntries(municipalities).map((item) => item.code)).toEqual(['sao-joao-de-meriti', 'niteroi']);
    expect(toMapMunicipalities(null)).toEqual([]);
  });

  it('maps the bay sectors, zones and labels included', () => {
    const geometry = [[[[-43.1, -22.8] as const]]];
    const sectors = toMapSectors({
      view: { west: -44, south: -23, east: -42, north: -22 },
      municipalities: [],
      unknown: 0,
      sectors: [
        { code: 'interior', name: 'Interior', entries: 13, projects: 8, studies: 5, geometry, label: [-43.13, -22.72] },
        { code: 'baia-inteira', name: 'Baía inteira', entries: 8, projects: 3, studies: 5, geometry: null, label: null },
      ],
      unknownSectors: 13,
      source: { name: 'IBGE', url: 'https://www.ibge.gov.br', note: 'Provisório', provisional: true },
    });
    expect(sectors.map((sector) => [sector.code, sector.geometry !== null, sector.label])).toEqual([
      ['interior', true, [-43.13, -22.72]],
      ['baia-inteira', false, null],
    ]);
    expect(toMapSectors(undefined)).toEqual([]);
  });
});
