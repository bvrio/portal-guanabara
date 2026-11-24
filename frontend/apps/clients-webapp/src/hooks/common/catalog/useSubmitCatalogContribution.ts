import { createOperation } from '~/lib/createOperation';
import { catalogService, type CatalogContributionRequest } from '~/services/common/catalog';

export type { CatalogContributionReceipt, CatalogContributionRequest } from '~/services/common/catalog';

/** Hook for the `submitContribution` operation of the Catalog Journey Service (v0.9.25). */
export function useSubmitCatalogContribution() {
  return createOperation((request: CatalogContributionRequest) => catalogService.submitContribution(request));
}
