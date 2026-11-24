import type { JourneyKey } from '@portal-guanabara/journey-manifests';

export type JourneyDenialReason = 'unauthenticated' | 'forbidden';

/** Feature Management decision returned by the BFF for one Journey. */
export interface JourneyDecision {
  journey: JourneyKey;
  granted: boolean;
  reason: JourneyDenialReason | null;
  features: Record<string, boolean>;
}

/**
 * App-local shared Service for Feature Management.
 * The Frontend only says which Journey it renders — never its Capabilities.
 */
export interface FeatureManagementService {
  getJourneyDecision(journey: JourneyKey): Promise<JourneyDecision>;
}
