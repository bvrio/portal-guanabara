import { render, type RenderOptions } from '@testing-library/vue';
import type { Component } from 'vue';
import { createIntl } from 'vue-intl';

import type { MessageDescriptor } from '../src/Shared/foundations/i18n';

interface RenderWithIntlOptions<C> extends RenderOptions<C> {
  locale?: string;
  descriptors?: MessageDescriptor[];
}

/**
 * Renders a component inside a vue-intl context.
 *
 * The local test catalog is derived from component default messages only,
 * keeping tests deterministic and free of missing-translation noise.
 * Production catalogs remain owned by the application.
 */
export function renderWithIntl<C extends Component>(
  component: C,
  {
    locale = 'en',
    descriptors = [],
    global,
    ...options
  }: RenderWithIntlOptions<C> = {},
) {
  const messages = Object.fromEntries(
    descriptors.map(({ id, defaultMessage }) => [id, defaultMessage as string]),
  );

  return render(component, {
    ...options,
    global: {
      ...global,
      plugins: [
        ...(global?.plugins ?? []),
        createIntl({ locale, defaultLocale: locale, messages }),
      ],
    },
  });
}
