import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { partyGroups } from '../../../../tests/fixtures/catalog';

import { CatalogEntryParties } from './index';

const meta = {
  title: 'Journeys/Catalog/CatalogEntryParties',
  component: CatalogEntryParties,
  args: { groups: partyGroups, personsHidden: false },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CatalogEntryParties>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithPersonNames: Story = {};

export const PersonNamesHidden: Story = {
  args: { groups: partyGroups.filter((group) => group.role !== 'coordinator'), personsHidden: true },
};
