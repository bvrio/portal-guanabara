import { fireEvent, screen } from '@testing-library/vue';
import { defineComponent, ref } from 'vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { defineMessages } from '../../foundations/i18n';

import GuidedTour from './GuidedTour.vue';
import { defaultMessages } from './GuidedTour.messages';

const copy = defineMessages({
  navTitle: { id: 'test.tour.navTitle', defaultMessage: 'Navegação' },
  navBody: { id: 'test.tour.navBody', defaultMessage: 'Início e Catálogo.' },
  duoTitle: { id: 'test.tour.duoTitle', defaultMessage: 'Duas metades' },
  duoBody: { id: 'test.tour.duoBody', defaultMessage: 'Iniciativas e estudos.' },
  lateTitle: { id: 'test.tour.lateTitle', defaultMessage: 'A gaveta' },
  lateBody: { id: 'test.tour.lateBody', defaultMessage: 'Abre no passo.' },
  missingTitle: { id: 'test.tour.missingTitle', defaultMessage: 'Fora da página' },
  missingBody: { id: 'test.tour.missingBody', defaultMessage: 'Não aparece.' },
});

const steps = [
  { id: 'nav', target: '[data-test-nav]', icon: 'list' as const, title: copy.navTitle, body: copy.navBody },
  { id: 'hidden', target: '[data-test-hidden]', title: copy.missingTitle, body: copy.missingBody },
  { id: 'missing', target: '[data-test-missing]', title: copy.missingTitle, body: copy.missingBody },
  { id: 'duo', target: '[data-test-duo]', title: copy.duoTitle, body: copy.duoBody },
];

const Harness = defineComponent({
  components: { GuidedTour },
  props: { onStep: Function, onFinish: Function, onSkip: Function },
  setup: () => ({ open: ref(false), steps }),
  template: `
    <div>
      <nav data-test-nav>Menu</nav>
      <span data-test-hidden>Só no computador</span>
      <section data-test-duo>Duo</section>
      <button @click="open = true">Começar tour</button>
      <GuidedTour v-model:open="open" :steps="steps" @step="(...a) => onStep?.(...a)" @finish="(...a) => onFinish?.(...a)" @skip="(...a) => onSkip?.(...a)" />
    </div>
  `,
});

// A step whose target the Page brings in when the step is reached (like the drawer on Início).
const lateSteps = [
  { id: 'nav', target: '[data-test-nav]', title: copy.navTitle, body: copy.navBody },
  { id: 'late', target: '[data-test-late]', appears: true, title: copy.lateTitle, body: copy.lateBody },
  { id: 'never', target: '[data-test-never]', appears: true, title: copy.missingTitle, body: copy.missingBody },
  { id: 'duo', target: '[data-test-duo]', title: copy.duoTitle, body: copy.duoBody },
];

const LateHarness = defineComponent({
  components: { GuidedTour },
  setup: () => {
    const late = ref(false);
    return { open: ref(false), late, steps: lateSteps, onStep: (_: number, id: string) => (late.value = id === 'late') };
  },
  template: `
    <div>
      <nav data-test-nav>Menu</nav>
      <section data-test-duo>Duo</section>
      <aside v-if="late" data-test-late>Gaveta</aside>
      <button @click="open = true">Começar tour</button>
      <GuidedTour v-model:open="open" :steps="steps" @step="onStep" />
    </div>
  `,
});

// A passing balloon between two steps (v0.9.32): not counted, no buttons, moves on by itself.
const passingSteps = [
  { id: 'nav', target: '[data-test-nav]', title: copy.navTitle, body: copy.navBody },
  { id: 'passing', target: '[data-test-duo]', auto: 2000, pointer: true, title: copy.lateTitle },
  { id: 'duo', target: '[data-test-duo]', title: copy.duoTitle, body: copy.duoBody },
];

const PassingHarness = defineComponent({
  components: { GuidedTour },
  props: { onStep: Function },
  setup: () => ({ open: ref(false), steps: passingSteps }),
  template: `
    <div>
      <nav data-test-nav>Menu</nav>
      <section data-test-duo>Duo</section>
      <button @click="open = true">Começar tour</button>
      <GuidedTour v-model:open="open" :steps="steps" @step="(...a) => onStep?.(...a)" />
    </div>
  `,
});

const descriptors = [...Object.values(defaultMessages), ...Object.values(copy)];

// A desktop-only control, hidden on this screen: the tour skips it.
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'checkVisibility', {
    configurable: true,
    value(this: HTMLElement) {
      return !this.hasAttribute('data-test-hidden');
    },
  });
});

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, 'checkVisibility');
});

