import { describe, expect, it } from 'vitest';

import { createHttpClient } from '~/lib/http';
import { createFakeHttpTransport } from '~/lib/http/fakeHttpTransport';

import { createCatalogService } from './CatalogService';

describe('CatalogService', () => {
  it('reads the overview, the list and one entry from /api/catalog', async () => {
    const { transport, calls } = createFakeHttpTransport(() => ({}));
    const service = createCatalogService(createHttpClient(transport));

    await service.getOverview();
    await service.listEntries({ q: 'lixo', kind: 'project', keyword: undefined, page: 2 });
    await service.getEntry(36);

    expect(calls).toEqual([
      { path: '/catalog/overview', method: 'GET' },
      { path: '/catalog/entries', method: 'GET', query: { q: 'lixo', kind: 'project', page: 2 } },
      { path: '/catalog/entries/36', method: 'GET' },
    ]);
  });
});
