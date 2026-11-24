import type { CatalogMap } from '@portal-guanabara/catalog-domain/contracts';
import type { MapMunicipality, MapSector } from '@portal-guanabara/presentation-lake';

/** API response → the lake's municipalities (all of them: the map draws the neighbours too). */
/**
 * Shorter names for the Mapa's narrow list (v0.9.6); the full name stays as the
 * row's accessible name, on the map and in the drawer.
 */
export const MUNICIPALITY_SHORT_NAMES: Readonly<Record<string, string>> = {
  'duque-de-caxias': 'D. de Caxias',
  'sao-joao-de-meriti': 'S.J. Meriti',
};

export function toMapMunicipalities(map: CatalogMap | null | undefined): MapMunicipality[] {
  return (map?.municipalities ?? []).map(({ code, name, entries, projects, studies, geometry }) => ({
    code,
    name,
    ...(MUNICIPALITY_SHORT_NAMES[code] ? { shortName: MUNICIPALITY_SHORT_NAMES[code] } : {}),
    entries,
    projects,
    studies,
    geometry,
  }));
}

/**
 * Order of the Municípios card (v0.9.8): around the bay, from Rio de Janeiro
 * through the Baixada and the head of the bay to the east shore. Municipalities
 * not listed here follow, busiest first.
 */
export const MUNICIPALITY_ORDER: readonly string[] = [
  'rio-de-janeiro',
  'sao-joao-de-meriti',
  'duque-de-caxias',
  'mage',
  'guapimirim',
  'itaborai',
  'sao-goncalo',
  'niteroi',
];

/** The ones with entries, in the order around the bay (the API sorts them busiest first). */
export function withEntries(municipalities: readonly MapMunicipality[]): MapMunicipality[] {
  const rank = (code: string) => {
    const index = MUNICIPALITY_ORDER.indexOf(code);
    return index === -1 ? MUNICIPALITY_ORDER.length : index;
  };
  return municipalities
    .filter((municipality) => municipality.entries > 0)
    .map((municipality, index) => ({ municipality, index }))
    .sort((a, b) => rank(a.municipality.code) - rank(b.municipality.code) || a.index - b.index)
    .map(({ municipality }) => municipality);
}

/** API response → the lake's bay sectors (v0.8), in the API's order: head of the bay → open sea. */
export function toMapSectors(map: CatalogMap | null | undefined): MapSector[] {
  return (map?.sectors ?? []).map(({ code, name, entries, projects, studies, geometry, label }) => ({
    code,
    name,
    entries,
    projects,
    studies,
    geometry,
    label,
  }));
}
