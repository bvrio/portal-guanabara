import type { CatalogMap } from '@portal-guanabara/catalog-domain/contracts';

/** Map Journey Service — reads the App's own API (/api/catalog/map). */
export interface MapService {
  getMap(): Promise<CatalogMap>;
}
