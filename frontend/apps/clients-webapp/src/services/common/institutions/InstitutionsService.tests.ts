import { describe, expect, it } from 'vitest';

import { createHttpClient } from '~/lib/http';
import { createFakeHttpTransport } from '~/lib/http/fakeHttpTransport';

import { createInstitutionsService } from './InstitutionsService';

describe('InstitutionsService', () => {
  it('lists institutions from /api/catalog/institutions', async () => {
    const { transport, calls } = createFakeHttpTransport(() => ({}));
    const service = createInstitutionsService(createHttpClient(transport));

    await service.listInstitutions({ q: 'uff', role: 'author', type: undefined, page: 2 });

    expect(calls).toEqual([{ path: '/catalog/institutions', method: 'GET', query: { q: 'uff', role: 'author', page: 2 } }]);
  });
});
