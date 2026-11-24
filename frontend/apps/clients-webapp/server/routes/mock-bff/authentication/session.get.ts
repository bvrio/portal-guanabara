import { defineEventHandler } from 'h3';

import { getSessionAccount } from '../../../mock-bff/session';

/**
 * GET /mock-bff/authentication/session → who is signed in, for the site header
 * (v0.8). Anonymous visitors get `{ authenticated: false }`, never a 401.
 */
export default defineEventHandler((event) => {
  const account = getSessionAccount(event);
  return account ? { authenticated: true, fullName: account.profile.fullName } : { authenticated: false };
});
