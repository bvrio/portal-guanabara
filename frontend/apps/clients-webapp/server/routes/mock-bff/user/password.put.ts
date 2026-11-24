import { defineEventHandler, readBody } from 'h3';

import { userManifest } from '@portal-guanabara/journey-manifests';

import { bffError } from '../../../mock-bff/errors';
import { isFeatureGranted } from '../../../mock-bff/featureManagement';
import { simulateLatency } from '../../../mock-bff/latency';
import { getAuthorizationContext, requireSessionAccount } from '../../../mock-bff/session';
import { assertNewPassword } from '../../../mock-bff/validation';

export default defineEventHandler(async (event) => {
  const account = requireSessionAccount(event);
  if (!isFeatureGranted(userManifest, 'user.change-password', getAuthorizationContext(event))) {
    throw bffError(403, 'FORBIDDEN');
  }

  const body = await readBody<Record<string, unknown>>(event);
  await simulateLatency();

  if (body?.currentPassword !== account.password) throw bffError(422, 'INVALID_CURRENT_PASSWORD');
  account.password = assertNewPassword(body?.newPassword, body?.newPasswordConfirmation);

  return { changed: true };
});
