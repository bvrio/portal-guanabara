<script setup lang="ts">
import Typography from '../../foundations/Typography/Typography.vue';

import styles from './PageTitle.module.scss';
</script>

<template>
  <header :class="styles.root">
    <Typography as="h1" variant="title" :class="styles.title">
      <slot />
    </Typography>
  </header>
</template>
