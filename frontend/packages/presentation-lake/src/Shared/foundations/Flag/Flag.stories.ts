import type { Meta, StoryObj } from '@storybook/vue3-vite';

import Flag from './Flag.vue';

const meta = {
  title: 'Foundations/Flag',
  component: Flag,
  args: { country: 'br', size: 40 },
} satisfies Meta<typeof Flag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Brazil: Story = {};

/** The four languages of the site: Português, English, Español, Français. */
export const All: Story = {
  render: () => ({
    components: { Flag },
    template: `<div style="display:flex;gap:16px;align-items:center;padding:16px">
      <Flag country="br" :size="40" /><Flag country="gb" :size="40" /><Flag country="es" :size="40" /><Flag country="fr" :size="40" />
    </div>`,
  }),
};
