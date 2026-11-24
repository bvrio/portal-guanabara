import { defineEventHandler, readBody } from 'h3';

import { findAccountById } from '../../../mock-bff/accounts';
import { bffError } from '../../../mock-bff/errors';
import { endSession, startSession } from '../../../mock-bff/session';

/** DEV only: switch persona without logging in (`accountId: null` logs out). */
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) throw bffError(404, 'NOT_FOUND');

  const body = await readBody<{ accountId?: string | null }>(event);

  if (!body?.accountId) {
    endSession(event);
    return { accountId: null };
  }

  const account = findAccountById(body.accountId);
  if (!account) throw bffError(404, 'NOT_FOUND', 'Unknown persona');

  startSession(event, account);
  return { accountId: account.id };
});
