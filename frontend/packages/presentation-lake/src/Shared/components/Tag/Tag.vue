<script lang="ts">
export type TagVariant = 'neutral' | 'outline' | 'strong';
export type TagSize = 'sm' | 'md';

/**
 * Short label for a category, kind or state. With `href` it renders as a link
 * (through the App's link component, like <Link>).
 */
export interface TagProps {
  variant?: TagVariant;
  size?: TagSize;
  href?: string;
}
</script>

<script setup lang="ts">
import { inject } from 'vue';

import { LINK_COMPONENT_KEY } from '../Link/linkComponent';

import styles from './Tag.module.scss';

const { variant = 'neutral', size = 'md', href } = defineProps<TagProps>();

const linkComponent = inject(LINK_COMPONENT_KEY, null);
</script>

<template>
  <component
    :is="href ? (linkComponent ?? 'a') : 'span'"
    :href="href"
    :class="[styles.root, styles[variant], styles[size], href && styles.interactive]"
  >
    <slot />
  </component>
</template>
