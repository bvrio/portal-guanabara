import { computed } from 'vue';

import { useCookie, useHead } from '#imports';

import { toViewZoomLevel, type ViewZoomLevel, viewZoomLevels } from './viewZoom';

const COOKIE = 'pg_view_zoom';

/**
 * The visitor's view size, kept in a cookie so the server renders the page at
 * that size (no jump on load), and set on <html> as `data-zoom`.
 */
export function useViewZoom() {
  const cookie = useCookie<string | number>(COOKIE, { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', path: '/' });
  const level = computed<ViewZoomLevel>({
    get: () => toViewZoomLevel(cookie.value),
    set: (value) => {
      cookie.value = String(toViewZoomLevel(value));
    },
  });

  useHead({ htmlAttrs: { 'data-zoom': () => String(level.value) } });

  return { level, levels: viewZoomLevels };
}
