import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { StatCard } from './index';

const meta = {
  title: 'Components/StatCard',
  component: StatCard,
  args: { value: 41, label: 'Entradas no catálogo' },
  argTypes: { value: { control: 'number' }, label: { control: 'text' }, hint: { control: 'text' } },
} satisfies Meta<typeof StatCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHint: Story = { args: { value: 24, label: 'Iniciativas', hint: '10 ativas' } };

export const LargeNumber: Story = { args: { value: 128450, label: 'Itens registrados' } };

export const Row: Story = {
  render: () => ({
    components: { StatCard },
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, 200px); gap: 16px">
        <StatCard :value="41" label="Entradas" />
        <StatCard :value="24" label="Iniciativas" hint="10 ativas" />
        <StatCard :value="17" label="Estudos" />
      </div>
    `,
  }),
};
