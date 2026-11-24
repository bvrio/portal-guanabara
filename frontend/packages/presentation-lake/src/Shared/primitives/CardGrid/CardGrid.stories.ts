import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { CardGrid } from './index';

const meta = {
  title: 'Primitives/CardGrid',
  component: CardGrid,
  parameters: { layout: 'fullscreen' },
  args: { as: 'div', maxColumns: 3 },
  render: (args) => ({
    components: { CardGrid },
    setup: () => ({ args }),
    template: `
      <div style="padding: 24px; background: var(--color-bg-canvas)">
        <p style="font: 13px var(--font-family-sans); color: var(--color-text-muted)">1 coluna &lt; 720px · 2 colunas até 1599px · 3 colunas a partir de 1600px</p>
        <CardGrid v-bind="args">
          <div v-for="n in 6" :key="n" style="padding: 20px; border-radius: 12px; background: var(--color-surface); box-shadow: var(--shadow-card); font: 15px var(--font-family-sans)">Cartão {{ n }}</div>
        </CardGrid>
      </div>
    `,
  }),
} satisfies Meta<typeof CardGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ThreeColumns: Story = {};

export const Pair: Story = { args: { maxColumns: 2 } };
