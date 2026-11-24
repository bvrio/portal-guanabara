import type { Meta, StoryObj } from '@storybook/vue3-vite';

import AboutWorkInProgress from './AboutWorkInProgress.vue';

const meta = {
  title: 'Journeys/About/AboutWorkInProgress',
  component: AboutWorkInProgress,
  render: (args) => ({
    components: { AboutWorkInProgress },
    setup: () => ({ args }),
    template: '<AboutWorkInProgress v-bind="args">Fotos e textos chegam em breve.</AboutWorkInProgress>',
  }),
} satisfies Meta<typeof AboutWorkInProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
