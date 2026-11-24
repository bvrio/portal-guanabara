import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { CatalogEntryHeader } from './index';

const meta = {
  title: 'Journeys/Catalog/CatalogEntryHeader',
  component: CatalogEntryHeader,
  args: {
    refId: 36,
    kind: 'study',
    status: null,
    name: 'Microplastic in the sediments of a highly eutrophic tropical estuary (Marine Pollution Bulletin)',
    start: { date: '2017-03-01', precision: 'month' },
    end: { date: '2017-12-01', precision: 'month' },
    ongoing: false,
    publicationYears: [2019],
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CatalogEntryHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Study: Story = {};

export const OngoingInitiative: Story = {
  args: {
    refId: 1,
    kind: 'project',
    status: 'active',
    name: 'Pescando Resíduos',
    start: { date: '2021-12-01', precision: 'month' },
    end: null,
    ongoing: true,
    publicationYears: undefined,
  },
};

export const WithoutPhoto: Story = { args: { withoutPhoto: true } };
