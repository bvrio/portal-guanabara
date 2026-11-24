import { defineEventHandler, readBody, setResponseStatus } from 'h3';

import { createAccount, findAccountByEmail } from '../../../mock-bff/accounts';
import { bffError } from '../../../mock-bff/errors';
import { simulateLatency } from '../../../mock-bff/latency';
import { assertNewPassword, readProfile } from '../../../mock-bff/validation';

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event);
  await simulateLatency();

  const profile = readProfile(body);
  const password = assertNewPassword(body?.password, body?.passwordConfirmation);

  if (findAccountByEmail(profile.email)) throw bffError(409, 'EMAIL_ALREADY_REGISTERED');

  createAccount(profile, password);
  setResponseStatus(event, 201);
  return { created: true };
});
