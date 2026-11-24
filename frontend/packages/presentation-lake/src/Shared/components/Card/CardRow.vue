<script lang="ts">
export type CardGap = 'sm' | 'md' | 'lg';

/**
 * A number represents a fractional grid track: 2 becomes `2fr`.
 * A string may be any valid CSS Grid track, e.g. `auto`, `240px`, or `minmax(0, 2fr)`.
 */
export type CardColumnSize = number | string;

export interface CardRowProps {
  /**
   * Defines the columns for this row only.
   * Examples: `[2, 1]` -> `2fr 1fr`, or `['minmax(0, 2fr)', '240px']`.
   * When omitted, direct children are laid out in equal-width columns.
   */
  columns?: readonly CardColumnSize[] | string;
  gap?: CardGap;
  align?: 'start' | 'center' | 'end' | 'stretch';
}

function toGridTrack(column: CardColumnSize): string {
  if (typeof column === 'number') {
    // Invalid fractional values are rejected with a safe, predictable fallback.
    return Number.isFinite(column) && column > 0 ? `${column}fr` : '1fr';
  }

  return column.trim() || 'minmax(0, 1fr)';
}

export function getGridTemplateColumns(
  columns: CardRowProps['columns'],
  childCount: number,
): string {
  if (typeof columns === 'string' && columns.trim()) {
    return columns;
  }

  if (Array.isArray(columns) && columns.length > 0) {
    return columns.map(toGridTrack).join(' ');
  }

  return `repeat(${Math.max(childCount, 1)}, minmax(0, 1fr))`;
}
</script>

<script setup lang="ts">
import { Comment, Fragment, useSlots, type VNode } from 'vue';

import styles from './Card.module.scss';

const { columns, gap = 'md', align = 'stretch' } = defineProps<CardRowProps>();

const slots = useSlots();

function countChildren(nodes: VNode[] = []): number {
  return nodes.reduce((total, node) => {
    if (node.type === Comment) return total;
    if (node.type === Fragment && Array.isArray(node.children)) {
      return total + countChildren(node.children as VNode[]);
    }
    return total + 1;
  }, 0);
}

function rowStyle() {
  return {
    gridTemplateColumns: getGridTemplateColumns(columns, countChildren(slots.default?.())),
    alignItems: align,
  };
}
</script>

<template>
  <div :class="[styles.row, styles[`gap-${gap}`]]" :style="rowStyle()">
    <slot />
  </div>
</template>