describe('GuidedTour', () => {
  it('walks the steps whose targets exist and are shown, then finishes and gives focus back', async () => {
    const onStep = vi.fn();
    const onFinish = vi.fn();
    renderWithIntl(Harness, { locale: 'pt-BR', descriptors, props: { onStep, onFinish } });
    const start = screen.getByRole('button', { name: 'Começar tour' });
    start.focus();

    await fireEvent.click(start);
    const dialog = await screen.findByRole('dialog', { name: 'Navegação' });
    expect(dialog).toHaveTextContent('Passo 1 de 2');
    expect(dialog).toHaveAccessibleDescription('Início e Catálogo.');
    expect(dialog.querySelector('[data-icon="list"]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: defaultMessages.previous.defaultMessage as string })).toBeNull();
    expect(onStep).toHaveBeenLastCalledWith(0, 'nav');

    await fireEvent.click(screen.getByRole('button', { name: /Próximo/ }));
    expect(await screen.findByRole('dialog', { name: 'Duas metades' })).toHaveTextContent('Passo 2 de 2');
    expect(onStep).toHaveBeenLastCalledWith(1, 'duo');
    expect(screen.getByRole('button', { name: defaultMessages.previous.defaultMessage as string })).toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: /Concluir/ }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onFinish).toHaveBeenCalledExactlyOnceWith(2);
    expect(start).toHaveFocus();
  });

  it('goes back with ← and skips with Esc', async () => {
    const onSkip = vi.fn();
    renderWithIntl(Harness, { locale: 'pt-BR', descriptors, props: { onSkip } });

    await fireEvent.click(screen.getByRole('button', { name: 'Começar tour' }));
    const dialog = await screen.findByRole('dialog');
    await fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(await screen.findByRole('dialog', { name: 'Duas metades' })).toBeInTheDocument();
    await fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowLeft' });
    expect(await screen.findByRole('dialog', { name: 'Navegação' })).toBeInTheDocument();

    await fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onSkip).toHaveBeenCalledWith(0, 'nav');
  });

  it('waits for a target the Page brings in on the step, and passes one that never shows', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'requestAnimationFrame'] });
    try {
      renderWithIntl(LateHarness, { locale: 'pt-BR', descriptors });
      await fireEvent.click(screen.getByRole('button', { name: 'Começar tour' }));
      expect(await screen.findByRole('dialog', { name: 'Navegação' })).toHaveTextContent('Passo 1 de 4');

      await fireEvent.click(screen.getByRole('button', { name: /Próximo/ }));
      await vi.advanceTimersByTimeAsync(50);
      expect(screen.getByRole('dialog', { name: 'A gaveta' })).toHaveTextContent('Passo 2 de 4');
      expect(document.querySelector('[data-test-late]')).not.toBeNull();

      // The next step's target never appears: after the wait the tour moves on to the duo.
      await fireEvent.click(screen.getByRole('button', { name: /Próximo/ }));
      expect(document.querySelector('[data-test-late]')).toBeNull();
      await vi.advanceTimersByTimeAsync(5500);
      expect(screen.getByRole('dialog', { name: 'Duas metades' })).toHaveTextContent('Passo 4 de 4');
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows a passing balloon that is not counted, has no buttons and moves on by itself; ← goes back past it', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout', 'requestAnimationFrame'] });
    try {
      const onStep = vi.fn();
      renderWithIntl(PassingHarness, { locale: 'pt-BR', descriptors, props: { onStep } });
      await fireEvent.click(screen.getByRole('button', { name: 'Começar tour' }));
      expect(await screen.findByRole('dialog', { name: 'Navegação' })).toHaveTextContent('Passo 1 de 2');

      await fireEvent.click(screen.getByRole('button', { name: /Próximo/ }));
      const balloon = await screen.findByRole('dialog', { name: 'A gaveta' });
      expect(balloon).not.toHaveTextContent('Passo');
      expect(balloon.querySelector('[data-tour-countdown]')).not.toBeNull();
      expect(screen.queryByRole('button', { name: /Próximo/ })).toBeNull();
      await vi.advanceTimersByTimeAsync(100);
      expect(document.querySelector('[data-tour-pointer]')).not.toBeNull();

      await vi.advanceTimersByTimeAsync(2000);
      expect(screen.getByRole('dialog', { name: 'Duas metades' })).toHaveTextContent('Passo 2 de 2');
      expect(onStep.mock.calls.map((call) => call[1])).toEqual(['nav', 'passing', 'duo']);

      // ← from the step after the balloon goes back to the one before it.
      await fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowLeft' });
      expect(await screen.findByRole('dialog', { name: 'Navegação' })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
