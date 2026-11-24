import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { totals } from '../../../../tests/fixtures/catalog';

import { CatalogKeyNumbers } from './index';

const meta = {
  title: 'Journeys/Catalog/CatalogKeyNumbers',
  component: CatalogKeyNumbers,
  args: { totals },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CatalogKeyNumbers>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
