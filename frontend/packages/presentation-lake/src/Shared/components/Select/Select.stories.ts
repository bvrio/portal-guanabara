import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import { Select } from './index';

const meta = {
  title: 'Components/Select',
  component: Select,
  args: {
    name: 'municipality',
    label: 'Município',
    placeholder: 'Todos',
    options: [
      { value: 'rio-de-janeiro', label: 'Rio de Janeiro (22)' },
      { value: 'niteroi', label: 'Niterói (11)' },
      { value: 'sao-goncalo', label: 'São Gonçalo (11)' },
      { value: 'mage', label: 'Magé (9)' },
    ],
  },
  render: (args) => ({
    components: { Select },
    setup: () => ({ args, value: ref('') }),
    template: '<Select v-bind="args" v-model="value" /><p style="margin-top: 12px">Selecionado: {{ value || "—" }}</p>',
  }),
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };

export const FullWidth: Story = { args: { fullWidth: true } };
