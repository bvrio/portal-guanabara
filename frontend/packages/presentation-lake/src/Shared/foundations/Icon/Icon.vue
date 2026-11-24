<script lang="ts">
import type { IconName } from './glyphs';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Duotone icon from the Portal Guanabara set (24×24 grid, 1.75px rounded
 * line, ~18% tint). Lines and solids follow `currentColor`; the tint, accent
 * and secondary layers follow `--icon-tint`, `--icon-accent` and
 * `--icon-secondary` (all default to `currentColor`), so a parent sets
 * meaning colours without new props.
 */
export interface IconProps {
  name: IconName;
  /** xs 16 · sm 20 · md 24 · lg 32 · xl 48 */
  size?: IconSize;
  /** Accessible name. Without it the icon is decorative and hidden from assistive tech. */
  label?: string;
}

export const iconSizes: Record<IconSize, number> = { xs: 16, sm: 20, md: 24, lg: 32, xl: 48 };
</script>

<script setup lang="ts">
import { computed } from 'vue';

import { iconGlyphs } from './glyphs';

import styles from './Icon.module.scss';

const { name, size = 'md', label } = defineProps<IconProps>();

const glyph = computed(() => iconGlyphs[name]);
const pixels = computed(() => iconSizes[size]);
</script>

<template>
  <svg
    :class="styles.root"
    :width="pixels"
    :height="pixels"
    viewBox="0 0 24 24"
    fill="none"
    focusable="false"
    :data-icon="name"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
  >
    <path v-for="(d, index) in glyph.tint" :key="`t${index}`" :class="styles.tint" :d="d" />
    <path v-for="(d, index) in glyph.accent" :key="`a${index}`" :class="styles.accent" :d="d" />
    <path v-for="(d, index) in glyph.secondary" :key="`b${index}`" :class="styles.secondary" :d="d" />
    <path v-for="(d, index) in glyph.detail" :key="`d${index}`" :class="styles.detail" :d="d" />
    <path v-for="(d, index) in glyph.line" :key="`l${index}`" :class="styles.line" :d="d" />
    <path v-for="(d, index) in glyph.solid" :key="`s${index}`" :class="styles.solid" :d="d" />
  </svg>
</template>
