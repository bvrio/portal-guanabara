import { useRoute, useRuntimeConfig } from '#imports';

import { consoleTrackingAdapter, createTracker, noopTrackingAdapter } from './tracker';

/**
 * Page-level tracking (apps/AGENTS.md §17). Context is derived from the route;
 * Presentation Lake units never call this.
 */
export function useTracking() {
  const route = useRoute();
  const { appName } = useRuntimeConfig().public;

  return createTracker(
    appName,
    () => route.path,
    import.meta.client ? consoleTrackingAdapter : noopTrackingAdapter,
  );
}
