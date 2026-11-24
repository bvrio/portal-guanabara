import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { Icon, iconGroups } from './index';

const groupTitles: Record<keyof typeof iconGroups, string> = {
  kind: 'Dupla: ação em campo × pesquisa',
  sector: 'Setores da baía',
  topic: 'Palavras-chave',
  mechanism: 'Mecanismos de atuação',
  ui: 'Interface',
};

const meta = {
  title: 'Foundations/Icons',
  component: Icon,
  args: { name: 'kind-study', size: 'xl' },
  argTypes: {
    name: { control: 'select', options: Object.values(iconGroups).flat() },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    label: { control: 'text' },
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => ({
    components: { Icon },
    setup: () => ({ args }),
    template: '<div style="color: var(--color-structure-bg); --icon-accent: var(--color-agua-500)"><Icon v-bind="args" /></div>',
  }),
};

export const Gallery: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Icon },
    setup: () => ({ groups: Object.entries(iconGroups).map(([key, names]) => ({ title: groupTitles[key as keyof typeof iconGroups], names })) }),
    template: `
      <div style="display: grid; gap: 28px; padding: 24px; background: var(--color-bg-canvas); font-family: var(--font-family-sans)">
        <section v-for="group in groups" :key="group.title" style="display: grid; gap: 12px">
          <h3 style="margin: 0; font-size: 14px; color: var(--color-text-heading)">{{ group.title }}</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: 10px">
            <figure
              v-for="name in group.names"
              :key="name"
              style="margin: 0; display: grid; justify-items: center; gap: 10px; padding: 16px 8px 10px; border-radius: 12px; background: var(--color-surface); box-shadow: var(--shadow-card); color: var(--color-structure-bg); --icon-accent: var(--color-comlurb-300); --icon-accent-opacity: 1; --icon-secondary: var(--color-pesquisa-200); --icon-secondary-opacity: 1"
            >
              <div style="display: flex; align-items: end; gap: 10px">
                <Icon :name="name" size="xl" />
                <Icon :name="name" size="md" />
                <Icon :name="name" size="xs" />
              </div>
              <figcaption style="font-size: 11px; color: var(--color-text-muted); text-align: center">{{ name }}</figcaption>
            </figure>
          </div>
        </section>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { Icon },
    template: `
      <div style="display: flex; align-items: end; gap: 16px; color: var(--color-structure-bg); --icon-accent: var(--color-agua-500)">
        <Icon v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size" name="sector-transition" :size="size" />
      </div>
    `,
  }),
};

export const Anatomy: Story = {
  render: () => ({
    components: { Icon },
    template: `
      <div style="display: grid; grid-template-columns: repeat(4, auto); gap: 24px; font: 12px var(--font-family-sans); color: var(--color-text-secondary); text-align: center">
        <div style="color: var(--color-structure-bg); --icon-tint-opacity: 0; --icon-accent-opacity: 0"><Icon name="kind-project" size="xl" /><div>linha 1,75</div></div>
        <div style="color: var(--color-structure-bg); --icon-accent-opacity: 0"><Icon name="kind-project" size="xl" /><div>+ preenchimento 18%</div></div>
        <div style="color: var(--color-structure-bg); --icon-accent: var(--color-agua-500)"><Icon name="kind-project" size="xl" /><div>+ destaque</div></div>
        <div style="color: var(--color-kind-project-ink); --icon-accent: var(--color-kind-project); --icon-accent-opacity: 1; --icon-tint: var(--color-kind-project); --icon-tint-opacity: .35"><Icon name="kind-project" size="xl" /><div>na cor de significado</div></div>
      </div>
    `,
  }),
};
