import type {
  CatalogEntryDetails,
  CatalogListQuery,
  CatalogListResult,
  CatalogOverview,
} from '@portal-guanabara/catalog-domain/contracts';

/** A contribution to the catalogue (v0.9.25): a suggestion, or a change the internal team records. */
export interface CatalogContributionRequest {
  audience: 'public' | 'team';
  subject: 'new-entry' | 'fix-entry' | 'new-institution' | 'fix-institution';
  target?: string;
  kind?: 'project' | 'study';
  name?: string;
  details: string;
  places?: string;
  institutions?: string;
  source?: string;
  contactName?: string;
  /** Only with the person's consent. */
  contactEmail?: string;
}

export interface CatalogContributionReceipt {
  id: string;
  /** `received`: waits for review; `recorded`: a change of the internal team, waits to be applied. */
  status: 'received' | 'recorded';
  receivedAt: string;
}

/** Catalog Journey Service — reads the App's own API (/api/catalog) and sends contributions (/api/submissions). */
export interface CatalogService {
  getOverview(): Promise<CatalogOverview>;
  listEntries(query: CatalogListQuery): Promise<CatalogListResult>;
  /** `ref` is the workbook ID (D-047). Rejects with CATALOG_ENTRY_NOT_FOUND. */
  getEntry(ref: number): Promise<CatalogEntryDetails>;
  /** Rejects with CONTRIBUTIONS_DISABLED (flag off) or CONTRIBUTION_INVALID. */
  submitContribution(request: CatalogContributionRequest): Promise<CatalogContributionReceipt>;
}

export type CatalogErrorCode = 'CATALOG_ENTRY_NOT_FOUND' | 'CONTRIBUTIONS_DISABLED' | 'CONTRIBUTION_INVALID';
