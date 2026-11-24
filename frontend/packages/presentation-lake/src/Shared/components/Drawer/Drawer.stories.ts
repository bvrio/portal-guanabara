import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import { Button } from '../Button';

import { Drawer } from './index';

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: { layout: 'padded' },
  args: { open: false, width: '34rem' },
  render: (args) => ({
    components: { Drawer, Button },
    setup: () => ({ args, open: ref(true) }),
    template: `
      <Button @click="open = true">Abrir painel</Button>
      <Drawer v-model:open="open" :width="args.width">
        <template #title>Rio de Janeiro</template>
        <p v-for="n in 12" :key="n" style="font: 15px var(--font-family-sans)">Entrada {{ n }}</p>
        <template #footer><Button href="#">Abrir no Catálogo</Button></template>
      </Drawer>
    `,
  }),
} satisfies Meta<typeof Drawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
