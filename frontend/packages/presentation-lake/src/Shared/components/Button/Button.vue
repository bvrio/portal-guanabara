<script lang="ts">
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'inverse';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Native button attributes and listeners (e.g. `@click`, `aria-*`, `name`)
 * fall through to the rendered <button>. With `href` it renders a link that
 * looks like a button (through the App's link component, like <Link>).
 * `inverse` is the outlined variant for the dark structure bands.
 */
export interface ButtonProps {
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}
</script>

<script setup lang="ts">
import { inject } from 'vue';

import { LINK_COMPONENT_KEY } from '../Link/linkComponent';
import FormattedMessage from '../../foundations/i18n/FormattedMessage.vue';

import { defaultMessages } from './Button.messages';
import styles from './Button.module.scss';

const {
  href,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
} = defineProps<ButtonProps>();

const linkComponent = inject(LINK_COMPONENT_KEY, null);
</script>

<template>
  <component
    :is="linkComponent ?? 'a'"
    v-if="href"
    :href="href"
    :class="[styles.root, styles[variant], styles[size], fullWidth && styles.fullWidth]"
  >
    <slot />
  </component>
  <button
    v-else
    :type="type"
    :class="[
      styles.root,
      styles[variant],
      styles[size],
      fullWidth && styles.fullWidth,
      loading && styles.loading,
    ]"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <FormattedMessage v-if="loading" v-bind="defaultMessages.loading" />
    <slot v-else />
  </button>
</template>
