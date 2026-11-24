import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { BarList } from './index';

const keywords = [
  { id: 'macrolixo', label: 'Macrolixo', value: 28, href: '#macrolixo' },
  { id: 'estuario', label: 'Estuário', value: 13, href: '#estuario' },
  { id: 'microplastico', label: 'Microplástico', value: 12, href: '#microplastico' },
  { id: 'pesca-artesanal', label: 'Pesca artesanal', value: 8, href: '#pesca-artesanal' },
  { id: 'litoral', label: 'Litoral', value: 7, href: '#litoral' },
  { id: 'fauna', label: 'Fauna', value: 6, href: '#fauna' },
];

const meta = {
  title: 'Components/BarList',
  component: BarList,
  args: { items: keywords },
  decorators: [() => ({ template: '<div style="width: min(560px, 90vw)"><story /></div>' })],
} satisfies Meta<typeof BarList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ranked: Story = {};

export const WithoutLinks: Story = {
  args: { items: keywords.map(({ href: _href, ...item }) => item) },
};

export const SharedScale: Story = {
  args: { items: keywords.slice(3), max: 28 },
};

/** One colour for the whole chart, e.g. a chart that only counts initiatives. */
export const Coloured: Story = {
  args: { items: keywords.slice(0, 4), color: 'var(--color-kind-project)' },
};

/** Split bars (v0.8): the parts add up to the value; the legend lives with the chart. */
export const Split: Story = {
  args: {
    items: [
      { id: 'macrolixo', label: 'Macrolixo', value: 28, href: '#', split: [20, 8] },
      { id: 'estuario', label: 'Estuário', value: 13, href: '#', split: [4, 9] },
      { id: 'microplastico', label: 'Microplástico', value: 12, href: '#', split: [1, 11] },
      { id: 'fauna', label: 'Fauna', value: 6, href: '#', split: [6, 0] },
    ].map(({ split: [projects, studies], ...item }) => ({
      ...item,
      segments: [
        { value: projects!, color: 'var(--color-kind-project)', label: `${projects} iniciativas` },
        { value: studies!, color: 'var(--color-kind-study)', label: `${studies} estudos` },
      ],
    })),
  },
};

export const Empty: Story = {
  args: { items: [] },
  render: (args) => ({
    components: { BarList },
    setup: () => ({ args }),
    template: '<BarList v-bind="args"><template #empty>Nenhuma entrada com esta informação.</template></BarList>',
  }),
};
