import { defineEventHandler, readBody } from 'h3';

import { findAccountByEmail } from '../../../mock-bff/accounts';
import { bffError } from '../../../mock-bff/errors';
import { simulateLatency } from '../../../mock-bff/latency';
import { startSession } from '../../../mock-bff/session';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string }>(event);
  await simulateLatency();

  const account = body?.email ? findAccountByEmail(body.email) : undefined;
  if (!account || account.password !== body?.password) {
    throw bffError(401, 'INVALID_CREDENTIALS');
  }

  startSession(event, account);
  return { authenticated: true };
});
