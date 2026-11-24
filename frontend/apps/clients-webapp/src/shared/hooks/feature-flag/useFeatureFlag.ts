import { computed } from 'vue';

import { useCookie, useRuntimeConfig } from '#imports';

import {
  FEATURE_FLAG_OVERRIDES_COOKIE,
  type FeatureFlagName,
  resolveFeatureFlag,
} from './featureFlags';

/** Reactive value of a Feature Flag (runtime config, DEV overrides via cookie). */
export function useFeatureFlag(name: FeatureFlagName) {
  const configured = useRuntimeConfig().public.featureFlags as Partial<Record<string, boolean>>;
  const overrides = import.meta.dev
    ? useCookie<Partial<Record<string, boolean>> | null>(FEATURE_FLAG_OVERRIDES_COOKIE)
    : null;

  return computed(() => resolveFeatureFlag(name, configured, overrides?.value));
}
