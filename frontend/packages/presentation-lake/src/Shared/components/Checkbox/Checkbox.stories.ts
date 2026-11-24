import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import Checkbox from './Checkbox.vue';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { id: 'storybook-checkbox', label: 'Receive news by e-mail', disabled: false },
  render: (args) => ({
    components: { Checkbox },
    setup: () => ({ args, checked: ref(true) }),
    template: '<Checkbox v-bind="args" v-model="checked" />',
  }),
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };
