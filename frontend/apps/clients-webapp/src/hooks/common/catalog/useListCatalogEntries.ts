import type { CatalogListQuery, CatalogListResult } from '@portal-guanabara/catalog-domain/contracts';
import { type MaybeRefOrGetter, toValue } from 'vue';

import { useAsyncData } from '#imports';

import { localeState } from '~/lib/i18n';
import { catalogService } from '~/services/common/catalog';

export interface ListCatalogEntriesOptions {
  /**
   * When false, nothing is fetched and `data` is null — e.g. a preview drawer
   * that is closed. Defaults to true.
   */
  enabled?: MaybeRefOrGetter<boolean>;
  /** Fetch during SSR too (default). Previews opened by the visitor use `false`. */
  server?: boolean;
}

/**
 * Hook for the `listEntries` operation. The key follows the query, so a new
 * query (e.g. after the URL changes) fetches again; the previous result stays
 * on screen while it loads.
 */
export function useListCatalogEntries(
  query: MaybeRefOrGetter<CatalogListQuery>,
  { enabled = true, server = true }: ListCatalogEntriesOptions = {},
) {
  const locale = localeState();
  return useAsyncData<CatalogListResult | null>(
    () => (toValue(enabled) ? `catalog:entries:${locale.value}:${JSON.stringify(toValue(query))}` : 'catalog:entries:idle'),
    () => (toValue(enabled) ? catalogService.listEntries(toValue(query)) : Promise.resolve(null)),
    { server },
  );
}
