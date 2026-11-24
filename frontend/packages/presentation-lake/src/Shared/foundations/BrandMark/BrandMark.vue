<script lang="ts">
/**
 * The Portal Guanabara mark (v0.9.26): a G that protects the bay's water,
 * with two small fish — orange for who acts (initiatives), purple for who
 * studies. Replaces the bay tile of v0.6–v0.9.25. Used in the site header and
 * on Início; everywhere else the bay stays a duotone `Icon`.
 *
 * v0.9.27: the G carries the same black contour as the name on Início, and
 * the fish's eyes are black.
 */
export interface BrandMarkProps {
  /** Rendered size in px (square). */
  size?: number;
  /** Accessible name. Without it the mark is decorative and hidden from assistive tech. */
  label?: string;
  /** The G is light on dark backgrounds (header, Início's band) and dark on light ones. */
  tone?: 'on-dark' | 'on-light';
}
</script>

<script setup lang="ts">
import { useId } from 'vue';

import styles from './BrandMark.module.scss';

const { size = 32, label, tone = 'on-dark' } = defineProps<BrandMarkProps>();

const clipId = `brand-water-${useId()}`;

/** A small fish: body, tail and a black eye. */
function fish(cx: number, cy: number, right: boolean) {
  const d = right ? 1 : -1;
  const s = 1.05;
  const tx = cx - d * 2.4 * s;
  return {
    body: { cx, cy, rx: 3.2 * s, ry: 1.9 * s },
    tail: `M${tx} ${cy} L${tx - d * 2.6 * s} ${cy - 2.1 * s} Q${tx - d * 1.8 * s} ${cy} ${tx - d * 2.6 * s} ${cy + 2.1 * s} Z`,
    eye: { cx: cx + d * 1.6 * s, cy: cy - 0.4 * s },
  };
}

const fishes = [
  { key: 'act', class: styles.act, ...fish(24.5, 42.4, true) },
  { key: 'study', class: styles.study, ...fish(33.5, 48, false) },
];
</script>

<template>
  <svg
    :class="[styles.root, tone === 'on-light' && styles.onLight]"
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    focusable="false"
    data-brand-mark
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
  >
    <defs>
      <clipPath :id="clipId"><circle cx="31" cy="33" r="20.5" /></clipPath>
    </defs>
    <g :clip-path="`url(#${clipId})`">
      <path :class="styles.water" d="M7 37.2 Q12 34.6 17 37.2 T27 37.2 T37 37.2 T47 37.2 T57 37.2 V64 H7 Z" />
      <g v-for="item in fishes" :key="item.key" :class="item.class" :data-brand-fish="item.key">
        <ellipse v-bind="item.body" />
        <path :d="item.tail" />
        <circle :class="styles.eye" v-bind="item.eye" r="0.47" />
      </g>
    </g>
    <!-- The contour: the G drawn wider in black, under the G itself. -->
    <path :class="styles.outline" d="M50.5 17.5 A24 24 0 1 0 55 37" data-brand-outline />
    <path :class="styles.outline" d="M55 37 H37" data-brand-outline />
    <path :class="styles.g" d="M50.5 17.5 A24 24 0 1 0 55 37" />
    <path :class="styles.g" d="M55 37 H37" />
  </svg>
</template>
