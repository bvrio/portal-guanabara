import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { sampleMapBounds, sampleMapMunicipalities, sampleMapSectors } from '../fixtures';

import MapLocator from './MapLocator.vue';

const meta = {
  title: 'Journeys/Map/MapLocator',
  component: MapLocator,
  args: {
    bounds: sampleMapBounds,
    municipalities: sampleMapMunicipalities,
    sectors: sampleMapSectors,
    highlighted: ['niteroi'],
    highlightedSectors: ['interior'],
    label: 'Mapa da Baía de Guanabara com Niterói e Interior em destaque',
  },
  decorators: [() => ({ template: '<div style="max-width: 360px"><story /></div>' })],
} satisfies Meta<typeof MapLocator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default (v0.9.14): the municipalities in the Mapa's green, the sector tinted in the water. */
export const Place: Story = {};

/** On request: an initiative's municipalities in orange. */
export const Initiative: Story = { args: { tone: 'project' } };

/** On request: a study's municipalities in purple. */
export const Study: Story = { args: { tone: 'study' } };

/** Only a bay sector, no municipality. */
export const SectorOnly: Story = { args: { highlighted: [] } };
