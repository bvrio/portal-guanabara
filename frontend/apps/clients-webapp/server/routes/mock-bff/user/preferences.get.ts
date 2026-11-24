import { defineEventHandler } from 'h3';

import { userManifest } from '@portal-guanabara/journey-manifests';

import { bffError } from '../../../mock-bff/errors';
import { isFeatureGranted } from '../../../mock-bff/featureManagement';
import { simulateLatency } from '../../../mock-bff/latency';
import { getAuthorizationContext, requireSessionAccount } from '../../../mock-bff/session';

export default defineEventHandler(async (event) => {
  const account = requireSessionAccount(event);
  if (!isFeatureGranted(userManifest, 'user.communication-preferences', getAuthorizationContext(event))) {
    throw bffError(403, 'FORBIDDEN');
  }

  await simulateLatency();
  return { ...account.preferences };
});
