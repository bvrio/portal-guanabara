<script lang="ts">
/** One pair: `term` as a string or the `#term` slot; the description in the default slot. */
export interface DescriptionListItemProps {
  term?: string;
}
</script>

<script setup lang="ts">
import styles from './DescriptionList.module.scss';

const { term } = defineProps<DescriptionListItemProps>();
</script>

<template>
  <div :class="styles.item">
    <dt :class="styles.term">
      <slot name="term">{{ term }}</slot>
    </dt>
    <dd :class="styles.description">
      <slot />
    </dd>
  </div>
</template>
