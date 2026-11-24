import { type Component, defineComponent, h } from 'vue';

import type { LocaleMessages } from '~/lib/i18n';
import { IntlProvider, LinkProvider } from '~/providers';

/** Wraps a Page in the App providers (vue-intl + NuxtLink), as app.vue does. */
export function withProviders(component: Component, intl: { locale?: string; messages?: LocaleMessages } = {}) {
  return defineComponent({
    name: 'WithProviders',
    setup: () => () =>
      h(IntlProvider, { locale: intl.locale, messages: intl.messages }, {
        default: () => h(LinkProvider, null, { default: () => h(component) }),
      }),
  });
}
