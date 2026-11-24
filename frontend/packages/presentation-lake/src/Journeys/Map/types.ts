/**
 * Data shapes of the Map Journey presentation (defined here, not imported from
 * the Catalog Domain; the Page maps the API response onto them).
 */

/** WGS 84 longitude, latitude. */
export type MapPosition = readonly [longitude: number, latitude: number];

/** GeoJSON MultiPolygon coordinates: polygons → rings → positions. */
export type MapGeometry = readonly (readonly (readonly MapPosition[])[])[];

/** The area the map shows, in degrees. */
export interface MapBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface MapMunicipality {
  /** Municipality filter code — what the Page uses to open its entries. */
  code: string;
  name: string;
  /** A shorter name for tight lists (v0.9.6, e.g. "D. de Caxias"); the full name stays for assistive tech. */
  shortName?: string;
  /** 0 for neighbours drawn for context (grey, not interactive). */
  entries: number;
  projects: number;
  studies: number;
  geometry: MapGeometry;
}

/**
 * A bay sector (v0.8): its zone in the water — null for the whole bay, which is
 * not one area — and where its name and counts are written.
 */
export interface MapSector {
  /** Sector filter code — what the Page uses to open its entries. */
  code: string;
  name: string;
  entries: number;
  projects: number;
  studies: number;
  geometry: MapGeometry | null;
  label: MapPosition | null;
}
