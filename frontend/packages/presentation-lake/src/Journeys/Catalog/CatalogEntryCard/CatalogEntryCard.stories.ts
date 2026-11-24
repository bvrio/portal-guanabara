import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { projectEntry, studyEntry } from '../../../../tests/fixtures/catalog';

import { CatalogEntryCard } from './index';

const meta = {
  title: 'Journeys/Catalog/CatalogEntryCard',
  component: CatalogEntryCard,
  args: { entry: projectEntry, headingLevel: 2 },
  decorators: [() => ({ template: '<div style="width: min(720px, 90vw)"><story /></div>' })],
} satisfies Meta<typeof CatalogEntryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Initiative: Story = {};

export const Study: Story = { args: { entry: studyEntry } };

export const UnknownPeriod: Story = {
  args: { entry: { ...projectEntry, start: null, end: null, ongoing: false, status: null, municipalities: [] } },
};
