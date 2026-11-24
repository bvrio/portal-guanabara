import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { DescriptionList, DescriptionListItem } from './index';

const meta = {
  title: 'Components/DescriptionList',
  component: DescriptionList,
  args: { layout: 'columns' },
  argTypes: { layout: { control: 'select', options: ['columns', 'stacked'] } },
  render: (args) => ({
    components: { DescriptionList, DescriptionListItem },
    setup: () => ({ args }),
    template: `
      <div style="width: min(720px, 90vw)">
        <DescriptionList v-bind="args">
          <DescriptionListItem term="Período">dezembro de 2021 – em curso</DescriptionListItem>
          <DescriptionListItem term="Periodicidade">Contínua</DescriptionListItem>
          <DescriptionListItem term="Municípios">Rio de Janeiro, Niterói</DescriptionListItem>
          <DescriptionListItem term="Mecanismos de atuação">Transacional, Limpeza</DescriptionListItem>
        </DescriptionList>
      </div>
    `,
  }),
} satisfies Meta<typeof DescriptionList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Columns: Story = {};

export const Stacked: Story = { args: { layout: 'stacked' } };
