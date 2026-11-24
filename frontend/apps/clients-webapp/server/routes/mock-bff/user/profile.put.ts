import { defineEventHandler, readBody } from 'h3';

import { userManifest } from '@portal-guanabara/journey-manifests';

import { findAccountByEmail } from '../../../mock-bff/accounts';
import { bffError } from '../../../mock-bff/errors';
import { isFeatureGranted } from '../../../mock-bff/featureManagement';
import { simulateLatency } from '../../../mock-bff/latency';
import { getAuthorizationContext, requireSessionAccount } from '../../../mock-bff/session';
import { readProfile } from '../../../mock-bff/validation';

export default defineEventHandler(async (event) => {
  const account = requireSessionAccount(event);
  if (!isFeatureGranted(userManifest, 'user.profile-edit', getAuthorizationContext(event))) {
    throw bffError(403, 'FORBIDDEN');
  }

  const profile = readProfile(await readBody<Record<string, unknown>>(event));
  const owner = findAccountByEmail(profile.email);
  if (owner && owner.id !== account.id) throw bffError(409, 'EMAIL_ALREADY_REGISTERED');

  await simulateLatency();
  account.profile = profile;
  return { ...account.profile };
});
