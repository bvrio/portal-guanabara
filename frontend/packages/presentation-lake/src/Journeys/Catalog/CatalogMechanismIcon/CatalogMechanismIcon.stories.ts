import type { Meta, StoryObj } from '@storybook/vue3-vite';

import CatalogMechanismIcon from './CatalogMechanismIcon.vue';

const meta = {
  title: 'Journeys/Catalog/CatalogMechanismIcon',
  component: CatalogMechanismIcon,
  args: { code: 'limpeza', name: 'Limpeza' },
} satisfies Meta<typeof CatalogMechanismIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The slot until the mechanism's glyph is drawn. */
export const Slot: Story = {};

export const TwoWords: Story = { args: { code: 'reciclagem-e-destinacao', name: 'Reciclagem e destinação', size: 40 } };
