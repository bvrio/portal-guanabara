<script lang="ts">
/**
 * One person behind the portal: their photo (or a placeholder until it is
 * supplied), name (`#name`), role (`#role`), main field of work (`#area`,
 * v0.9.3) and a short description (default slot). Photos are supplied by the people themselves — never taken from the web.
 */
export interface AboutPersonCardProps {
  /** Photo URL, when supplied. */
  photo?: string;
  /** Heading level of the name inside the page. */
  headingLevel?: 2 | 3 | 4;
}
</script>

<script setup lang="ts">
import Icon from '../../../Shared/foundations/Icon/Icon.vue';

import styles from './AboutPersonCard.module.scss';

const { photo, headingLevel = 3 } = defineProps<AboutPersonCardProps>();
</script>

<template>
  <article :class="styles.root" data-person>
    <img v-if="photo" :class="styles.photo" :src="photo" alt="" />
    <span v-else :class="[styles.photo, styles.placeholder]" aria-hidden="true" data-photo-placeholder>
      <Icon name="user" size="xl" />
    </span>
    <div :class="styles.text">
      <component :is="`h${headingLevel}`" :class="styles.name"><slot name="name" /></component>
      <p v-if="$slots.role" :class="styles.role"><slot name="role" /></p>
      <p v-if="$slots.area" :class="styles.area" data-person-area><slot name="area" /></p>
      <p v-if="$slots.default" :class="styles.description"><slot /></p>
    </div>
  </article>
</template>
