/**
 * Feature Flags — temporary frontend rollout controls (apps/AGENTS.md §16).
 *
 * NOT authorization, NOT Capabilities, NOT Feature Management. Every flag has
 * an owner and a removal date; delete it once the rollout is complete.
 *
 * Values come from runtime config and can be overridden per environment:
 *   NUXT_PUBLIC_FEATURE_FLAGS_HOME_GUIDED_TOUR=true
 */
export const featureFlags = {
  homeGuidedTour: {
    description:
      'Guided tour on Home (built in v0.5, on by default). Kept as a kill switch until BVRio validates the tour; then delete the flag and keep the Feature Management check.',
    owner: 'portal-core',
    removeBy: '2027-03-31',
    defaultValue: true,
  },
  catalogPersonNames: {
    description:
      'Shows coordinators and study authors by name in the Catalog. On in development, off in builds until BVRio answers the LGPD question (Core v2.0, open question 4). The server checks it too, so names never leave the server while it is off.',
    owner: 'portal-core',
    removeBy: '2027-03-31',
    defaultValue: false,
  },
  contributionForms: {
    description:
      'Contribution forms (v0.9.25): the public suggests new entries, institutions or corrections, and the internal team records changes with the same form (/catalog/contribute). On in development, off in builds until BVRio validates the flow and the backend stores submissions. The server checks it too.',
    owner: 'portal-core',
    removeBy: '2027-06-30',
    defaultValue: false,
  },
} as const satisfies Record<
  string,
  { description: string; owner: string; removeBy: string; defaultValue: boolean }
>;

export type FeatureFlagName = keyof typeof featureFlags;

/** Default values, used to declare `runtimeConfig.public.featureFlags`. */
export function defaultFeatureFlags(): Record<FeatureFlagName, boolean> {
  return Object.fromEntries(
    Object.entries(featureFlags).map(([name, flag]) => [name, flag.defaultValue]),
  ) as Record<FeatureFlagName, boolean>;
}

/** DEV-only cookie used by the DEV toolbar to override flags locally. */
export const FEATURE_FLAG_OVERRIDES_COOKIE = 'pg_feature_flags';

export function resolveFeatureFlag(
  name: FeatureFlagName,
  configured: Partial<Record<string, boolean>> | undefined,
  overrides?: Partial<Record<string, boolean>> | null,
): boolean {
  const override = overrides?.[name];
  if (typeof override === 'boolean') return override;

  const value = configured?.[name];
  return typeof value === 'boolean' ? value : featureFlags[name].defaultValue;
}
