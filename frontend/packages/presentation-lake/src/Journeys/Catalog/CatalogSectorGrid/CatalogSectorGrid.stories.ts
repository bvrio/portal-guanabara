import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { sectorVocabulary } from '../../../../tests/fixtures/catalog';

import { CatalogSectorGrid } from './index';

const meta = {
  title: 'Journeys/Catalog/CatalogSectorGrid',
  component: CatalogSectorGrid,
  parameters: { layout: 'padded' },
  args: {
    items: sectorVocabulary.map((sector) => ({ ...sector, href: `#${sector.code}` })),
    unknownCount: 13,
  },
} satisfies Meta<typeof CatalogSectorGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
