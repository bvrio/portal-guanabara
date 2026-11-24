<script lang="ts">
/**
 * Routing-agnostic link. Accepts a normal Web `href`; renders <a> unless the
 * App provided a link component through `provideLinkComponent`.
 */
export interface LinkProps {
  href: string;
}
</script>

<script setup lang="ts">
import { inject } from 'vue';

import { LINK_COMPONENT_KEY } from './linkComponent';
import styles from './Link.module.scss';

const { href } = defineProps<LinkProps>();

const linkComponent = inject(LINK_COMPONENT_KEY, null);
</script>

<template>
  <component :is="linkComponent ?? 'a'" :href="href" :class="styles.root">
    <slot />
  </component>
</template>
