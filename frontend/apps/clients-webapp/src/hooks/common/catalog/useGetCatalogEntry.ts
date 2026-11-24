import { type MaybeRefOrGetter, toValue } from 'vue';

import { useAsyncData } from '#imports';

import { localeState } from '~/lib/i18n';
import { catalogService } from '~/services/common/catalog';

/** Hook for the `getEntry` operation; `ref` is the workbook ID from the URL. */
export function useGetCatalogEntry(ref: MaybeRefOrGetter<number>) {
  const locale = localeState();
  return useAsyncData(
    () => `catalog:entry:${locale.value}:${toValue(ref)}`,
    () => catalogService.getEntry(toValue(ref)),
  );
}
