import { type HttpClient, mockBffClient } from '~/lib/http';

import type { Session, SessionService } from './SessionService.types';

export function createSessionService(bff: HttpClient): SessionService {
  return {
    getSession: () => bff.get<Session>('/authentication/session'),
  };
}

/** Session Service facade (mock BFF: runtimeConfig.public.mockBffBaseUrl). */
export const sessionService = createSessionService(mockBffClient);
