import { navigateTo } from '#imports';

import type { PathParams } from '@portal-guanabara/journey-manifests';

import { routePath, type RouteName } from './routePaths';

export type RouteQuery = Record<string, string | undefined>;

export interface GoToRouteOptions {
  params?: PathParams;
  /** Replace the current history entry (e.g. when filters change). */
  replace?: boolean;
}

/** Typed navigation by route name (Nuxt counterpart of router.push). */
export function goToRoute(route: RouteName, query?: RouteQuery, options: GoToRouteOptions = {}) {
  return navigateTo({ path: routePath(route, options.params), query }, { replace: options.replace });
}

/** Only internal, same-origin paths are accepted as post-login redirects. */
export function toSafeRedirect(value: unknown): string | undefined {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : undefined;
}

/**
 * Reaction to a denied Journey decision: anonymous visitors go to Login
 * (and come back afterwards); signed-in users without access go Home.
 */
export function goToJourneyDenied(reason: 'unauthenticated' | 'forbidden' | null, returnTo?: string) {
  return reason === 'unauthenticated'
    ? goToRoute('authenticationLogin', { redirect: toSafeRedirect(returnTo) })
    : goToRoute('home');
}
