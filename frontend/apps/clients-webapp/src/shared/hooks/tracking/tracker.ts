import { type AppName, journeyManifests, matchPagePath } from '@portal-guanabara/journey-manifests';

/** Common product events (root AGENTS.md §11). */
export type TrackingEventName = 'page_viewed' | 'feature_exposure' | 'success' | 'error' | 'empty';

export interface TrackingContext {
  app: string;
  journey: string;
  page: string;
}

export interface TrackingEvent extends TrackingContext {
  event: TrackingEventName;
  path: string;
  /** Feature key for `feature_exposure`; action/subject name for the others. */
  subject?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

/** Destination of product events (analytics provider adapter). */
export interface TrackingAdapter {
  send(event: TrackingEvent): void;
}

/** DEV adapter: logs events to the console. Replace with the real provider. */
export const consoleTrackingAdapter: TrackingAdapter = {
  send(event) {
    console.info(`[tracking] ${event.event}`, event);
  },
};

export const noopTrackingAdapter: TrackingAdapter = { send() {} };

/**
 * Derives App / Journey / Page from the current path using the Journey
 * Manifests, so architectural context is never duplicated by hand.
 */
export function resolveTrackingContext(app: string, path: string): TrackingContext | null {
  const normalized = path.length > 1 ? path.replace(/\/+$/, '') : path;

  const pages = journeyManifests.flatMap((manifest) =>
    manifest.pages
      .filter((page) => page.app === (app as AppName))
      .map((page) => ({ journey: manifest.key, page: page.key, path: page.path as string })),
  );
  // Static paths win over parameterized ones (`/catalog/list` before `/catalog/:id`).
  const match =
    pages.find((page) => page.path === normalized) ??
    pages.find((page) => page.path.includes(':') && matchPagePath(page.path, normalized));

  return match ? { app, journey: match.journey, page: match.page } : null;
}

export function createTracker(app: string, getPath: () => string, adapter: TrackingAdapter) {
  function track(event: TrackingEventName, subject?: string, details?: Record<string, unknown>) {
    const path = getPath();
    const context = resolveTrackingContext(app, path) ?? { app, journey: 'unknown', page: 'unknown' };

    adapter.send({ ...context, event, path, subject, details, timestamp: new Date().toISOString() });
  }

  return {
    pageViewed: () => track('page_viewed'),
    featureExposure: (feature: string) => track('feature_exposure', feature),
    success: (action: string, details?: Record<string, unknown>) => track('success', action, details),
    error: (action: string, details?: Record<string, unknown>) => track('error', action, details),
    /** Only for product-meaningful empty states. */
    empty: (subject: string) => track('empty', subject),
  };
}

export type Tracker = ReturnType<typeof createTracker>;
