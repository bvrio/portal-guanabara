/**
 * Municipality outlines for the Map Journey, from the open
 * `ibge-cidades-com-poligonos` data (IBGE municipalities × outlines, ISC).
 * Pure: the CLI (`src/cli/boundaries.ts`) reads the file and writes the result.
 */
import { slugify } from '../importer/parsers.ts';
import {
  type LonLat,
  type MapView,
  MUNICIPALITY_BOUNDARIES_SCHEMA_VERSION,
  type MunicipalityBoundaries,
  type MunicipalityBoundary,
} from '../model/boundaries.ts';

/** The bay, its sectors and the eight municipalities of the catalog (v0.8: tighter, so the bay reads larger). */
export const MAP_VIEW: MapView = { west: -43.56, south: -23.04, east: -42.76, north: -22.5 };

export interface SourceMunicipality {
  readonly ufSigla: string;
  readonly municipioCodigo: string;
  readonly municipioNome: string;
  readonly poligono: { readonly type: string; readonly coordinates: number[][][][] };
}

const round = (value: number) => Math.round(value * 1e4) / 1e4;

function ringOf(positions: number[][]): LonLat[] {
  const ring: LonLat[] = [];
  for (const [lon, lat] of positions) {
    const point: LonLat = [round(lon!), round(lat!)];
    const last = ring.at(-1);
    if (!last || last[0] !== point[0] || last[1] !== point[1]) ring.push(point);
  }
  return ring;
}

function touchesView(coordinates: number[][][][], view: MapView) {
  return coordinates.some((polygon) =>
    polygon.some((ring) =>
      ring.some(([lon, lat]) => lon! >= view.west && lon! <= view.east && lat! >= view.south && lat! <= view.north),
    ),
  );
}

export function buildBoundaries(source: readonly SourceMunicipality[], view: MapView = MAP_VIEW): MunicipalityBoundaries {
  const municipalities: MunicipalityBoundary[] = source
    .filter((item) => item.ufSigla === 'RJ' && item.poligono?.type === 'MultiPolygon')
    .filter((item) => touchesView(item.poligono.coordinates, view))
    .map((item) => ({
      ibgeCode: item.municipioCodigo,
      name: item.municipioNome,
      slug: slugify(item.municipioNome),
      geometry: item.poligono.coordinates.map((polygon) => polygon.map(ringOf).filter((ring) => ring.length >= 4)),
    }))
    .sort((a, b) => a.ibgeCode.localeCompare(b.ibgeCode));

  return {
    schemaVersion: MUNICIPALITY_BOUNDARIES_SCHEMA_VERSION,
    source: {
      name: 'IBGE — malha municipal (contornos simplificados, via ibge-cidades-com-poligonos)',
      url: 'https://www.ibge.gov.br/geociencias/organizacao-do-territorio/malhas-territoriais.html',
      note: 'Provisório: a malha oficial e o armazenamento são definidos com a BVRio.',
    },
    view,
    municipalities,
  };
}
