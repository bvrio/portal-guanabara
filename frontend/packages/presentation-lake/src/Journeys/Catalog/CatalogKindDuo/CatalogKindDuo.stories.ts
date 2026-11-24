import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { totals } from '../../../../tests/fixtures/catalog';

import { CatalogKindDuo } from './index';

const meta = {
  title: 'Journeys/Catalog/CatalogKindDuo',
  component: CatalogKindDuo,
  parameters: { layout: 'padded' },
  args: {
    projects: { count: totals.projects, active: totals.activeProjects, href: '#iniciativas' },
    studies: { count: totals.studies, href: '#estudos' },
  },
} satisfies Meta<typeof CatalogKindDuo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
