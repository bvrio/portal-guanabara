import { getCookie, type H3Event } from 'h3';

import { useRuntimeConfig } from '#imports';

/*
 * Mirrors the `catalogPersonNames` Feature Flag of the Frontend
 * (src/shared/hooks/feature-flag/featureFlags.ts). Server code cannot import
 * Frontend code, so the name of the flag and of the DEV override cookie are
 * repeated here. Remove both together when the flag is retired.
 */
const FLAG = 'catalogPersonNames';
const DEV_OVERRIDES_COOKIE = 'pg_feature_flags';

/**
 * Person names leave the server only when the flag is on (LGPD, Core v2.0
 * open question 4). The decision is taken here, not in the browser, so a
 * visitor cannot ask for names the page would hide.
 */
export function personNamesEnabled(event: H3Event): boolean {
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
