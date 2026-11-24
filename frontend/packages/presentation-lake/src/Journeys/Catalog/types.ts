/**
 * Data shapes of the Catalog Journey presentation. Defined here (not imported
 * from the Catalog Domain) so the lake stays independent; the Page maps the
 * API response onto them, adding the links it owns.
 */
/**
 * Language of the catalog's free text (entry names, objectives, results). The
 * interface may be in another language (v0.7): elements holding entry text
 * carry `lang` so screen readers and hyphenation read them as Portuguese.
 */
export const CATALOG_CONTENT_LANG = 'pt-BR';

export type CatalogEntryKind = 'project' | 'study';
export type CatalogEntryStatus = 'active' | 'in_implementation' | 'ended' | 'published' | 'in_progress';
export type CatalogPeriodicity = 'continuous' | 'periodic' | 'one_off';
export type CatalogPlaceType =
  | 'sector'
  | 'municipality'
  | 'locality'
  | 'river'
  | 'conservation_unit'
  | 'fishing_colony';
export type CatalogPartyRole = 'executor' | 'funder' | 'partner' | 'coordinator' | 'author';

/** A date known only to the day, month or year (never shown more precisely). */
export interface CatalogPartialDate {
  date: string;
  precision: 'day' | 'month' | 'year';
}

export interface CatalogPeriodValue {
  start: CatalogPartialDate | null;
  end: CatalogPartialDate | null;
  ongoing: boolean;
}

export interface CatalogTagItem {
  code: string;
  label: string;
  href?: string;
}

/** One entry as listed: list page, highlights. */
export interface CatalogEntryItem extends CatalogPeriodValue {
  ref: number;
  kind: CatalogEntryKind;
  name: string;
  objective: string | null;
  status: CatalogEntryStatus | null;
  municipalities: readonly string[];
  /** Bay sectors; `code` is the sector slug (interior, transicao, …). */
  sectors: readonly CatalogTagItem[];
  keywords: readonly CatalogTagItem[];
  publicationYears: readonly number[];
  href: string;
}
