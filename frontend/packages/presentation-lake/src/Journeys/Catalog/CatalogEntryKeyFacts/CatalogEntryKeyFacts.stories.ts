import type { Meta, StoryObj } from '@storybook/vue3-vite';

import CatalogEntryKeyFacts from './CatalogEntryKeyFacts.vue';

const meta = {
  title: 'Journeys/Catalog/CatalogEntryKeyFacts',
  component: CatalogEntryKeyFacts,
  args: {
    refId: 1,
    start: { date: '2021-12-01', precision: 'month' },
    end: null,
    ongoing: true,
    municipalities: ['Rio de Janeiro'],
    sectors: [{ code: 'interior', label: 'Interior' }],
  },
} satisfies Meta<typeof CatalogEntryKeyFacts>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An initiative: its period, where it acts and its workbook ID. */
export const Initiative: Story = {};

/** A study: the publication year instead of the period. */
export const Study: Story = {
  args: {
    refId: 36,
    start: null,
    ongoing: false,
    municipalities: ['São Gonçalo', 'Rio de Janeiro'],
    sectors: [
      { code: 'transicao', label: 'Transição' },
      { code: 'interior', label: 'Interior' },
    ],
    publicationYears: [2019],
  },
};

/** Long lists stop at three and say how many more. */
export const LongLists: Story = {
  args: { municipalities: ['Rio de Janeiro', 'Niterói', 'São Gonçalo', 'Magé', 'Itaboraí', 'Guapimirim'] },
};

/** Where only, side by side (the entry page's map card, v0.9.14). */
export const WhereRow: Story = {
  args: {
    municipalities: ['Niterói'],
    sectors: [{ code: 'entrada', label: 'Entrada' }],
    parts: ['municipalities', 'sectors'],
    layout: 'row',
  },
};
