import { useAsyncData } from '#imports';

import { localeState } from '~/lib/i18n';
import { catalogService } from '~/services/common/catalog';

/**
 * Hook for the `getOverview` operation of the Catalog Journey Service (SSR + hydration).
 * Keyed by language: labels of the controlled vocabularies are translated.
 */
export function useGetCatalogOverview() {
  const locale = localeState();
  return useAsyncData(() => `catalog:overview:${locale.value}`, () => catalogService.getOverview());
}
