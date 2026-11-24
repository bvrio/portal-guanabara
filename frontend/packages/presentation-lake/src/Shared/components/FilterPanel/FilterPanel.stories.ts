import type { Meta, StoryObj } from '@storybook/vue3-vite';

import Pagination from '../Pagination/Pagination.vue';

import FilterPanel from './FilterPanel.vue';

const meta = {
  title: 'Shared/Components/FilterPanel',
  component: FilterPanel,
  render: (args) => ({
    components: { FilterPanel, Pagination },
    setup: () => ({ args }),
    template: `<div style="height:1400px;padding:16px">
      <FilterPanel v-bind="args">
        <div style="display:flex;gap:8px"><input placeholder="Buscar" style="flex:1;height:40px" /><button>Buscar</button></div>
        <template #summary><b>41 entradas</b> · Iniciativas em campo e estudos sobre resíduos na Baía de Guanabara.</template>
        <template #actions><Pagination :page="1" :page-count="4" /></template>
      </FilterPanel>
      <p style="margin-top:24px">Scroll: the panel stays at the top (≥ 720px).</p>
    </div>`,
  }),
} satisfies Meta<typeof FilterPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
