import type { Meta, StoryObj } from '@storybook/vue3-vite';

import FormattedMessage from '../../foundations/i18n/FormattedMessage.vue';

import Button from './Button.vue';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    variant: 'primary',
    size: 'md',
    fullWidth: false,
    loading: false,
    disabled: false,
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
  },
  render: (args) => ({
    components: { Button },
    setup: () => ({ args }),
    template: '<Button v-bind="args">Continue</Button>',
  }),
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Ghost: Story = { args: { variant: 'ghost' } };

export const Loading: Story = { args: { loading: true } };

export const DynamicMessage: Story = {
  render: (args) => ({
    components: { Button, FormattedMessage },
    setup: () => ({
      args,
      greeting: {
        id: 'storybook.button.greeting',
        defaultMessage: 'Continue as {name}',
      },
    }),
    template: `
      <Button v-bind="args">
        <FormattedMessage v-bind="greeting" :values="{ name: 'Glauber' }" />
      </Button>
    `,
  }),
};
