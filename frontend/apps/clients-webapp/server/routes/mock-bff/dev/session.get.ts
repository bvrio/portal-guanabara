import { defineEventHandler } from 'h3';

import { bffError } from '../../../mock-bff/errors';
import { getSessionAccount } from '../../../mock-bff/session';

/** DEV only: which persona the current session uses. */
export default defineEventHandler((event) => {
  if (!import.meta.dev) throw bffError(404, 'NOT_FOUND');

  const account = getSessionAccount(event);
  return { accountId: account?.id ?? null };
});
