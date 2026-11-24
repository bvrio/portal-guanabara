import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { computed, defineComponent, h, onMounted, ref } from 'vue';

/*
 * Foundations/Colors — the "Bay + Comlurb" palette, its 60/30/10 roles and the
 * catalogue meaning colours. Values and contrast ratios are read from the live
 * tokens, so the page never drifts from colors.scss.
 */

const ramps = {
  nevoa: { title: 'Névoa · neutros (60%)', steps: [0, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  baia: { title: 'Baía · estrutura (30%)', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  comlurb: { title: 'Comlurb · ação (10%)', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  agua: { title: 'Água · água aberta, ambiente, gráficos', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  mangue: { title: 'Mangue · natureza, restauração', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  pesquisa: { title: 'Pesquisa · estudos', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  residuo: { title: 'Resíduo · tipo de resíduo', steps: [50, 100, 500, 700] },
  folha: { title: 'Folha · biota', steps: [50, 100, 500, 700] },
  corrente: { title: 'Corrente · processos físicos', steps: [50, 100, 500, 700] },
  social: { title: 'Social · dimensão socioambiental', steps: [50, 100, 500, 700] },
  alerta: { title: 'Alerta · erros', steps: [50, 100, 500, 600, 700] },
} as const;

/** Token value as #rrggbb (minifiers may shorten #ffffff to #fff). */
function readToken(name: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim().toLowerCase();
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(value);
  return short ? `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}` : value;
}

function luminance(hex: string): number {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((index) => {
    const c = parseInt(value.slice(index, index + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

function contrast(a: string, b: string): number {
  if (!/^#[0-9a-f]{6}$/i.test(a) || !/^#[0-9a-f]{6}$/i.test(b)) return 0;
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const useTokens = () => {
  const tick = ref(0);
  onMounted(() => {
    tick.value += 1;
  });
  return (name: string) => {
    void tick.value;
    return typeof document === 'undefined' ? '' : readToken(name);
  };
};

const Swatch = defineComponent({
  props: { token: { type: String, required: true }, label: { type: String, required: true } },
  setup(props) {
    const token = useTokens();
    return () => {
      const hex = token(props.token);
      const onWhite = contrast(hex, '#ffffff');
      const onInk = contrast(hex, '#0b171a');
      const textColor = onInk >= onWhite ? '#0b171a' : '#ffffff';
      return h('div', { style: 'display:grid;gap:4px;min-width:84px' }, [
        h('div', {
          style: `height:56px;border-radius:8px;background:var(${props.token});box-shadow:inset 0 0 0 1px rgb(11 58 71 / 10%);display:flex;align-items:end;padding:6px;color:${textColor};font:600 11px/1 var(--font-family-sans)`,
        }, props.label),
        h('code', { style: 'font-size:11px;color:var(--color-text-secondary)' }, hex.toUpperCase()),
      ]);
    };
  },
});

const RampsPage = defineComponent({
  setup() {
    return () =>
      h('div', { style: 'display:grid;gap:24px;padding:24px;background:var(--color-bg-canvas);font-family:var(--font-family-sans)' },
        Object.entries(ramps).map(([key, ramp]) =>
          h('section', { style: 'display:grid;gap:8px' }, [
            h('h3', { style: 'margin:0;font-size:14px;color:var(--color-text-heading)' }, ramp.title),
            h('div', { style: 'display:flex;flex-wrap:wrap;gap:8px' },
              ramp.steps.map((step) => h(Swatch, { token: `--color-${key}-${step}`, label: String(step) })),
            ),
          ]),
        ),
      );
  },
});

const pairs: { label: string; fg: string; bg: string; role: string }[] = [
  { role: '60', label: 'Texto principal no canvas', fg: '--color-text-primary', bg: '--color-bg-canvas' },
  { role: '60', label: 'Texto secundário no canvas', fg: '--color-text-secondary', bg: '--color-bg-canvas' },
  { role: '60', label: 'Texto discreto na superfície', fg: '--color-text-muted', bg: '--color-surface' },
  { role: '30', label: 'Título (baía)', fg: '--color-text-heading', bg: '--color-bg-canvas' },
  { role: '30', label: 'Link', fg: '--color-link', bg: '--color-surface' },
  { role: '30', label: 'Texto na faixa estrutural', fg: '--color-structure-text', bg: '--color-structure-bg' },
  { role: '30', label: 'Texto secundário na faixa', fg: '--color-structure-text-secondary', bg: '--color-structure-bg' },
  { role: '30', label: 'Destaque laranja na faixa', fg: '--color-structure-accent', bg: '--color-structure-bg' },
  { role: '10', label: 'Botão principal (tinta escura)', fg: '--color-action-primary-contrast', bg: '--color-action-primary' },
  { role: '10', label: 'Botão principal, hover', fg: '--color-action-primary-contrast', bg: '--color-action-primary-hover' },
  { role: '10', label: 'Texto laranja em fundo claro', fg: '--color-accent-text', bg: '--color-accent-tint' },
  { role: 'meaning', label: 'Iniciativa (chip)', fg: '--color-kind-project-text', bg: '--color-kind-project-tint' },
  { role: 'meaning', label: 'Estudo (chip)', fg: '--color-kind-study-text', bg: '--color-kind-study-tint' },
];

const RolesPage = defineComponent({
  setup() {
    const token = useTokens();
    const rows = computed(() =>
      pairs.map((pair) => ({ ...pair, ratio: contrast(token(pair.fg), token(pair.bg)) })),
    );
    const bar = (share: number, color: string, label: string, ink: string) =>
      h('div', { style: `flex:${share};background:var(${color});color:var(${ink});padding:10px 12px;font:600 13px/1.2 var(--font-family-sans)` }, label);
    return () =>
      h('div', { style: 'display:grid;gap:24px;padding:24px;background:var(--color-bg-canvas);font-family:var(--font-family-sans);max-width:880px' }, [
        h('div', { style: 'display:flex;border-radius:12px;overflow:hidden;box-shadow:var(--shadow-card)' }, [
          bar(60, '--color-bg-canvas', '60% · névoa — fundo e superfícies', '--color-text-primary'),
          bar(30, '--color-structure-bg', '30% · baía — estrutura', '--color-structure-text'),
          bar(10, '--color-action-primary', '10% · ação', '--color-action-primary-contrast'),
        ]),
        h('table', { style: 'border-collapse:collapse;font-size:13px;background:var(--color-surface);border-radius:12px;overflow:hidden' }, [
          h('thead', h('tr', ['Papel', 'Par', 'Amostra', 'Contraste'].map((title) =>
            h('th', { style: 'text-align:left;padding:8px 12px;color:var(--color-text-muted);font-weight:600;border-bottom:1px solid var(--color-border)' }, title)))),
          h('tbody', rows.value.map((row) =>
            h('tr', [
              h('td', { style: 'padding:8px 12px;color:var(--color-text-secondary)' }, row.role === 'meaning' ? 'significado' : `${row.role}%`),
              h('td', { style: 'padding:8px 12px' }, [h('div', row.label), h('code', { style: 'font-size:11px;color:var(--color-text-muted)' }, `${row.fg} / ${row.bg}`)]),
              h('td', { style: 'padding:8px 12px' }, h('span', { style: `display:inline-block;padding:6px 12px;border-radius:999px;background:var(${row.bg});color:var(${row.fg});font-weight:600` }, 'Baía de Guanabara')),
              h('td', { style: `padding:8px 12px;font-variant-numeric:tabular-nums;font-weight:600;color:${row.ratio >= 4.5 ? 'var(--color-feedback-success)' : 'var(--color-feedback-error)'}` }, `${row.ratio.toFixed(2)}:1`),
            ]),
          )),
        ]),
      ]);
  },
});

const meanings = [
  { title: 'Tipo de iniciativa', items: [['Iniciativa · ação em campo', 'kind-project'], ['Estudo · pesquisa', 'kind-study']] },
  {
    title: 'Categorias de palavra-chave',
    items: [
      ['Tipo de resíduo', 'topic-waste'],
      ['Ambiente', 'topic-environment'],
      ['Biota', 'topic-biota'],
      ['Processos físicos', 'topic-physical'],
      ['Dimensão socioambiental', 'topic-social'],
      ['Outra', 'topic-other'],
    ],
  },
] as const;

const MeaningsPage = defineComponent({
  setup() {
    return () =>
      h('div', { style: 'display:grid;gap:24px;padding:24px;background:var(--color-bg-canvas);font-family:var(--font-family-sans)' },
        meanings.map((group) =>
          h('section', { style: 'display:grid;gap:10px' }, [
            h('h3', { style: 'margin:0;font-size:14px;color:var(--color-text-heading)' }, group.title),
            h('div', { style: 'display:flex;flex-wrap:wrap;gap:12px' },
              group.items.map(([label, token]) =>
                h('div', { style: 'display:grid;gap:6px;justify-items:start' }, [
                  h('span', { style: `display:inline-flex;align-items:center;gap:6px;padding:4px 12px 4px 8px;border-radius:999px;background:var(--color-${token}-tint);color:var(--color-${token}-text);font-weight:600;font-size:14px` }, [
                    h('span', { style: `width:10px;height:10px;border-radius:50%;background:var(--color-${token})` }),
                    label,
                  ]),
                  h('code', { style: 'font-size:11px;color:var(--color-text-muted)' }, `--color-${token}`),
                ]),
              ),
            ),
          ]),
        ),
      );
  },
});

const meta = {
  title: 'Foundations/Colors',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Roles: Story = { render: () => ({ components: { RolesPage }, template: '<RolesPage />' }) };

export const Ramps: Story = { render: () => ({ components: { RampsPage }, template: '<RampsPage />' }) };

export const Meanings: Story = { render: () => ({ components: { MeaningsPage }, template: '<MeaningsPage />' }) };
