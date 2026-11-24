import type { Meta, StoryObj } from '@storybook/vue3-vite';

import BrandMark from './BrandMark.vue';

const meta = {
  title: 'Foundations/BrandMark',
  component: BrandMark,
  args: { size: 160, label: 'Portal Guanabara' },
} satisfies Meta<typeof BrandMark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnDark: Story = {
  decorators: [() => ({ template: '<div style="padding:24px;background:var(--color-structure-bg)"><story /></div>' })],
};

export const OnLight: Story = { args: { tone: 'on-light' } };

export const Sizes: Story = {
  render: () => ({
    components: { BrandMark },
    template: `<div style="display:flex;gap:24px;align-items:end;padding:24px;background:var(--color-structure-bg)">
      <BrandMark :size="16" /><BrandMark :size="32" /><BrandMark :size="40" /><BrandMark :size="96" /><BrandMark :size="240" />
    </div>`,
  }),
};
