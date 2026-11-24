import { describe, expect, it } from 'vitest';

import { createHttpClient } from '~/lib/http';
import { createFakeHttpTransport } from '~/lib/http/fakeHttpTransport';

import { createSessionService } from './SessionService';

describe('SessionService', () => {
  it('reads the session from /authentication/session', async () => {
    const { transport, calls } = createFakeHttpTransport(() => ({ authenticated: false }));
    expect(await createSessionService(createHttpClient(transport)).getSession()).toEqual({ authenticated: false });
    expect(calls).toEqual([{ path: '/authentication/session', method: 'GET' }]);
  });
});
