import { useNuxtApp, useRoute, useRuntimeConfig } from '#imports';

import { consoleTrackingAdapter, createTracker } from './tracker';

/** Emits `page_viewed` after every client-side page render. Used once in app.vue. */
export function usePageViewTracking() {
  if (!import.meta.client) return;

  const route = useRoute();
  const { appName } = useRuntimeConfig().public;
  const tracker = createTracker(appName, () => route.path, consoleTrackingAdapter);

  useNuxtApp().hook('page:finish', () => tracker.pageViewed());
}
