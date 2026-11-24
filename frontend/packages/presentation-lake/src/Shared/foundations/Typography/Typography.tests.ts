import { screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { defineMessages } from '../i18n';

import Typography from './Typography.vue';

const messages = defineMessages({
  greeting: {
    id: 'test.typography.greeting',
    defaultMessage: 'Hello, {name}',
  },
});

describe('Typography', () => {
  it('renders slot content with the requested element', () => {
    renderWithIntl(Typography, {
      props: { as: 'h2', variant: 'title' },
      slots: { default: 'Test heading' },
    });

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('renders a message descriptor with dynamic values', () => {
    renderWithIntl(Typography, {
      props: { message: messages.greeting, values: { name: 'Test User' } },
      descriptors: [messages.greeting],
    });

    expect(screen.getByText('Hello, Test User')).toBeInTheDocument();
  });
});
