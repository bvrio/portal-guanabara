import { computed } from 'vue';

import { useAsyncData } from '#imports';
import type { JourneyFeatureKey, JourneyKey } from '@portal-guanabara/journey-manifests';

import { featureManagementService } from '~/shared/services/feature-management';

/**
 * Feature Management consumer (apps/AGENTS.md §15).
 *
 * Requests the BFF decision for the Journey being rendered. Pages react to
 * `granted` / `reason` (Journey access) and `isFeatureEnabled` (Feature access).
 * The returned object is awaitable so Pages can resolve it during SSR:
 *
 *   const userAccess = await useFeatureManagement('user');
 */
export function useFeatureManagement<K extends JourneyKey>(journey: K) {
  const asyncData = useAsyncData(`feature-management:${journey}`, () =>
    featureManagementService.getJourneyDecision(journey),
  );

  const decision = asyncData.data;

  const access = {
    decision,
    granted: computed(() => decision.value?.granted === true),
    reason: computed(() => decision.value?.reason ?? null),
    isFeatureEnabled: (feature: JourneyFeatureKey<K>) => decision.value?.features[feature] === true,
    status: asyncData.status,
    error: asyncData.error,
    refresh: asyncData.refresh,
  };

  return Object.assign(
    asyncData.then(() => access),
    access,
  );
}
