import { fireEvent, screen } from '@testing-library/vue';
import { defineComponent, ref } from 'vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';

import Drawer from './Drawer.vue';
import { defaultMessages } from './Drawer.messages';

const Harness = defineComponent({
  components: { Drawer },
  setup: () => ({ open: ref(false) }),
  template: `
    <div>
      <button @click="open = true">Rio de Janeiro</button>
      <Drawer v-model:open="open">
        <template #title>Rio de Janeiro</template>
        <a href="/catalog/1">Primeira entrada</a>
        <template #footer><a href="/catalog?municipality=rio-de-janeiro">Ver no catálogo</a></template>
      </Drawer>
    </div>
  `,
});

describe('Drawer', () => {
  it('opens as a modal dialog named by its title, focusing the close button', async () => {
    renderWithIntl(Harness, { descriptors: [defaultMessages.close] });
    const trigger = screen.getByRole('button', { name: 'Rio de Janeiro' });
    trigger.focus();

    await fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Rio de Janeiro' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes on Escape and gives focus back', async () => {
    renderWithIntl(Harness, { descriptors: [defaultMessages.close] });
    const trigger = screen.getByRole('button', { name: 'Rio de Janeiro' });
    trigger.focus();
    await fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');

    await fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });

  it('can be one plain surface, for short panels such as a menu', async () => {
    renderWithIntl(Drawer, {
      descriptors: [defaultMessages.close],
      props: { open: true, plain: true },
      slots: { title: 'Menu', default: '<a href="/">Início</a>' },
    });
    const dialog = await screen.findByRole('dialog', { name: 'Menu' });
    expect(dialog.className).toMatch(/plain/);
  });
});
