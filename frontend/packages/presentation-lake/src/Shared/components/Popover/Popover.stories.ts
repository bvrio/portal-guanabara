import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import { Popover } from './index';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  parameters: { layout: 'padded' },
  args: { anchor: null, open: false },
  render: () => ({
    components: { Popover },
    setup: () => ({ open: ref(false), trigger: ref<HTMLElement | null>(null) }),
    template: `
      <button ref="trigger" @click="open = !open" style="padding: 8px 14px; border-radius: 999px; border: 1px solid var(--color-border-strong); background: var(--color-surface); font: 14px var(--font-family-sans)">Período ▾</button>
      <Popover v-model:open="open" :anchor="trigger" label="Período">
        <div style="padding: 16px; font: 14px var(--font-family-sans)">Conteúdo do painel. Esc ou um clique fora fecham; em telas pequenas vira uma folha inferior.</div>
      </Popover>
    `,
  }),
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
