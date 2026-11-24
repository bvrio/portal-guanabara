import { describe, expect, it } from 'vitest';

import { createHttpClient } from '~/lib/http';
import { createFakeHttpTransport } from '~/lib/http/fakeHttpTransport';

import { createUserService } from './UserService';

const user = {
  fullName: 'Test Name',
  cpf: '12345678900',
  phone: '11999999999',
  email: 'test@example.com',
};

describe('UserService', () => {
  it('reads and updates the profile through the BFF', async () => {
    const { transport, calls } = createFakeHttpTransport(({ body }) => body ?? user);
    const service = createUserService(createHttpClient(transport));

    await expect(service.getUser()).resolves.toEqual(user);
    await expect(service.updateUser({ ...user, phone: '21988887777' })).resolves.toMatchObject({
      phone: '21988887777',
    });

    expect(calls.map(({ method, path }) => `${method} ${path}`)).toEqual([
      'GET /user/profile',
      'PUT /user/profile',
    ]);
  });

  it('maps password and preferences operations', async () => {
    const { transport, calls } = createFakeHttpTransport(({ body }) => body ?? {});
    const service = createUserService(createHttpClient(transport));

    await service.changePassword({
      currentPassword: 'a',
      newPassword: 'bbbbbbbb',
      newPasswordConfirmation: 'bbbbbbbb',
    });
    await service.updateCommunicationPreferences({ email: true, sms: false, whatsapp: true });

    expect(calls.map(({ method, path }) => `${method} ${path}`)).toEqual([
      'PUT /user/password',
      'PUT /user/preferences',
    ]);
  });
});
