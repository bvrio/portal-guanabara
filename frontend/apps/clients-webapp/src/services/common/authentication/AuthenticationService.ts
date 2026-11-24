import { mockBffClient, type HttpClient } from '~/lib/http';

import type { AuthenticationService, LoginResponse } from './AuthenticationService.types';

export function createAuthenticationService(bff: HttpClient): AuthenticationService {
  return {
    login: (request) => bff.post<LoginResponse>('/authentication/login', request),
    logout: () => bff.post<unknown>('/authentication/logout').then(() => undefined),
    register: (request) => bff.post<unknown>('/authentication/registration', request).then(() => undefined),
    requestPasswordReset: (request) =>
      bff.post<unknown>('/authentication/password-reset', request).then(() => undefined),
  };
}

/** Authentication Journey Service facade (mock BFF: runtimeConfig.public.mockBffBaseUrl). */
export const authenticationService = createAuthenticationService(mockBffClient);
