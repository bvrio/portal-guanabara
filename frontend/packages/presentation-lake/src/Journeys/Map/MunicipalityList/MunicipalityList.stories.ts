import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { sampleMapMunicipalities } from '../fixtures';

import MunicipalityList from './MunicipalityList.vue';

const meta = {
  title: 'Journeys/Map/MunicipalityList',
  component: MunicipalityList,
  args: { municipalities: sampleMapMunicipalities },
} satisfies Meta<typeof MunicipalityList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Horizontal variation (v0.9.8): tiles side by side, as under the map on the Mapa. */
export const Grid: Story = { args: { layout: 'grid' } };
