import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import { filterOptions } from '../../../../tests/fixtures/catalog';

import { CatalogFilters, emptyCatalogFilters } from './index';

const meta = {
  title: 'Journeys/Catalog/CatalogFilters',
  component: CatalogFilters,
  args: { options: filterOptions, busy: false, modelValue: emptyCatalogFilters(), today: '2026-11' },
  parameters: { layout: 'padded' },
  render: (args) => ({
    components: { CatalogFilters },
    setup: () => {
      const filters = ref(emptyCatalogFilters());
      const submitted = ref(0);
      return { args, filters, submitted, clear: () => (filters.value = emptyCatalogFilters()) };
    },
    template: `
      <CatalogFilters :options="args.options" :busy="args.busy" :today="args.today" v-model="filters" @submit="submitted++" @clear="clear">
        <template #summary><b>41 entradas</b> · Iniciativas em campo e estudos sobre resíduos na Baía de Guanabara.</template>
      </CatalogFilters>
      <pre style="margin-top: 16px; font-size: 12px">submits: {{ submitted }}\n{{ filters }}</pre>
    `,
  }),
} satisfies Meta<typeof CatalogFilters>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Busy: Story = { args: { busy: true } };
