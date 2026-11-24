<script lang="ts">
/**
 * A floating panel anchored to its trigger (menus, pickers). Rendered in
 * <body>, so it is never clipped by scrolling rows; on phones (< 560px) it
 * becomes a bottom sheet over a dimmed page.
 *
 * Closes on Escape, on a click outside the panel and the anchor, and when the
 * model is set to false; focus returns to the anchor. `opened` fires once the
 * panel is placed, so the content can take focus.
 */
export interface PopoverProps {
  /** The trigger the panel hangs from. */
  anchor: HTMLElement | null;
  /** Accessible name when the panel is a dialog (pickers). */
  label?: string;
  /** `dialog` for pickers; `none` when the content carries its own role (a listbox). */
  role?: 'dialog' | 'none';
  align?: 'start' | 'end';
  /** Panel width on larger screens (CSS length). */
  width?: string;
}
</script>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

import { cssZoom } from '../../../Utils/cssZoom';

import styles from './Popover.module.scss';

const { anchor, label, role = 'dialog', align = 'start', width = '18rem' } = defineProps<PopoverProps>();

const open = defineModel<boolean>('open', { required: true });

const emit = defineEmits<{ opened: [panel: HTMLElement] }>();

const panel = ref<HTMLElement | null>(null);
const position = ref<Record<string, string>>({});
const sheet = ref(false);

const GAP = 6;
const MARGIN = 8;

function place() {
  if (!anchor || !panel.value || typeof window === 'undefined') return;
  sheet.value = window.innerWidth < 560;
  if (sheet.value) {
    position.value = {};
    return;
  }

  const rect = anchor.getBoundingClientRect();
  const panelRect = panel.value.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom - GAP - MARGIN;
  const above = panelRect.height > spaceBelow && rect.top - GAP - MARGIN > spaceBelow;

  let left = align === 'end' ? rect.right - panelRect.width : rect.left;
  left = Math.min(Math.max(left, MARGIN), window.innerWidth - panelRect.width - MARGIN);

  // Rects are on-screen pixels; under a page zoom, CSS pixels are larger.
  const zoom = cssZoom(panel.value);
  const px = (value: number) => `${Math.round(value / zoom)}px`;
  position.value = {
    left: px(left),
    top: above ? px(rect.top - GAP - panelRect.height) : px(rect.bottom + GAP),
    maxHeight: px(Math.max(above ? rect.top - GAP - MARGIN : spaceBelow, 160)),
  };
}

function close(restoreFocus = true) {
  open.value = false;
  if (restoreFocus) anchor?.focus();
}

function onPointerDown(event: Event) {
  const target = event.target as Node | null;
  if (!target || panel.value?.contains(target) || anchor?.contains(target)) return;
  close(false);
}

function onKeyDown(event: Event) {
  if ((event as KeyboardEvent).key === 'Escape') {
    event.preventDefault();
    close();
  }
}

function listen(on: boolean) {
  const method = on ? 'addEventListener' : 'removeEventListener';
  document[method]('pointerdown', onPointerDown, true);
  document[method]('keydown', onKeyDown);
  window[method]('resize', place);
  window[method]('scroll', place, true);
}

watch(
  open,
  async (value) => {
    if (typeof document === 'undefined') return;
    listen(false);
    if (!value) return;
    await nextTick();
    place();
    listen(true);
    if (panel.value) emit('opened', panel.value);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') listen(false);
});
</script>

<template>
  <Teleport to="body">
    <template v-if="open">
      <div v-if="sheet" :class="styles.backdrop" aria-hidden="true" />
      <div
        ref="panel"
        :class="[styles.panel, sheet && styles.sheet]"
        :style="{ ...position, '--popover-width': width }"
        :role="role === 'dialog' ? 'dialog' : undefined"
        :aria-label="role === 'dialog' ? label : undefined"
        data-popover
      >
        <slot :close="close" />
      </div>
    </template>
  </Teleport>
</template>
