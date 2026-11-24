import { describe, expect, it } from 'vitest';

import { createHttpClient } from '~/lib/http';
import { createFakeHttpTransport } from '~/lib/http/fakeHttpTransport';

import { createAuthenticationService } from './AuthenticationService';

describe('AuthenticationService', () => {
  it('calls the BFF Authentication operations', async () => {
    const { transport, calls } = createFakeHttpTransport(() => ({ authenticated: true }));
    const service = createAuthenticationService(createHttpClient(transport));

    await expect(service.login({ email: 'a@b.c', password: 'x' })).resolves.toEqual({ authenticated: true });
    await service.logout();
    await service.requestPasswordReset({ email: 'a@b.c' });

    expect(calls.map(({ method, path }) => `${method} ${path}`)).toEqual([
      'POST /authentication/login',
      'POST /authentication/logout',
      'POST /authentication/password-reset',
    ]);
  });
});
