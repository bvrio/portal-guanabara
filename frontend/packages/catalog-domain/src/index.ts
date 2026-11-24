/**
 * Catalog Domain — server-side entry point.
 *
 * Imported by the web app's server routes (/api/catalog/*) and by tools.
 * Frontend code imports `@portal-guanabara/catalog-domain/contracts` only.
 */
export { getCatalogReader } from './read/catalogReader.ts';
export {
  type CatalogReader,
  type CatalogReaderOptions,
  createCatalogReader,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from './read/createCatalogReader.ts';

export { importCatalog, type ImportOptions, type ImportResult } from './importer/importCatalog.ts';
export { renderReportMarkdown, type ImportIssue, type ImportReport, type IssueRule } from './importer/report.ts';
export type { SheetRows, WorkbookData, WorkbookSource } from './importer/workbook.ts';

export {
  CATALOG_LOCALES,
  type CatalogLocale,
  DEFAULT_CATALOG_LOCALE,
  negotiateCatalogLocale,
  toCatalogLocale,
} from './i18n/catalogLocale.ts';
export { localizeSnapshot } from './i18n/localizeSnapshot.ts';
export { TAXONOMY_LABELS, type TaxonomyList, translateTaxonomyLabel } from './i18n/taxonomyLabels.ts';
export { buildBoundaries, MAP_VIEW, type SourceMunicipality } from './geo/buildBoundaries.ts';

export * from './model/baySectors.ts';
export * from './model/boundaries.ts';
export * from './model/snapshot.ts';
export type * from './contracts/index.ts';
