import type {
  CatalogInstitutionListResult,
  CatalogInstitutionQuery,
} from '@portal-guanabara/catalog-domain/contracts';

/** Institutions Journey Service — reads the App's own API (/api/catalog/institutions). */
export interface InstitutionsService {
  listInstitutions(query: CatalogInstitutionQuery): Promise<CatalogInstitutionListResult>;
}
