<script lang="ts">
/**
 * A side panel over the page (right edge; full width on phones) for a quick
 * look without leaving it — e.g. the entries behind a chart bar.
 *
 * Modal dialog: focus moves in and stays in, Escape or the close button
 * closes it, the page behind does not scroll, and focus returns to where it
 * was. Slots: `#title`, `#actions` (header buttons before close), `#toolbar`
 * (a fixed strip under the header), default (body), `#footer`.
 */
export interface DrawerProps {
  /** Panel width on larger screens (CSS length). */
  width?: string;
  /**
   * One surface, no line under the header (v0.8) — for short panels such as a
   * navigation menu, where the title and the list read as one block.
   */
  plain?: boolean;
}
</script>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue';
import { useIntl } from 'vue-intl';

import Icon from '../../foundations/Icon/Icon.vue';
import { formatMessage } from '../../foundations/i18n/formatMessage';

import { defaultMessages } from './Drawer.messages';
import styles from './Drawer.module.scss';

const { width = '34rem', plain = false } = defineProps<DrawerProps>();

const open = defineModel<boolean>('open', { required: true });

const intl = useIntl();
const titleId = useId();
const panel = ref<HTMLElement | null>(null);
const closeButton = ref<HTMLButtonElement | null>(null);
let returnFocus: HTMLElement | null = null;

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function close() {
  open.value = false;
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault();
    close();
    return;
  }
  if (event.key !== 'Tab' || !panel.value) return;
  const focusable = [...panel.value.querySelectorAll<HTMLElement>(FOCUSABLE)];
  if (!focusable.length) return;
  const first = focusable[0]!;
  const last = focusable[focusable.length - 1]!;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

watch(
  open,
  async (value, previous) => {
    if (typeof document === 'undefined') return;
    if (value) {
      returnFocus = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';
      await nextTick();
      closeButton.value?.focus();
    } else if (previous) {
      document.body.style.overflow = '';
      returnFocus?.focus?.();
      returnFocus = null;
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (typeof document !== 'undefined' && open.value) document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <div v-if="open" :class="styles.root" @keydown="onKeyDown">
      <div :class="styles.backdrop" aria-hidden="true" @click="close" />
      <section
        ref="panel"
        :class="[styles.panel, plain && styles.plain]"
        :style="{ '--drawer-width': width }"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        data-drawer
      >
        <header :class="styles.header">
          <h2 :id="titleId" :class="styles.title"><slot name="title" /></h2>
          <div v-if="$slots.actions" :class="styles.actions"><slot name="actions" /></div>
          <button
            ref="closeButton"
            type="button"
            :class="styles.close"
            :aria-label="formatMessage(intl, defaultMessages.close)"
            @click="close"
          >
            <Icon name="close" size="md" />
          </button>
        </header>
        <div v-if="$slots.toolbar" :class="styles.toolbar"><slot name="toolbar" /></div>
        <div :class="styles.body"><slot /></div>
        <footer v-if="$slots.footer" :class="styles.footer"><slot name="footer" /></footer>
      </section>
    </div>
  </Teleport>
</template>
