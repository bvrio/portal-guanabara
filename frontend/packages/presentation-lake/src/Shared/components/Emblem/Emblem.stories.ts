import type { Meta, StoryObj } from '@storybook/vue3-vite';

import Emblem from './Emblem.vue';

const meta = {
  title: 'Shared/Components/Emblem',
  component: Emblem,
  args: { name: 'Prefeitura de Niterói', size: 48 },
} satisfies Meta<typeof Emblem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Monogram: Story = {};
export const Monograms: Story = {
  render: () => ({
    components: { Emblem },
    template: `<div style="display:flex;gap:12px;align-items:center">
      <Emblem name="UFF" :size="56" /><Emblem name="CNPq" :size="56" /><Emblem name="Petrobras" :size="56" />
      <Emblem name="Prefeitura de Niterói" :size="56" /><Emblem name="INEA" :size="32" /><Emblem name="UFRJ" :size="24" />
    </div>`,
  }),
};
