/**
 * Read contracts of the Catalog Domain — what `/api/catalog/*` returns.
 *
 * Types only: the web app's Services import this entry point, never the
 * Domain implementation, so the snapshot and the importer stay on the server.
 */
import type { LonLat, MapView, MultiPolygonCoordinates } from '../model/boundaries.ts';
import type {
  EntryKind,
  EntryStatus,
  PartialDate,
  PartyRole,
  Periodicity,
  PlaceType,
} from '../model/snapshot.ts';

export type {
  DatePrecision,
  EntryKind,
  EntryStatus,
  PartialDate,
  PartyRole,
  Periodicity,
  PlaceType,
} from '../model/snapshot.ts';

export interface CatalogLabeled {
  readonly code: string;
  readonly label: string;
}

/** A category and how many catalog entries it reaches. */
export interface CatalogBucket extends CatalogLabeled {
  readonly count: number;
}

/** A bucket split by kind (v0.8): `count` = `projects` + `studies`. */
export interface CatalogKindBucket extends CatalogBucket {
  readonly projects: number;
  readonly studies: number;
}

export interface CatalogEntrySummary {
  readonly ref: number;
  readonly kind: EntryKind;
  readonly name: string;
  readonly objective: string | null;
  readonly status: EntryStatus | null;
  readonly start: PartialDate | null;
  readonly end: PartialDate | null;
  readonly ongoing: boolean;
  readonly municipalities: readonly string[];
  /** Bay sectors by place slug (interior, transicao, entrada, baia-inteira, fora-da-baia). */
  readonly sectors: readonly CatalogLabeled[];
  readonly keywords: readonly CatalogLabeled[];
  readonly publicationYears: readonly number[];
}

export interface CatalogOverview {
  readonly importedAt: string;
  readonly totals: {
    readonly entries: number;
    readonly projects: number;
    readonly studies: number;
    readonly activeProjects: number;
    readonly institutions: number;
    readonly municipalities: number;
  };
  /** Sorted by count, then name. Unknown values are never a bucket (D-032). */
  readonly distributions: {
    readonly keywords: readonly CatalogKindBucket[];
    readonly municipalities: readonly CatalogKindBucket[];
    readonly sectors: readonly CatalogKindBucket[];
    readonly mechanisms: readonly CatalogKindBucket[];
  };
  /** Entries with no confirmed value for the dimension. */
  readonly unknown: {
    readonly keywords: number;
    readonly municipalities: number;
    readonly sectors: number;
    /** Projects only: studies have no mechanism of action. */
    readonly mechanisms: number;
  };
  readonly highlights: {
    readonly ongoingProjects: readonly CatalogEntrySummary[];
    readonly recentStudies: readonly CatalogEntrySummary[];
  };
}

export type CatalogSort = 'name' | 'recent';

/** A month, `YYYY-MM` — the finest precision most catalogue dates have. */
export type CatalogMonth = string;

export interface CatalogListQuery {
  readonly q?: string;
  readonly kind?: EntryKind;
  readonly status?: EntryStatus;
  /**
   * Period filter: entries whose activity overlaps [from, to] (either end may
   * be open). Entries with no known start never match while it is set.
   */
  readonly from?: CatalogMonth;
  readonly to?: CatalogMonth;
  readonly keyword?: string;
  readonly municipality?: string;
  readonly sector?: string;
  readonly mechanism?: string;
  /** Institution slug (the party ID without `institution:`): entries it takes part in, in any role. */
  readonly institution?: string;
  readonly sort?: CatalogSort;
  readonly page?: number;
  readonly pageSize?: number;
}

/** The query as the Domain understood it: unknown values dropped, defaults applied. */
export interface NormalizedCatalogListQuery extends CatalogListQuery {
  readonly sort: CatalogSort;
  readonly page: number;
  readonly pageSize: number;
}

