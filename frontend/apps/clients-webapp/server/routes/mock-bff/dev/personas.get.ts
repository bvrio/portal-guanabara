import { defineEventHandler } from 'h3';

import { listAccounts } from '../../../mock-bff/accounts';
import { bffError } from '../../../mock-bff/errors';

/** DEV only: personas available to the DEV toolbar. */
export default defineEventHandler(() => {
  if (!import.meta.dev) throw bffError(404, 'NOT_FOUND');

  return listAccounts().map((account) => ({
    id: account.id,
    label: account.label,
    email: account.profile.email,
    userType: account.userType,
    capabilities: account.capabilities,
  }));
});
