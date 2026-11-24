<script setup lang="ts">
/**
 * Routing adapter for the Presentation Lake `Link`: internal hrefs navigate
 * client-side through <NuxtLink>, while the lake stays routing-agnostic.
 */
import { NuxtLink } from '#components';
import { provideLinkComponent } from '@portal-guanabara/presentation-lake';

provideLinkComponent(NuxtLink);
</script>

<template>
  <slot />
</template>
