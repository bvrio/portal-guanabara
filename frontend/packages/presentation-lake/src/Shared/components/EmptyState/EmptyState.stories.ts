import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { Button } from '../Button';

import { EmptyState } from './index';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  args: { headingLevel: 2 },
  render: (args) => ({
    components: { EmptyState, Button },
    setup: () => ({ args }),
    template: `
      <div style="width: min(640px, 90vw)">
        <EmptyState v-bind="args">
          <template #title>Nenhuma entrada encontrada</template>
          Nenhuma iniciativa ou estudo corresponde aos filtros escolhidos.
          <template #actions><Button variant="secondary">Limpar filtros</Button></template>
        </EmptyState>
      </div>
    `,
  }),
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NoResults: Story = {};
