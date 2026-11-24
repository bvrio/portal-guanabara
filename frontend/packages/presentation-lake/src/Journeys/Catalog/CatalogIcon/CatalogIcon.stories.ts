import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { keywordVocabulary, sectorVocabulary } from '../../../../tests/fixtures/catalog';

import { CatalogIcon } from './index';

const meta = {
  title: 'Journeys/Catalog/CatalogIcon',
  component: CatalogIcon,
  args: { kind: 'study', size: 'xl', framed: true },
  argTypes: {
    kind: { control: 'select', options: [undefined, 'project', 'study'] },
    sector: { control: 'select', options: [undefined, ...sectorVocabulary.map((sector) => sector.code)] },
    keyword: { control: 'text' },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    framed: { control: 'boolean' },
  },
} satisfies Meta<typeof CatalogIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The duo: a hand lifting litter out of the bay (field action) and a lens over a water sample (research). */
export const KindDuo: Story = {
  render: () => ({
    components: { CatalogIcon },
    template: `
      <div style="display: flex; gap: 16px; font-family: var(--font-family-sans)">
        <div v-for="item in items" :key="item.kind"
          style="display: grid; grid-template-columns: auto 1fr; gap: 4px 14px; align-items: center; width: 260px; padding: 16px; border-radius: 14px; background: var(--color-surface); box-shadow: var(--shadow-card)">
          <CatalogIcon :kind="item.kind" size="xl" framed style="grid-row: span 2" />
          <strong style="font-size: 18px; color: var(--color-text-heading)">{{ item.title }}</strong>
          <span style="font-size: 13px; color: var(--color-text-secondary)">{{ item.text }}</span>
        </div>
      </div>
    `,
    setup: () => ({
      items: [
        { kind: 'project', title: 'Iniciativa', text: 'Ação em campo: limpar, coletar, restaurar.' },
        { kind: 'study', title: 'Estudo', text: 'Pesquisa: medir, analisar, publicar.' },
      ],
    }),
  }),
};

export const Sectors: Story = {
  render: () => ({
    components: { CatalogIcon },
    setup: () => ({ sectors: sectorVocabulary }),
    template: `
      <div style="display: flex; gap: 12px; font-family: var(--font-family-sans)">
        <div v-for="sector in sectors" :key="sector.code"
          style="display: grid; justify-items: center; gap: 8px; width: 120px; padding: 14px 8px; border-radius: 14px; background: var(--color-surface); box-shadow: var(--shadow-card)">
          <CatalogIcon :sector="sector.code" size="xl" />
          <strong style="font-size: 14px; color: var(--color-text-heading)">{{ sector.label }}</strong>
        </div>
      </div>
    `,
  }),
};

export const Keywords: Story = {
  parameters: { layout: 'padded' },
  render: () => ({
    components: { CatalogIcon },
    setup: () => ({ groups: keywordVocabulary }),
    template: `
      <div style="display: grid; gap: 18px; max-width: 760px; font-family: var(--font-family-sans)">
        <section v-for="group in groups" :key="group.category" style="display: grid; gap: 8px">
          <h3 style="margin: 0; font-size: 13px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: .04em">{{ group.category }}</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 8px">
            <span v-for="keyword in group.keywords" :key="keyword.code"
              style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px 4px 6px; border-radius: 999px; background: var(--color-surface); border: 1px solid var(--color-border); font-size: 14px; color: var(--color-text-primary)">
              <CatalogIcon :keyword="keyword.code" size="sm" framed style="--frame-padding: 2px; border-radius: 999px" />
              {{ keyword.label }}
            </span>
          </div>
        </section>
      </div>
    `,
  }),
};
