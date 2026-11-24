import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { defineMessages } from '../../foundations/i18n';
import { SiteFooter } from '../SiteFooter';

import { SiteHeader } from './index';

const nav = defineMessages({
  home: { id: 'story.nav.home', defaultMessage: 'Início' },
  catalog: { id: 'story.nav.catalog', defaultMessage: 'Catálogo' },
  list: { id: 'story.nav.list', defaultMessage: 'Todas as entradas' },
});

const meta = {
  title: 'Features/SiteHeader',
  component: SiteHeader,
  parameters: { layout: 'fullscreen' },
  args: {
    homeHref: '#',
    currentId: 'catalog',
    signInHref: '#entrar',
    zoomLevels: [100, 110, 120],
    zoom: 100,
    locale: 'pt-BR',
    locales: [
      { value: 'pt-BR', label: 'Português', short: 'PT', flag: 'br' },
      { value: 'en', label: 'English', short: 'EN', flag: 'gb' },
      { value: 'es', label: 'Español', short: 'ES', flag: 'es' },
      { value: 'fr', label: 'Français', short: 'FR', flag: 'fr' },
    ],
    items: [
      { id: 'home', href: '#', label: nav.home, icon: 'home' },
      { id: 'catalog', href: '#catalog', label: nav.catalog, icon: 'catalog' },
      { id: 'list', href: '#list', label: nav.list, icon: 'list' },
    ],
  },
} satisfies Meta<typeof SiteHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

/** One row (v0.9.17): mark and name, tabs, Opções and Entrar. Narrow the canvas to see it shed. */
export const Default: Story = {};

/** Início while its hero is on screen: the mark and the name wait (same place kept). */
export const BrandHidden: Story = { args: { brandReveal: 0 } };

/** Halfway: the hero's mark and name half under the bar. */
export const BrandHalfway: Story = { args: { brandReveal: 0.5 } };

export const WithFooter: Story = {
  render: (args) => ({
    components: { SiteHeader, SiteFooter },
    setup: () => ({ args }),
    template: `
      <div style="min-height: 320px; display: flex; flex-direction: column; background: var(--color-bg-canvas)">
        <SiteHeader v-bind="args" />
        <div style="flex: 1" />
        <SiteFooter home-href="#">Dados do mapeamento de iniciativas e estudos da BVRio.</SiteFooter>
      </div>
    `,
  }),
};
