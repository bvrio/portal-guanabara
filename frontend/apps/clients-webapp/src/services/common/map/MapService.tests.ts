import { describe, expect, it } from 'vitest';

import { createHttpClient } from '~/lib/http';
import { createFakeHttpTransport } from '~/lib/http/fakeHttpTransport';

import { createMapService } from './MapService';

describe('MapService', () => {
  it('reads the map from /api/catalog/map', async () => {
    const { transport, calls } = createFakeHttpTransport(() => ({}));
    await createMapService(createHttpClient(transport)).getMap();
    expect(calls).toEqual([{ path: '/catalog/map', method: 'GET' }]);
  });
});
