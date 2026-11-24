import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import { Pagination } from './index';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  args: { page: 2, pageCount: 4 },
  render: (args) => ({
    components: { Pagination },
    setup: () => ({ args, page: ref(args.page) }),
    template: '<Pagination v-bind="args" :page="page" @change="page = $event" />',
  }),
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Middle: Story = {};

export const FirstPage: Story = { args: { page: 1 } };

export const Disabled: Story = { args: { disabled: true } };
