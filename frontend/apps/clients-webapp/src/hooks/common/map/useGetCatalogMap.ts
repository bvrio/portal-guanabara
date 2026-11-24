import { useAsyncData } from '#imports';
import type { CatalogMap } from '@portal-guanabara/catalog-domain/contracts';

import { localeState } from '~/lib/i18n';
import { mapService } from '~/services/common/map';

/** Hook for the `getMap` operation of the Map Journey Service (SSR + hydration), keyed by language. */
export function useGetCatalogMap() {
  const locale = localeState();
  return useAsyncData<CatalogMap>(() => `map:catalog:${locale.value}`, () => mapService.getMap());
}
