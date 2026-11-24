import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { Icon } from '../../foundations';
import { Button } from '../Button';

import { PageHero } from './index';

const meta = {
  title: 'Components/PageHero',
  component: PageHero,
  parameters: { layout: 'fullscreen' },
  args: { size: 'lg', overlap: false },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] }, overlap: { control: 'boolean' } },
  render: (args) => ({
    components: { PageHero, Button, Icon },
    setup: () => ({ args }),
    template: `
      <PageHero v-bind="args">
        <template #eyebrow>Catálogo da Baía de Guanabara</template>
        <template #title>Quem estuda e quem age pela baía, em um só lugar</template>
        <template #description>41 entradas mapeadas: iniciativas em campo e estudos científicos, com território, instituições e fontes.</template>
        <template #actions><Button size="lg">Explorar o catálogo</Button></template>
        <template #aside>
          <div style="color: var(--color-structure-text-muted); --icon-tint: var(--color-agua-300); --icon-tint-opacity: .3">
            <Icon name="bay" size="xl" style="width: 220px; height: 220px; --icon-stroke-width: 1; --icon-detail-width: .6" />
          </div>
        </template>
      </PageHero>
    `,
  }),
} satisfies Meta<typeof PageHero>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Large: Story = {};

export const Small: Story = { args: { size: 'sm' } };
