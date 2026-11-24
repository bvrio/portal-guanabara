import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { keywordBuckets } from '../../../../tests/fixtures/catalog';

import { CatalogDistribution } from './index';

const meta = {
  title: 'Journeys/Catalog/CatalogDistribution',
  component: CatalogDistribution,
  args: { items: keywordBuckets, limit: 8, unknownCount: 0 },
  render: (args) => ({
    components: { CatalogDistribution },
    setup: () => ({ args }),
    template: `
      <div style="width: min(520px, 90vw)">
        <CatalogDistribution v-bind="args">
          <template #title>Palavras-chave</template>
          <template #description>Entradas por palavra-chave</template>
        </CatalogDistribution>
      </div>
    `,
  }),
} satisfies Meta<typeof CatalogDistribution>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Keywords: Story = {};

export const WithUnknowns: Story = {
  args: {
    items: [
      { id: 'interior', label: 'Interior', value: 13 },
      { id: 'entrada', label: 'Entrada', value: 10 },
      { id: 'baia-inteira', label: 'Baía inteira', value: 8 },
      { id: 'fora-da-baia', label: 'Fora da Baía', value: 3 },
      { id: 'transicao', label: 'Transição', value: 1 },
    ],
    unknownCount: 13,
  },
};

export const Empty: Story = { args: { items: [] } };
