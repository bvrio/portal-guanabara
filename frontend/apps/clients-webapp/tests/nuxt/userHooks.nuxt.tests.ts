import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';

import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { createError } from 'h3';

import { useGetCommunicationPreferences, useGetUser } from '~/hooks/common/user';
import { errorCodeOf } from '~/lib/http';

registerEndpoint('/mock-bff/user/profile', () => ({
  fullName: 'Glauber Teste',
  cpf: '000.000.000-00',
  phone: '(21) 90000-0000',
  email: 'titular@teste.com',
}));
registerEndpoint('/mock-bff/user/preferences', () => {
  throw createError({ statusCode: 403, data: { code: 'FORBIDDEN' } });
});

describe('User Hooks (Nuxt runtime, demo Journey)', () => {
  it('useGetUser reads the profile through the mock backend', async () => {
    const wrapper = await mountSuspended(
      defineComponent({
        async setup() {
          const { data } = await useGetUser();
          return () => h('p', data.value?.fullName ?? '');
        },
      }),
    );
    expect(wrapper.text()).toBe('Glauber Teste');
  });

  it('keeps the error code of a denied operation', async () => {
    const wrapper = await mountSuspended(
      defineComponent({
        async setup() {
          const { error } = await useGetCommunicationPreferences();
          return () => h('p', errorCodeOf(error.value));
        },
      }),
    );
    expect(wrapper.text()).toBe('FORBIDDEN');
  });
});
