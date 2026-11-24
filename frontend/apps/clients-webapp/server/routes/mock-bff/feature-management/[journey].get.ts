import { defineEventHandler, getRouterParam } from 'h3';

import { getJourneyManifest } from '@portal-guanabara/journey-manifests';

import { bffError } from '../../../mock-bff/errors';
import { resolveJourneyDecision } from '../../../mock-bff/featureManagement';
import { getAuthorizationContext } from '../../../mock-bff/session';

/**
 * Journey-scoped Feature Management. The Frontend only says which Journey it
 * is rendering; User Type and Capabilities come from the session.
 */
export default defineEventHandler((event) => {
  const manifest = getJourneyManifest(getRouterParam(event, 'journey') ?? '');
  if (!manifest) throw bffError(404, 'NOT_FOUND', 'Unknown Journey');

  return resolveJourneyDecision(manifest, getAuthorizationContext(event));
});
