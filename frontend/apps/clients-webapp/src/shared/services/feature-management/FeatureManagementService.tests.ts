import { describe, expect, it } from 'vitest';

import { createHttpClient } from '~/lib/http';
import { createFakeHttpTransport } from '~/lib/http/fakeHttpTransport';

import { createFeatureManagementService } from './FeatureManagementService';

describe('FeatureManagementService', () => {
  it('requests the decision for a Journey without sending authorization claims', async () => {
    const { transport, calls } = createFakeHttpTransport(() => ({
      journey: 'user',
      granted: true,
      reason: null,
      features: {},
    }));
    const service = createFeatureManagementService(createHttpClient(transport));

    await service.getJourneyDecision('user');

    expect(calls).toEqual([{ path: '/feature-management/user', method: 'GET' }]);
  });
});
