/**
 * Serves /api/catalog/* inside the Nuxt test runtime with the App's real
 * server handlers, which read the published snapshot through the Catalog
 * Domain. Only exact paths can be registered, so detail pages register the
 * IDs they need.
 */
import { registerEndpoint } from '@nuxt/test-utils/runtime';

import entryHandler from '../../server/api/catalog/entries/[ref].get';
import listHandler from '../../server/api/catalog/entries/index.get';
import institutionsHandler from '../../server/api/catalog/institutions.get';
import mapHandler from '../../server/api/catalog/map.get';
import overviewHandler from '../../server/api/catalog/overview.get';

export function registerCatalogEndpoints(entryRefs: Array<number | string> = []) {
  registerEndpoint('/api/catalog/overview', overviewHandler);
  registerEndpoint('/api/catalog/entries', listHandler);
  registerEndpoint('/api/catalog/institutions', institutionsHandler);
  registerEndpoint('/api/catalog/map', mapHandler);
  for (const ref of entryRefs) {
    registerEndpoint(`/api/catalog/entries/${ref}`, (event) => {
      event.context.params = { ...event.context.params, ref: String(ref) };
      return entryHandler(event);
    });
  }
}
