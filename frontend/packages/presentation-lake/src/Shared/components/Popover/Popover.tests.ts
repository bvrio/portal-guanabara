import { fireEvent, render, screen } from '@testing-library/vue';
import { defineComponent, ref } from 'vue';

import Popover from './Popover.vue';

const Harness = defineComponent({
  components: { Popover },
  setup() {
    const open = ref(false);
    const trigger = ref<HTMLElement | null>(null);
    return { open, trigger };
  },
  template: `
    <div>
      <button ref="trigger" @click="open = !open">Abrir</button>
      <span>fora</span>
      <Popover v-model:open="open" :anchor="trigger" label="Período"><p>Conteúdo</p></Popover>
    </div>
  `,
});

describe('Popover', () => {
  it('opens as a labelled dialog in the body and closes on Escape, returning focus', async () => {
    render(Harness);
    const trigger = screen.getByRole('button', { name: 'Abrir' });

    await fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Período' })).toHaveTextContent('Conteúdo');

    await fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('closes on a click outside', async () => {
    render(Harness);
    await fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await fireEvent.pointerDown(screen.getByText('fora'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
