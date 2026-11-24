/**
 * Catalog snapshot — the published output of one workbook import.
 *
 * Shaped after the Core v2.0 tables (catalog_entries + projects/studies,
 * parties, places, keywords, sources) so the read services can move to
 * PostgreSQL without changing their contracts. Only publishable fields are
 * kept (D-042): Pendências, Lacunas and Categorias stay in the workbook.
 *
 * Codes are English for fixed value lists (D-050). Codes of the workbook's
 * reference lists (keywords, mechanisms, …) are ASCII slugs of their
 * Portuguese names until the workbook carries its own codes.
 */
export const CATALOG_SNAPSHOT_SCHEMA_VERSION = 1;

export type EntryKind = 'project' | 'study';
export type DatePrecision = 'day' | 'month' | 'year';
export type Periodicity = 'continuous' | 'periodic' | 'one_off';
export type ProjectStatus = 'active' | 'in_implementation' | 'ended';
export type StudyStatus = 'published' | 'in_progress';
export type EntryStatus = ProjectStatus | StudyStatus;
export type PartyRole = 'executor' | 'funder' | 'partner' | 'coordinator' | 'author';

/** Place types follow the workbook's territory columns (D-051). */
export type PlaceType =
  | 'sector'
  | 'municipality'
  | 'locality'
  | 'river'
  | 'conservation_unit'
  | 'fishing_colony';

export const PLACE_TYPES: readonly PlaceType[] = [
  'sector',
  'municipality',
  'locality',
  'river',
  'conservation_unit',
  'fishing_colony',
];

export const PARTY_ROLES: readonly PartyRole[] = ['executor', 'funder', 'partner', 'coordinator', 'author'];

/** A date known only as precisely as the source says (D-033). */
export interface PartialDate {
  /** ISO date; the missing parts are filled with 01. */
  readonly date: string;
  readonly precision: DatePrecision;
}

export interface ReferenceItem {
  readonly code: string;
  readonly name: string;
}

export interface KeywordItem extends ReferenceItem {
  readonly category: string | null;
}

export interface PlaceRecord {
  /** `<type>:<slug>`, e.g. `municipality:rio-de-janeiro`. */
  readonly id: string;
  readonly type: PlaceType;
  readonly slug: string;
  readonly name: string;
}

export type PartyRecord =
  | {
      readonly id: string;
      readonly kind: 'institution';
      readonly name: string;
      /** Code from `institutionTypes`; null when the workbook does not tell it unambiguously. */
      readonly institutionType: string | null;
    }
  | {
      readonly id: string;
      readonly kind: 'person';
      readonly name: string;
    };

export interface SourceRecord {
  readonly id: string;
  readonly url: string;
  readonly doi: string | null;
  /** Annotation written after the link in the workbook, e.g. "PDF do artigo". */
  readonly note: string | null;
  /** Filled only when the entry has a single link, so the pairing is unambiguous. */
  readonly sourceType: string | null;
  readonly venue: string | null;
  readonly publishedYear: number | null;
}

export interface EntryParty {
  readonly party: string;
  readonly role: PartyRole;
  /** Context written next to a person, e.g. "presidente da COOPAMA". */
  readonly note: string | null;
}

export interface SnapshotEntry {
  /** Workbook ID: the permanent public reference (D-047). */
  readonly ref: number;
  readonly kind: EntryKind;
  readonly name: string;
  readonly objective: string | null;
  readonly start: PartialDate | null;
  readonly end: PartialDate | null;
  /** End date written as "em curso". */
  readonly ongoing: boolean;
  readonly periodicity: readonly Periodicity[];
  readonly status: EntryStatus | null;
  readonly mechanisms: readonly string[];
  readonly keywords: readonly string[];
  readonly siteTypes: readonly string[];
  readonly places: readonly string[];
  readonly parties: readonly EntryParty[];
  readonly sources: readonly string[];
  /** "Tipo de instituição" as declared on the entry (types of its executing institutions). */
  readonly executorInstitutionTypes: readonly string[];
  /** "Variável quantitativa e unidade": what the entry measures. */
  readonly indicators: readonly string[];
  /** Entry-level source facts, kept even when they cannot be paired with one link. */
  readonly sourceTypes: readonly string[];
  readonly venues: readonly string[];
  readonly publicationYears: readonly number[];
  readonly resultsSummary: string | null;
  readonly dataAvailability: string | null;
  readonly details: string | null;
}

export interface ImportRunSummary {
  readonly importedAt: string;
  readonly workbook: { readonly fileName: string; readonly sha256: string };
  readonly entryCount: number;
  readonly projectCount: number;
  readonly studyCount: number;
  readonly warningCount: number;
  /** False when the import ran with --without-persons. */
  readonly includesPersons: boolean;
}

export interface CatalogSnapshot {
  readonly schemaVersion: typeof CATALOG_SNAPSHOT_SCHEMA_VERSION;
  readonly importRun: ImportRunSummary;
  readonly keywords: readonly KeywordItem[];
  readonly mechanisms: readonly ReferenceItem[];
  readonly siteTypes: readonly ReferenceItem[];
  readonly institutionTypes: readonly ReferenceItem[];
  readonly sourceTypes: readonly ReferenceItem[];
  readonly indicators: readonly ReferenceItem[];
  readonly places: readonly PlaceRecord[];
  readonly parties: readonly PartyRecord[];
  readonly sources: readonly SourceRecord[];
  readonly entries: readonly SnapshotEntry[];
}
