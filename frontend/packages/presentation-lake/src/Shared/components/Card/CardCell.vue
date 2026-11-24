<script setup lang="ts">
import styles from './Card.module.scss';
</script>

<template>
  <div :class="styles.cell">
    <slot />
  </div>
</template>
