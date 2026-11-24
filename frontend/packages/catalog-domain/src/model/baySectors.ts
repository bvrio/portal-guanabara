/**
 * Bay sector zones for the Map Journey (v0.8).
 *
 * PROVISIONAL: hand-drawn zones that follow the division the mapping team uses
 * (interior, transição, entrada, fora da baía). Only the lines across the water
 * matter — the map draws the land over the rest. "Baía inteira" has no zone of
 * its own (it covers all of them). The official division, and where its
 * geometry is stored, is decided with BVRio (docs/architecture/backend.md).
 */
import type { LonLat, MultiPolygonCoordinates } from './boundaries.ts';

export const BAY_SECTORS_SCHEMA_VERSION = 1 as const;

export interface BaySectorZone {
  /** Same slug as the catalog's sector places (`sector:<slug>`). */
  readonly slug: string;
  /** Null for sectors that are not one area (e.g. the whole bay). */
  readonly geometry: MultiPolygonCoordinates | null;
  /** Where the map writes the sector's name and counts (in the water). */
  readonly label: LonLat | null;
}

export interface BaySectorZones {
  readonly schemaVersion: typeof BAY_SECTORS_SCHEMA_VERSION;
  readonly source: {
    readonly name: string;
    readonly note: string;
  };
  /** In the order the map lists them: from the bay's head to the open sea. */
  readonly sectors: readonly BaySectorZone[];
}
