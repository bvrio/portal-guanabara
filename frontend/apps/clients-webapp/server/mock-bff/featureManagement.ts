import type {
  AccessRequirement,
  Capability,
  JourneyManifest,
  UserType,
} from '@portal-guanabara/journey-manifests';

export interface AuthorizationContext {
  authenticated: boolean;
  userType?: UserType;
  capabilities: readonly Capability[];
}

export type JourneyDenialReason = 'unauthenticated' | 'forbidden';

/** Feature Management decision returned to the Frontend for one Journey. */
export interface JourneyDecision {
  journey: string;
  granted: boolean;
  reason: JourneyDenialReason | null;
  features: Record<string, boolean>;
}

export function satisfiesAccess(requirement: AccessRequirement, context: AuthorizationContext): boolean {
  if (requirement.authentication === 'public') return true;
  if (!context.authenticated || !context.userType) return false;

  if (requirement.userTypes && !requirement.userTypes.includes(context.userType)) return false;

  if (
    requirement.capabilities &&
    !requirement.capabilities.some((capability) => context.capabilities.includes(capability))
  ) {
    return false;
  }

  return true;
}

export function resolveJourneyDecision(
  manifest: JourneyManifest,
  context: AuthorizationContext,
): JourneyDecision {
  const granted = satisfiesAccess(manifest.access, context);

  return {
    journey: manifest.key,
    granted,
    reason: granted ? null : context.authenticated ? 'forbidden' : 'unauthenticated',
    features: Object.fromEntries(
      manifest.features.map((feature) => [
        feature.key,
        granted && (!feature.access || satisfiesAccess(feature.access, context)),
      ]),
    ),
  };
}

export function isFeatureGranted(
  manifest: JourneyManifest,
  featureKey: string,
  context: AuthorizationContext,
): boolean {
  return resolveJourneyDecision(manifest, context).features[featureKey] === true;
}
