import {
  aboutManifest,
  authenticationManifest,
  catalogManifest,
  homeManifest,
  institutionsManifest,
  type JourneyManifest,
  mapManifest,
  type PageKeyOf,
  userManifest,
} from '@portal-guanabara/journey-manifests';

/**
 * Route table derived from the Journey Manifests — the manifest is the single
 * source of truth for Journey, Page and path (no manual duplication).
 */
function pageRoute<M extends JourneyManifest>(manifest: M, key: PageKeyOf<M>) {
  const page = manifest.pages.find((candidate) => candidate.key === key && candidate.app === 'clients-webapp');
  if (!page) throw new Error(`Page "${String(key)}" is not declared for clients-webapp in ${manifest.key}`);

  return { journey: manifest.journey, page: page.name, path: page.path } as const;
}

export const routes = {
  home: pageRoute(homeManifest, 'home'),

  catalog: {
    list: pageRoute(catalogManifest, 'list'),
    details: pageRoute(catalogManifest, 'details'),
    contribute: pageRoute(catalogManifest, 'contribute'),
  },

  institutions: {
    list: pageRoute(institutionsManifest, 'list'),
  },

  map: {
    explore: pageRoute(mapManifest, 'explore'),
  },

  about: {
    overview: pageRoute(aboutManifest, 'overview'),
  },

  authentication: {
    login: pageRoute(authenticationManifest, 'login'),
    registration: pageRoute(authenticationManifest, 'registration'),
    resetPassword: pageRoute(authenticationManifest, 'reset-password'),
  },

  user: {
    overview: pageRoute(userManifest, 'overview'),
    details: pageRoute(userManifest, 'details'),
    management: pageRoute(userManifest, 'management'),
  },
} as const;
