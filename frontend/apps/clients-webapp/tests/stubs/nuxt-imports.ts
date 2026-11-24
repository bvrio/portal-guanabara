/**
 * Minimal stand-ins for Nuxt's `#imports` so framework-independent units
 * (Services, lib) can be unit-tested with plain Vitest. Tests inject their own
 * transports/fakes; these stubs only need to exist.
 */
export function useRuntimeConfig() {
  return {
    public: { appName: 'clients-webapp', mockBffBaseUrl: '/mock-bff', featureFlags: {} },
  };
}

export function useRequestFetch() {
  return () => Promise.reject(new Error('useRequestFetch is not available in unit tests'));
}

export function useAsyncData() {
  throw new Error('useAsyncData is not available in unit tests — use @nuxt/test-utils');
}

export function navigateTo() {
  return Promise.resolve();
}

const state = new Map<string, { value: unknown }>();

export function useState<T>(key: string, init?: () => T) {
  if (!state.has(key)) state.set(key, { value: init?.() });
  return state.get(key) as { value: T };
}

export function useCookie<T>(_name?: string) {
  return { value: undefined as T | undefined };
}
