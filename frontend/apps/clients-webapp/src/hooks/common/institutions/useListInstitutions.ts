import { type MaybeRefOrGetter, toValue } from 'vue';

import { useAsyncData } from '#imports';
import type {
  CatalogInstitutionListResult,
  CatalogInstitutionQuery,
} from '@portal-guanabara/catalog-domain/contracts';

import { localeState } from '~/lib/i18n';
import { institutionsService } from '~/services/common/institutions';

/** The institution directory for a query (search, kind, role, type, sort, page). */
export function useListInstitutions(query: MaybeRefOrGetter<CatalogInstitutionQuery>) {
  const locale = localeState();
  return useAsyncData<CatalogInstitutionListResult>(
    () => `institutions:list:${locale.value}:${JSON.stringify(toValue(query))}`,
    () => institutionsService.listInstitutions(toValue(query)),
  );
}
