<script lang="ts">
/**
 * An official emblem next to a name: an institution's logo or a
 * municipality's flag. The files come from the App (BVRio supplies them, with
 * the owners' authorisation); until a file exists, a logo falls back to a
 * monogram of the name and a flag to nothing (the caller keeps its icon).
 * Decorative: the name is always written next to it.
 */
export interface EmblemProps {
  name: string;
  /** Image URL; absent until the official file is supplied. */
  src?: string;
  shape?: 'logo' | 'flag';
  /** Height in px (a flag is 3:2, a logo square). */
  size?: number;
}

const SMALL_WORDS = new Set(['a', 'as', 'da', 'das', 'de', 'do', 'dos', 'e', 'o', 'os']);

/** "Prefeitura de Niterói" → "PN"; "CNPq" → "CNPq" (short acronyms keep their case); "Petrobras" → "PETR". */
export function monogram(name: string): string {
  const words = name
    .replace(/[()]/g, ' ')
    .split(/[\s/-]+/)
    .filter((word) => word && !SMALL_WORDS.has(word.toLowerCase()));
  if (words.length === 1) return words[0]!.length <= 5 ? words[0]! : words[0]!.slice(0, 4).toUpperCase();
  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

import styles from './Emblem.module.scss';

const { name, src, shape = 'logo', size = 40 } = defineProps<EmblemProps>();

const width = computed(() => (shape === 'flag' ? Math.round((size * 3) / 2) : size));
// Small slots keep at most three letters.
const initials = computed(() => monogram(name).slice(0, size < 32 ? 3 : 5));
// Longer monograms get a smaller type so they always fit the tile.
const fontSize = computed(() => Math.max(Math.round(size / [2.4, 2.4, 2.6, 3.2, 3.9, 4.7][initials.value.length]!), 8));
</script>

<template>
  <img
    v-if="src"
    :class="[styles.root, styles[shape]]"
    :src="src"
    alt=""
    :width="width"
    :height="size"
    loading="lazy"
    :data-emblem="shape"
  />
  <span
    v-else-if="shape === 'logo'"
    :class="[styles.root, styles.monogram]"
    :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${fontSize}px` }"
    aria-hidden="true"
    data-emblem="monogram"
  >
    {{ initials }}
  </span>
</template>
