import type { Meta, StoryObj } from '@storybook/vue3-vite';

import MapKindCounts from './MapKindCounts.vue';

const meta = {
  title: 'Journeys/Map/MapKindCounts',
  component: MapKindCounts,
  args: { projects: 12, studies: 10 },
} satisfies Meta<typeof MapKindCounts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Both: Story = {};

export const StudiesOnly: Story = { args: { projects: 0, studies: 1 } };
