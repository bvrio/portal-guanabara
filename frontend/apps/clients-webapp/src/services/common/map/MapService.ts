import { apiClient, type HttpClient } from '~/lib/http';

import type { MapService } from './MapService.types';

export function createMapService(http: HttpClient): MapService {
  return {
    getMap: () => http.get('/catalog/map'),
  };
}

/** Map Journey Service facade (same-origin `/api`, Q-B1). */
export const mapService = createMapService(apiClient);
