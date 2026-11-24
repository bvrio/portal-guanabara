import { getCookie, type H3Event } from 'h3';

import { useRuntimeConfig } from '#imports';

/*
 * Mirrors the `contributionForms` Feature Flag of the Frontend
 * (src/shared/hooks/feature-flag/featureFlags.ts), like personNames.ts.
 * Remove both together when the flag is retired.
 */
const FLAG = 'contributionForms';
const DEV_OVERRIDES_COOKIE = 'pg_feature_flags';

export function contributionsEnabled(event: H3Event): boolean {
  if (import.meta.dev) {
    const raw = getCookie(event, DEV_OVERRIDES_COOKIE);
    if (raw) {
      try {
        const overrides = JSON.parse(raw) as Record<string, unknown>;
        if (typeof overrides[FLAG] === 'boolean') return overrides[FLAG];
      } catch {
        // Malformed DEV cookie: fall back to runtime config.
      }
    }
  }
  const flags = useRuntimeConfig(event).public.featureFlags as Record<string, unknown> | undefined;
  return flags?.[FLAG] === true;
}
