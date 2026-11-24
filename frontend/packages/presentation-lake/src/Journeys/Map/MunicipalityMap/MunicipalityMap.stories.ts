import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { sampleMapBounds, sampleMapMunicipalities, sampleMapSectors } from '../fixtures';

import MunicipalityMap from './MunicipalityMap.vue';

const meta = {
  title: 'Journeys/Map/MunicipalityMap',
  component: MunicipalityMap,
  args: { bounds: sampleMapBounds, municipalities: sampleMapMunicipalities },
} satisfies Meta<typeof MunicipalityMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Highlighted: Story = { args: { highlighted: 'niteroi' } };

/** v0.8: bay sectors as dashed zones in the water, with their name and markers. */
export const WithSectors: Story = { args: { sectors: sampleMapSectors, highlightedSector: 'interior' } };
