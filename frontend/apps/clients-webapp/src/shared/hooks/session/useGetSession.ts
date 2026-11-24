import { computed } from 'vue';

import { refreshNuxtData, useAsyncData } from '#imports';

import { sessionService } from '~/shared/services/session';

import { initialsOf, SESSION_KEY } from './session';

/**
 * Who is signed in, for the site header's account entry (v0.8): `account` is
 * null for anonymous visitors — and also when the demo backend is off, so the
 * header shows “Entrar” instead of failing.
 */
export function useGetSession() {
  const { data } = useAsyncData(SESSION_KEY, () => sessionService.getSession().catch(() => null), { default: () => null });

  const account = computed(() =>
    data.value?.authenticated ? { name: data.value.fullName, initials: initialsOf(data.value.fullName) } : null,
  );

  return { account };
}

/** Re-reads the session after signing in or out (the header stays mounted). */
export function refreshSession() {
  return refreshNuxtData(SESSION_KEY);
}
