import type { Meta, StoryObj } from '@storybook/vue3-vite';

import InstitutionCard from './InstitutionCard.vue';

const meta = {
  title: 'Journeys/Institutions/InstitutionCard',
  component: InstitutionCard,
  args: {
    institution: {
      code: 'uff',
      name: 'UFF',
      type: 'Acadêmica',
      entries: 11,
      projects: 3,
      studies: 8,
      roles: [
        { role: 'author', count: 8 },
        { role: 'executor', count: 2 },
        { role: 'partner', count: 1 },
      ],
    },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof InstitutionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const UnknownType: Story = {
  args: {
    institution: { code: 'cnpq', name: 'CNPq', type: null, entries: 8, projects: 0, studies: 8, roles: [{ role: 'funder', count: 8 }] },
  },
};
