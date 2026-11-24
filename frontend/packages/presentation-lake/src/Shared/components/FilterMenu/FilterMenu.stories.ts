import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import FilterMenu from './FilterMenu.vue';

const meta = {
  title: 'Shared/Components/FilterMenu',
  component: FilterMenu,
  args: {
    name: 'institution',
    label: 'Instituição',
    allLabel: 'Todas as instituições',
    modelValue: '',
    options: [
      { value: 'uff', label: 'UFF', count: 11 },
      { value: 'cnpq', label: 'CNPq', count: 8 },
      { value: 'inea', label: 'INEA', count: 5 },
      { value: 'prefeitura-de-niteroi', label: 'Prefeitura de Niterói', count: 3 },
    ],
  },
  render: (args) => ({
    components: { FilterMenu },
    setup: () => ({ args, value: ref(args.modelValue) }),
    template: '<FilterMenu v-bind="args" v-model="value" />',
  }),
} satisfies Meta<typeof FilterMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Searchable: Story = { args: { searchable: true } };
