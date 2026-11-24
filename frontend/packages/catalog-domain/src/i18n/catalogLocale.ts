/**
 * Languages of the catalog's controlled vocabularies (v0.7).
 *
 * Taxonomy labels — keywords, mechanisms, site, institution and source types,
 * indicators and bay sectors — are data, so the Domain translates them, not
 * the web app. Free text (entry names, objectives, results) and proper names
 * (municipalities, rivers, institutions) stay in Portuguese.
 */
export const CATALOG_LOCALES = ['pt-BR', 'en', 'es', 'fr'] as const;
export type CatalogLocale = (typeof CATALOG_LOCALES)[number];
export const DEFAULT_CATALOG_LOCALE: CatalogLocale = 'pt-BR';

/** `en-US` → `en`, `pt` → `pt-BR`; anything else → undefined. */
export function toCatalogLocale(value: unknown): CatalogLocale | undefined {
  if (typeof value !== 'string') return undefined;
  const tag = value.trim().toLowerCase();
  if (!tag) return undefined;
  const language = tag.split(/[-_]/)[0];
  if (language === 'pt') return 'pt-BR';
  return CATALOG_LOCALES.find((locale) => locale === language);
}

/**
 * Picks the catalog language from an `Accept-Language` header: the first
 * supported language by preference (q), Portuguese when none matches.
 */
export function negotiateCatalogLocale(header: string | null | undefined): CatalogLocale {
  if (!header) return DEFAULT_CATALOG_LOCALE;
  const ranked = header
    .split(',')
    .map((part, order) => {
      const [tag = '', ...params] = part.trim().split(';');
      const q = params.map((param) => param.trim()).find((param) => param.startsWith('q='));
      return { tag, q: q ? Number(q.slice(2)) || 0 : 1, order };
    })
    .filter((item) => item.q > 0)
    .sort((a, b) => b.q - a.q || a.order - b.order);
  for (const { tag } of ranked) {
    const locale = toCatalogLocale(tag);
    if (locale) return locale;
  }
  return DEFAULT_CATALOG_LOCALE;
}
