import { useRequestFetch, useRuntimeConfig } from '#imports';

import { localeState } from '../i18n/localeState';

import { toHttpError } from './HttpError';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type HttpQuery = Record<string, string | number | undefined>;

export interface HttpRequest {
  method: HttpMethod;
  body?: unknown;
  query?: HttpQuery;
}

/** Low-level transport; swapped by tests. */
export type HttpTransport = <T>(path: string, request: HttpRequest) => Promise<T>;

export interface HttpClient {
  get<T>(path: string, query?: HttpQuery): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

export function createHttpClient(transport: HttpTransport): HttpClient {
  const call = <T>(path: string, request: HttpRequest) =>
    transport<T>(path, request).catch((error: unknown) => {
      throw toHttpError(error);
    });

  return {
    get: (path, query) => call(path, query ? { method: 'GET', query } : { method: 'GET' }),
    post: (path, body) => call(path, { method: 'POST', body }),
    put: (path, body) => call(path, { method: 'PUT', body }),
    delete: (path) => call(path, { method: 'DELETE' }),
  };
}

/**
 * The portal's API is always served from the site's own origin under `/api`
 * (BVRio, Q-B1: CloudFront routes `/api/*` to core-bvrio; in development Nitro
 * serves it, or proxies it with `API_PROXY_TARGET`). Not configurable: no
 * cross-origin calls, no CORS.
 */
export const API_BASE_PATH = '/api';

/** Where a transport sends its calls: a fixed same-origin path or a runtime config key. */
export type BaseUrl = { path: string } | { config: 'mockBffBaseUrl' };

/**
 * Nuxt transport.
 *
 * - Browser: plain `$fetch` (same origin, cookies sent automatically).
 * - SSR: the request-bound fetch, which calls the App's own server routes
 *   in-process and forwards the visitor's cookies.
 *
 * On the server it must be invoked synchronously inside a Nuxt context
 * (component setup, plugin or a `useAsyncData` handler) — Services therefore
 * call the client before any `await`.
 */
export function createNuxtTransport(base: BaseUrl): HttpTransport {
  return <T>(path: string, request: HttpRequest) => {
    const fetcher = useRequestFetch();
    const baseURL = 'path' in base ? base.path : useRuntimeConfig().public[base.config];
    // Controlled vocabularies come back in the visitor's language (v0.7).
    const language = localeState().value;

    return fetcher(path, {
      baseURL,
      headers: { 'accept-language': language },
      method: request.method,
      body: request.body as Record<string, unknown> | undefined,
      query: request.query,
    }) as Promise<T>;
  };
}

/**
 * The portal's API on the same origin (`/api`): today the App's own server
 * routes over the published snapshot; core-bvrio behind CloudFront in
 * production. There is no BFF (BVRio, November 2026).
 */
export const apiClient = createHttpClient(createNuxtTransport({ path: API_BASE_PATH }));

/** DEV-only mock backend serving the demo Authentication and User Journeys. */
export const mockBffClient = createHttpClient(createNuxtTransport({ config: 'mockBffBaseUrl' }));