export interface CatalogListResult {
  readonly items: readonly CatalogEntrySummary[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly pageCount: number;
  readonly query: NormalizedCatalogListQuery;
  /** Options per filter, counted against every other active filter. */
  readonly facets: {
    readonly kinds: readonly (CatalogBucket & { readonly code: EntryKind })[];
    /** Confirmed statuses only (unknown is never a bucket). */
    readonly statuses: readonly (CatalogBucket & { readonly code: EntryStatus })[];
    readonly keywords: readonly CatalogBucket[];
    readonly municipalities: readonly CatalogBucket[];
    readonly sectors: readonly CatalogBucket[];
    readonly mechanisms: readonly CatalogBucket[];
    readonly institutions: readonly CatalogBucket[];
    /** First and last month any entry covers (bounds for a period picker). */
    readonly period: { readonly first: CatalogMonth | null; readonly last: CatalogMonth | null };
  };
}

// ---------------------------------------------------------- institutions

export type CatalogInstitutionSort = 'entries' | 'name';

/** Roles an institution can have in an entry (people are never listed here). */
export type CatalogInstitutionRole = Exclude<PartyRole, 'coordinator'>;

export interface CatalogInstitutionQuery {
  readonly q?: string;
  /** Institutions with at least one entry of this kind. */
  readonly kind?: EntryKind;
  /** Institutions with at least one entry in this role. */
  readonly role?: CatalogInstitutionRole;
  /** Code from `institutionTypes`. */
  readonly type?: string;
  readonly sort?: CatalogInstitutionSort;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface NormalizedCatalogInstitutionQuery extends CatalogInstitutionQuery {
  readonly sort: CatalogInstitutionSort;
  readonly page: number;
  readonly pageSize: number;
}

export interface CatalogInstitutionSummary {
  /** Slug — the value of the entry list's `institution` filter. */
  readonly code: string;
  readonly name: string;
  /** Null when the workbook does not tell the type (most institutions today). */
  readonly type: CatalogLabeled | null;
  readonly entries: number;
  readonly projects: number;
  readonly studies: number;
  /** Entries per role, most frequent first. */
  readonly roles: readonly { readonly role: CatalogInstitutionRole; readonly count: number }[];
}

export interface CatalogInstitutionListResult {
  readonly items: readonly CatalogInstitutionSummary[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly pageCount: number;
  readonly query: NormalizedCatalogInstitutionQuery;
  /** Options per filter, counted (in institutions) against every other active filter. */
  readonly facets: {
    /** Institutions matching every other filter, whatever the kind (the "Todos" count, v0.9.22). */
    readonly allKinds: number;
    readonly kinds: readonly (CatalogBucket & { readonly code: EntryKind })[];
    readonly roles: readonly (CatalogBucket & { readonly code: CatalogInstitutionRole })[];
    readonly types: readonly CatalogBucket[];
    /** Institutions in the current result whose type is not known. */
    readonly unknownTypes: number;
  };
}

export interface CatalogPlaceGroup {
  readonly type: PlaceType;
  readonly names: readonly string[];
}

export interface CatalogPartyView {
  readonly name: string;
  readonly kind: 'institution' | 'person';
  /** Institution filter code (v0.9), as in `/api/catalog/entries?institution=`; null for people. */
  readonly code: string | null;
  readonly note: string | null;
}

export interface CatalogPartyGroup {
  readonly role: PartyRole;
  readonly parties: readonly CatalogPartyView[];
}

export interface CatalogSourceView {
  readonly url: string;
  readonly doi: string | null;
  readonly note: string | null;
  readonly sourceType: string | null;
  readonly venue: string | null;
  readonly publishedYear: number | null;
}

export interface CatalogDetailNote {
  /** Text before the colon in lines such as "Local: …"; null for plain lines. */
  readonly label: string | null;
  readonly text: string;
}

export interface CatalogEntryDetails extends CatalogEntrySummary {
  readonly periodicity: readonly Periodicity[];
  readonly mechanisms: readonly CatalogLabeled[];
  readonly siteTypes: readonly CatalogLabeled[];
  readonly places: readonly CatalogPlaceGroup[];
  readonly parties: readonly CatalogPartyGroup[];
  /** True when person names exist for this entry but were left out of the response. */
  readonly personsHidden: boolean;
  readonly sources: readonly CatalogSourceView[];
  readonly sourceTypes: readonly string[];
  readonly venues: readonly string[];
  readonly indicators: readonly string[];
  readonly resultsSummary: string | null;
  readonly dataAvailability: string | null;
  readonly detailNotes: readonly CatalogDetailNote[];
}

// ------------------------------------------------------------------ map (v0.7)

export type { CatalogLocale } from '../i18n/catalogLocale.ts';
export type { LonLat, MapView, MultiPolygonCoordinates } from '../model/boundaries.ts';

/** One municipality on the map: its outline and what the catalog has there. */
export interface CatalogMapMunicipality {
  /** Municipality filter code (place slug), e.g. `niteroi`. */
  readonly code: string;
  readonly ibgeCode: string;
  readonly name: string;
  /** Entries that name this municipality; 0 for the neighbours drawn for context. */
  readonly entries: number;
  readonly projects: number;
  readonly studies: number;
  readonly geometry: MultiPolygonCoordinates;
}

/**
 * One bay sector on the map (v0.8): its zone in the water — provisional, null
 * for "Baía inteira", which is not one area — and what the catalog has there.
 */
export interface CatalogMapSector {
  /** Sector filter code (place slug), e.g. `interior`. */
  readonly code: string;
  readonly name: string;
  readonly entries: number;
  readonly projects: number;
  readonly studies: number;
  readonly geometry: MultiPolygonCoordinates | null;
  /** Where the map writes the sector's name and counts. */
  readonly label: LonLat | null;
}

/** GET /api/catalog/map — the municipalities and bay sectors and their entries. */
export interface CatalogMap {
  readonly view: MapView;
  /** Municipalities with entries first (by count, then name), then the neighbours. */
  readonly municipalities: readonly CatalogMapMunicipality[];
  /** Entries with no confirmed municipality. */
  readonly unknown: number;
  /** Every bay sector of the catalog, from the bay's head to the open sea (v0.8). */
  readonly sectors: readonly CatalogMapSector[];
  /** Entries with no confirmed sector. */
  readonly unknownSectors: number;
  readonly source: {
    readonly name: string;
    readonly url: string;
    readonly note: string;
    /** True while the outlines are the provisional, simplified ones. */
    readonly provisional: boolean;
  };
}
