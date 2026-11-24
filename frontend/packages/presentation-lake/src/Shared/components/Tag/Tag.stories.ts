import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { Tag } from './index';

const meta = {
  title: 'Components/Tag',
  component: Tag,
  args: { variant: 'neutral', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: ['neutral', 'outline', 'strong'] },
    size: { control: 'select', options: ['sm', 'md'] },
    href: { control: 'text' },
  },
  render: (args) => ({
    components: { Tag },
    setup: () => ({ args }),
    template: '<Tag v-bind="args">Macrolixo</Tag>',
  }),
} satisfies Meta<typeof Tag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};

export const Outline: Story = { args: { variant: 'outline' } };

export const Strong: Story = { args: { variant: 'strong' } };

export const Small: Story = { args: { size: 'sm' } };

export const AsLink: Story = { args: { href: '#macrolixo', variant: 'outline' } };

export const Group: Story = {
  render: () => ({
    components: { Tag },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; max-width: 360px">
        <Tag variant="strong" size="sm">Iniciativa</Tag>
        <Tag variant="outline" size="sm">Ativa</Tag>
        <Tag href="#">Macrolixo</Tag>
        <Tag href="#">Manguezal</Tag>
        <Tag href="#">Pesca artesanal</Tag>
      </div>
    `,
  }),
};
