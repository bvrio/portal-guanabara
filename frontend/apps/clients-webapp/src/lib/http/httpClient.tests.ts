import { describe, expect, it } from 'vitest';

import { createFakeHttpTransport } from './fakeHttpTransport';
import { createHttpClient } from './httpClient';
import { HttpError, isHttpError } from './HttpError';

describe('httpClient', () => {
  it('maps verbs and query strings to requests', async () => {
    const { transport, calls } = createFakeHttpTransport(() => ({ ok: true }));
    const client = createHttpClient(transport);

    await client.get('/a');
    await client.get('/catalog/entries', { page: 2, q: 'lixo' });
    await client.put('/b', { x: 1 });

    expect(calls).toEqual([
      { path: '/a', method: 'GET' },
      { path: '/catalog/entries', method: 'GET', query: { page: 2, q: 'lixo' } },
      { path: '/b', method: 'PUT', body: { x: 1 } },
    ]);
  });

  it('normalizes h3 error payloads into HttpError', async () => {
    const client = createHttpClient(async () => {
      throw Object.assign(new Error('boom'), {
        statusCode: 401,
        data: { statusCode: 401, data: { code: 'INVALID_CREDENTIALS' } },
      });
    });

    const error = await client.post('/login').catch((cause: unknown) => cause);

    expect(error).toBeInstanceOf(HttpError);
    expect(isHttpError(error, 'INVALID_CREDENTIALS')).toBe(true);
    expect((error as HttpError).status).toBe(401);
  });

  it('keeps the code readable after Nuxt wraps the error', async () => {
    const { httpErrorCode } = await import('./HttpError');
    const nuxtLike = { statusCode: 404, data: { code: 'CATALOG_ENTRY_NOT_FOUND' } };
    expect(httpErrorCode(nuxtLike)).toBe('CATALOG_ENTRY_NOT_FOUND');
    expect(httpErrorCode(new HttpError(404, 'X'))).toBe('X');
    expect(httpErrorCode(new Error('plain'))).toBeUndefined();
  });

  it('labels network failures', async () => {
    const client = createHttpClient(async () => {
      throw new Error('offline');
    });
    const error = await client.get('/x').catch((cause: unknown) => cause);
    expect(isHttpError(error, 'NETWORK_ERROR')).toBe(true);
  });
});
