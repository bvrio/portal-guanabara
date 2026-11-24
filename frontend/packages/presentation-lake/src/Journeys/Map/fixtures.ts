import type { MapBounds, MapMunicipality, MapSector } from './types';

/** A tiny bay for tests and stories: two municipalities with entries and a neighbour. */
const square = (west: number, north: number, size = 0.1): MapMunicipality['geometry'] => [
  [
    [
      [west, north],
      [west + size, north],
      [west + size, north - size],
      [west, north - size],
      [west, north],
    ],
  ],
];

export const sampleMapBounds: MapBounds = { west: -43.4, south: -23, east: -42.9, north: -22.6 };

export const sampleMapMunicipalities: MapMunicipality[] = [
  { code: 'rio-de-janeiro', name: 'Rio de Janeiro', entries: 22, projects: 12, studies: 10, geometry: square(-43.35, -22.8, 0.2) },
  { code: 'niteroi', name: 'Niterói', entries: 3, projects: 1, studies: 2, geometry: square(-43.1, -22.85) },
  { code: 'mage', name: 'Magé', entries: 0, projects: 0, studies: 0, geometry: square(-43.1, -22.65) },
];

/** Bay sectors for tests and stories: two zones in the water and the whole bay, listed only. */
export const sampleMapSectors: MapSector[] = [
  { code: 'interior', name: 'Interior', entries: 13, projects: 8, studies: 5, geometry: square(-43.2, -22.7, 0.15), label: [-43.12, -22.76] },
  { code: 'transicao', name: 'Transição', entries: 1, projects: 0, studies: 1, geometry: square(-43.2, -22.86, 0.08), label: [-43.16, -22.9] },
  { code: 'baia-inteira', name: 'Baía inteira', entries: 8, projects: 3, studies: 5, geometry: null, label: null },
];
