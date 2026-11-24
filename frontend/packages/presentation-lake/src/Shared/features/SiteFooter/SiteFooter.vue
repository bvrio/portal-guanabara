<script lang="ts">
/**
 * The site's closing band in the deep structure colour: the bay mark and name,
 * a line of App-owned text (default slot) and optional links (`#links`).
 */
export interface SiteFooterProps {
  homeHref: string;
}
</script>

<script setup lang="ts">
import Link from '../../components/Link/Link.vue';
import Icon from '../../foundations/Icon/Icon.vue';
import FormattedMessage from '../../foundations/i18n/FormattedMessage.vue';
import { defaultMessages } from '../SiteHeader/SiteHeader.messages';

import styles from './SiteFooter.module.scss';

const { homeHref } = defineProps<SiteFooterProps>();
</script>

<template>
  <footer :class="styles.root">
    <div :class="styles.inner">
      <Link :href="homeHref" :class="styles.brand">
        <Icon name="bay" size="md" />
        <FormattedMessage v-bind="defaultMessages.brand" />
      </Link>
      <p v-if="$slots.default" :class="styles.text"><slot /></p>
      <nav v-if="$slots.links" :class="styles.links"><slot name="links" /></nav>
    </div>
  </footer>
</template>
