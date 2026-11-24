import { mockBffClient } from '~/lib/http';

/**
 * DEV-only access to the mock BFF persona endpoints (server/routes/mock-bff/dev).
 * Not a Journey Service: it exists only to drive the DEV toolbar.
 */
export interface DevPersona {
  id: string;
  label: string;
  email: string;
  userType: string;
  capabilities: string[];
}

export const devSession = {
  listPersonas: () => mockBffClient.get<DevPersona[]>('/dev/personas'),
  getSession: () => mockBffClient.get<{ accountId: string | null }>('/dev/session'),
  switchPersona: (accountId: string | null) =>
    mockBffClient.put<{ accountId: string | null }>('/dev/session', { accountId }),
};
