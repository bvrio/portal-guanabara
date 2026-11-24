import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import { defineMessages } from '../../foundations/i18n';
import { Button } from '../Button';

import { GuidedTour, type GuidedTourStep } from './index';

const copy = defineMessages({
  menuTitle: { id: 'stories.guidedTour.menuTitle', defaultMessage: 'Cinco abas para explorar' },
  menuBody: { id: 'stories.guidedTour.menuBody', defaultMessage: 'Cada aba mostra o catálogo de um jeito.' },
  cardsTitle: { id: 'stories.guidedTour.cardsTitle', defaultMessage: 'Quatro portas para o catálogo' },
  cardsBody: { id: 'stories.guidedTour.cardsBody', defaultMessage: 'Clique em um cartão para ver o que ele conta.' },
  panelTitle: { id: 'stories.guidedTour.panelTitle', defaultMessage: 'As entradas, ao lado' },
  panelBody: { id: 'stories.guidedTour.panelBody', defaultMessage: 'Este painel só aparece quando o passo chega.' },
});

const steps: GuidedTourStep[] = [
  { id: 'menu', target: '[data-story-menu]', icon: 'list', title: copy.menuTitle, body: copy.menuBody },
  { id: 'cards', target: '[data-story-cards]', icon: 'catalog', title: copy.cardsTitle, body: copy.cardsBody },
  // Brought in on `step`, like the drawer on Início or the Mapa page.
  { id: 'panel', target: '[data-story-panel]', appears: true, icon: 'list', title: copy.panelTitle, body: copy.panelBody },
];

const box = 'padding: 16px; border: 1px solid var(--color-border); border-radius: 12px; font: 15px var(--font-family-sans)';

const meta = {
  title: 'Components/GuidedTour',
  component: GuidedTour,
  parameters: { layout: 'padded' },
  args: { open: false, steps },
  render: (args) => ({
    components: { GuidedTour, Button },
    setup: () => {
      const open = ref(false);
      const panel = ref(false);
      return { args, open, panel, box, onStep: (_: number, id: string) => (panel.value = id === 'panel') };
    },
    template: `
      <div style="display: grid; gap: 24px; max-width: 48rem">
        <nav data-story-menu :style="box">Início · Catálogo · Instituições · Mapa · Sobre nós</nav>
        <Button @click="open = true">Começar o tour</Button>
        <div data-story-cards style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
          <div :style="box">Iniciativas · 24</div><div :style="box">Estudos · 17</div>
        </div>
        <aside v-if="panel" data-story-panel :style="box">Painel trazido pelo passo</aside>
      </div>
      <GuidedTour v-model:open="open" :steps="args.steps" @step="onStep" />
    `,
  }),
} satisfies Meta<typeof GuidedTour>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
