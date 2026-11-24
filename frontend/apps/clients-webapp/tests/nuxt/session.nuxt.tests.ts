import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';

import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';

import { refreshSession, useGetSession } from '~/shared/hooks/session';

let session: unknown = { authenticated: true, fullName: 'Bruno Titular' };
registerEndpoint('/mock-bff/authentication/session', () => session);

const Probe = defineComponent({
  setup() {
    const { account } = useGetSession();
    return () => h('p', account.value ? `${account.value.initials}|${account.value.name}` : 'anonymous');
  },
});

describe('Session (Nuxt runtime): the header account entry', () => {
  it('gives the signed-in visitor’s initials, and nothing once signed out', async () => {
    const wrapper = await mountSuspended(Probe);
    await vi.waitFor(() => expect(wrapper.text()).toBe('BT|Bruno Titular'));

    session = { authenticated: false };
    await refreshSession();
    await vi.waitFor(() => expect(wrapper.text()).toBe('anonymous'));
  });
});
