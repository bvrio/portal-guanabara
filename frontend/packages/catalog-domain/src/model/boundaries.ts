/**
 * Municipality boundaries for the Map Journey (v0.7).
 *
 * PROVISIONAL: simplified outlines derived from IBGE's municipal mesh (via the
 * open `ibge-cidades-com-poligonos` package). Where the official mesh is stored
 * — and at which detail — is decided with BVRio (docs/architecture/backend.md).
 * Coordinates are WGS 84 longitude/latitude, rounded to 4 decimals (~11 m).
 */
export const MUNICIPALITY_BOUNDARIES_SCHEMA_VERSION = 1 as const;

export type LonLat = readonly [longitude: number, latitude: number];
/** GeoJSON MultiPolygon coordinates: polygons → rings → positions. */
export type MultiPolygonCoordinates = readonly (readonly (readonly LonLat[])[])[];

export interface MapView {
  readonly west: number;
  readonly south: number;
  readonly east: number;
  readonly north: number;
}

export interface MunicipalityBoundary {
  /** 7-digit IBGE municipality code. */
  readonly ibgeCode: string;
  readonly name: string;
  /** Same slug as the catalog's municipality places (`municipality:<slug>`). */
  readonly slug: string;
  readonly geometry: MultiPolygonCoordinates;
}

export interface MunicipalityBoundaries {
  readonly schemaVersion: typeof MUNICIPALITY_BOUNDARIES_SCHEMA_VERSION;
  readonly source: {
    readonly name: string;
    readonly url: string;
    readonly note: string;
  };
  /** The area the map shows: the bay and every municipality around it. */
  readonly view: MapView;
  readonly municipalities: readonly MunicipalityBoundary[];
}
