import type { Meta, StoryObj } from '@storybook/vue3-vite';

import AboutPersonCard from './AboutPersonCard.vue';

const meta = {
  title: 'Journeys/About/AboutPersonCard',
  component: AboutPersonCard,
  render: (args) => ({
    components: { AboutPersonCard },
    setup: () => ({ args }),
    template: `<div style="max-width: 280px"><AboutPersonCard v-bind="args">
      Uma frase sobre o que a pessoa faz no projeto.
      <template #name>Nome da pessoa</template>
      <template #role>Papel no projeto</template>
      <template #area>Área principal: Engenharia de Software</template>
    </AboutPersonCard></div>`,
  }),
} satisfies Meta<typeof AboutPersonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PhotoPending: Story = {};
