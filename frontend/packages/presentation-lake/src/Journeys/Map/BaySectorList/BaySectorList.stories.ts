import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { sampleMapSectors } from '../fixtures';

import BaySectorList from './BaySectorList.vue';

const meta = {
  title: 'Journeys/Map/BaySectorList',
  component: BaySectorList,
  args: { sectors: sampleMapSectors },
} satisfies Meta<typeof BaySectorList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
