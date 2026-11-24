import { mockBffClient, type HttpClient } from '~/lib/http';

import type { FeatureManagementService, JourneyDecision } from './FeatureManagementService.types';

export function createFeatureManagementService(bff: HttpClient): FeatureManagementService {
  return {
    getJourneyDecision: (journey) =>
      bff.get<JourneyDecision>(`/feature-management/${encodeURIComponent(journey)}`),
  };
}

export const featureManagementService = createFeatureManagementService(mockBffClient);
