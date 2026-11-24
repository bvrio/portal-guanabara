import { type H3Event, setResponseHeader } from 'h3';

/**
 * The catalog changes only when a new snapshot is deployed, so responses can
 * be cached briefly. Not in development, where flags are toggled by cookie.
 * Labels follow `Accept-Language`, so shared caches keep one copy per language.
 */
export function cachePublicly(event: H3Event, seconds = 300) {
  setResponseHeader(event, 'vary', 'accept-language');
  if (import.meta.dev) return;
  setResponseHeader(event, 'cache-control', `public, max-age=${seconds}`);
}
