import { buildPagePath, type PathParams } from '@portal-guanabara/journey-manifests';

import { routes } from './routes';

/** Path patterns by route name; parameters are `:name` segments (e.g. `/catalog/:id`). */
export const routePaths = {
  home: routes.home.path,

  catalogList: routes.catalog.list.path,
  catalogDetails: routes.catalog.details.path,
  catalogContribute: routes.catalog.contribute.path,

  institutionsList: routes.institutions.list.path,
  mapExplore: routes.map.explore.path,
  aboutOverview: routes.about.overview.path,

  authenticationLogin: routes.authentication.login.path,
  authenticationRegistration: routes.authentication.registration.path,
  authenticationResetPassword: routes.authentication.resetPassword.path,

  userOverview: routes.user.overview.path,
  userDetails: routes.user.details.path,
  userManagement: routes.user.management.path,
} as const;

export type RouteName = keyof typeof routePaths;

/** Concrete path of a route: `routePath('catalogDetails', { id: 36 })` → `/catalog/36`. */
export function routePath(route: RouteName, params?: PathParams): string {
  return buildPagePath(routePaths[route], params);
}
