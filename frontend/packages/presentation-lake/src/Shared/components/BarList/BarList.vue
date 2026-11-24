<script lang="ts">
/** One part of a stacked bar (v0.8): its value, colour and what it is in words. */
export interface BarListSegment {
  value: number;
  /** Any CSS colour, e.g. `var(--color-kind-project)`. */
  color: string;
  /** The part in words, e.g. "20 iniciativas" — read out and shown on hover. */
  label: string;
}

export interface BarListItem {
  id: string;
  label: string;
  value: number;
  /** Optional drill-down, e.g. the list filtered by this category. */
  href?: string;
  /** Split the bar into parts that add up to `value` (drawn in this order). */
  segments?: readonly BarListSegment[];
}

/**
 * Ranked horizontal bars compared on one baseline. Each value is printed at the
 * tip of its bar, so the list doubles as its own table view; a split bar also
 * carries its parts in words, so colour never carries meaning alone. Pass items
 * already sorted. With `href` or `selectable` the whole row is the control
 * (v0.8): label, bar and value answer the click, not only the name.
 */
export interface BarListProps {
  items: readonly BarListItem[];
  /** Scale maximum; defaults to the largest value in `items`. */
  max?: number;
  /**
   * Rows become buttons that emit `select` (e.g. to open a preview drawer)
   * instead of links; `href` is ignored.
   */
  selectable?: boolean;
  /** Colour of whole bars (any CSS colour); defaults to the data series hue. */
  color?: string;
}
</script>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useIntl } from 'vue-intl';

import { LINK_COMPONENT_KEY } from '../Link/linkComponent';

import styles from './BarList.module.scss';

const { items, max, selectable = false, color } = defineProps<BarListProps>();

const emit = defineEmits<{ select: [item: BarListItem] }>();

const intl = useIntl();
const linkComponent = inject(LINK_COMPONENT_KEY, null);

const scale = computed(() => max ?? Math.max(0, ...items.map((item) => item.value)));

function share(value: number) {
  return scale.value > 0 ? Math.min(value / scale.value, 1) : 0;
}

const partsOf = (item: BarListItem) => (item.segments ?? []).filter((segment) => segment.value > 0);

/** The parts in words, e.g. "20 iniciativas e 8 estudos". */
function breakdown(item: BarListItem) {
  const parts = partsOf(item).map((segment) => segment.label);
  return parts.length ? intl.formatList(parts, { type: 'conjunction' }) : '';
}

function tagOf(item: BarListItem) {
  if (selectable) return 'button';
  return item.href ? (linkComponent ?? 'a') : 'div';
}

function attrsOf(item: BarListItem) {
  const detail = breakdown(item);
  const title = detail ? `${item.label}: ${detail}` : item.label;
  if (selectable) return { type: 'button', 'aria-haspopup': 'dialog', title };
  return item.href ? { href: item.href, title } : { title };
}
</script>

<template>
  <ul v-if="items.length" :class="styles.root">
    <li v-for="item in items" :key="item.id" :class="styles.item" :data-item="item.id">
      <component
        :is="tagOf(item)"
        v-bind="attrsOf(item)"
        :class="[styles.row, (selectable || item.href) && styles.interactive]"
        @click="selectable && emit('select', item)"
      >
        <span :class="styles.label">
          <slot name="icon" :item="item" />
          <span :class="styles.labelText">{{ item.label }}</span>
        </span>
        <span :class="styles.track">
          <span
            :class="styles.bar"
            :style="{ '--bar-share': share(item.value), '--bar-color': color }"
            :data-empty="item.value === 0 || undefined"
            :data-split="partsOf(item).length > 1 || undefined"
            aria-hidden="true"
          >
            <span
              v-for="(segment, index) in partsOf(item)"
              :key="index"
              :class="styles.segment"
              :style="{ '--segment-grow': segment.value, '--segment-color': segment.color }"
            />
          </span>
          <span :class="styles.value">{{ intl.formatNumber(item.value) }}</span>
        </span>
        <span v-if="breakdown(item)" :class="styles.visuallyHidden">({{ breakdown(item) }})</span>
      </component>
    </li>
  </ul>
  <div v-else :class="styles.empty">
    <slot name="empty" />
  </div>
</template>
