<script setup lang="ts">
/**
 * App-owned i18n provider (Nuxt counterpart of the React IntlProvider).
 * The Presentation Lake consumes this context via vue-intl's useIntl().
 * Translated catalogs are owned by the application.
 */
import { createIntl } from '@formatjs/intl';
import type { VNode } from 'vue';
import { provideIntl } from 'vue-intl';

const { locale = 'pt-BR', messages = {} } = defineProps<{
  locale?: string;
  messages?: Record<string, string>;
}>();

provideIntl(
  createIntl<VNode>({
    locale,
    defaultLocale: 'pt-BR',
    messages,
  }),
);
</script>

<template>
  <slot />
</template>
