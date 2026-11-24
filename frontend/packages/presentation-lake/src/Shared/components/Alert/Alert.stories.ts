import type { Meta, StoryObj } from '@storybook/vue3-vite';

import Alert from './Alert.vue';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  args: { variant: 'info' },
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'error'] },
  },
  render: (args) => ({
    components: { Alert },
    setup: () => ({ args }),
    template: '<div style="width: 360px"><Alert v-bind="args">Your changes were saved.</Alert></div>',
  }),
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Info: Story = {};

export const Success: Story = { args: { variant: 'success' } };

export const ErrorMessage: Story = { args: { variant: 'error' } };
