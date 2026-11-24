import type { Meta, StoryObj } from '@storybook/vue3-vite';

import FormattedMessage from '../../foundations/i18n/FormattedMessage.vue';
import { Button } from '../Button';

import { Card } from './index';

const meta = {
  title: 'Components/Card',
  component: Card,
  args: {
    variant: 'primary',
    size: 'md',
    fullWidth: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    fullWidth: {
      control: 'boolean',
    },
  },
  render: (args) => ({
    components: { Card, CardRow: Card.Row, CardCell: Card.Cell, Button },
    setup: () => ({ args }),
    template: `
      <Card v-bind="args">
        <CardRow :columns="[2, 1]" gap="md" align="center">
          <CardCell>
            <h3>Account overview</h3>
            <p>Review the details associated with your account.</p>
          </CardCell>
          <CardCell>
            <Button>Manage account</Button>
          </CardCell>
        </CardRow>

        <CardRow :columns="['1fr', '2fr', 'auto']" gap="md" align="center">
          <CardCell><strong>Status</strong></CardCell>
          <CardCell><span>Active</span></CardCell>
          <CardCell><Button variant="secondary">View</Button></CardCell>
        </CardRow>
      </Card>
    `,
  }),
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Ghost: Story = { args: { variant: 'ghost' } };

export const Small: Story = { args: { size: 'sm' } };

export const Large: Story = { args: { size: 'lg' } };

export const FullWidth: Story = { args: { fullWidth: true } };

export const DynamicMessage: Story = {
  render: (args) => ({
    components: { Card, CardRow: Card.Row, CardCell: Card.Cell, Button, FormattedMessage },
    setup: () => ({
      args,
      greeting: {
        id: 'storybook.card.greeting',
        defaultMessage: 'Welcome back, {name}',
      },
    }),
    template: `
      <Card v-bind="args">
        <CardRow :columns="['minmax(0, 1fr)', 'auto']" gap="md" align="center">
          <CardCell>
            <FormattedMessage v-bind="greeting" :values="{ name: 'Glauber' }" />
          </CardCell>
          <CardCell><Button>Continue</Button></CardCell>
        </CardRow>
      </Card>
    `,
  }),
};
