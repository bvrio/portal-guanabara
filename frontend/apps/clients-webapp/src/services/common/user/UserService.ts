import { mockBffClient, type HttpClient } from '~/lib/http';

import type { CommunicationPreferences, User, UserService } from './UserService.types';

export function createUserService(bff: HttpClient): UserService {
  return {
    getUser: () => bff.get<User>('/user/profile'),
    updateUser: (request) => bff.put<User>('/user/profile', request),
    changePassword: (request) => bff.put<unknown>('/user/password', request).then(() => undefined),
    getCommunicationPreferences: () => bff.get<CommunicationPreferences>('/user/preferences'),
    updateCommunicationPreferences: (request) =>
      bff.put<CommunicationPreferences>('/user/preferences', request),
  };
}

/** User Journey Service facade (mock BFF: runtimeConfig.public.mockBffBaseUrl). */
export const userService = createUserService(mockBffClient);
