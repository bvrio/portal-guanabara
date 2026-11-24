import { deleteCookie, getCookie, type H3Event, setCookie } from 'h3';

import { findAccountById, type MockAccount } from './accounts';
import { bffError } from './errors';
import type { AuthorizationContext } from './featureManagement';

/** Mock session: the cookie stores the account id (never do this in a real BFF). */
export const SESSION_COOKIE = 'pg_mock_session';

export function getSessionAccount(event: H3Event): MockAccount | undefined {
  return findAccountById(getCookie(event, SESSION_COOKIE));
}

export function requireSessionAccount(event: H3Event): MockAccount {
  const account = getSessionAccount(event);
  if (!account) throw bffError(401, 'UNAUTHENTICATED');
  return account;
}

export function startSession(event: H3Event, account: MockAccount) {
  setCookie(event, SESSION_COOKIE, account.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
}

export function endSession(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE, { path: '/' });
}

/** The authenticated context the BFF derives — never sent by the Frontend. */
export function getAuthorizationContext(event: H3Event): AuthorizationContext {
  const account = getSessionAccount(event);

  return account
    ? { authenticated: true, userType: account.userType, capabilities: account.capabilities }
    : { authenticated: false, capabilities: [] };
}
