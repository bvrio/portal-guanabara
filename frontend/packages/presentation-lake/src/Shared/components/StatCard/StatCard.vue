<script lang="ts">
/**
 * Stat tile: one figure and what it counts. Numbers are formatted for the
 * current locale (1.284 in pt-BR); `label` and `hint` accept named slots.
 *
 * Interactive (v0.6): with `href` the whole tile is a link; with `selectable`
 * it is a button that emits `select`. The `action` slot names what happens
 * ("Ver as ativas") on a footer line with an arrow.
 */
export interface StatCardProps {
  value: number | string;
  label?: string;
  hint?: string;
  href?: string;
  selectable?: boolean;
}
</script>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { useIntl } from 'vue-intl';

import Icon from '../../foundations/Icon/Icon.vue';
import Link from '../Link/Link.vue';

import styles from './StatCard.module.scss';

const { value, label, hint, href, selectable = false } = defineProps<StatCardProps>();

const emit = defineEmits<{ select: [] }>();

const intl = useIntl();
const slots = useSlots();
const formatted = computed(() => (typeof value === 'number' ? intl.formatNumber(value) : value));
const hasHint = computed(() => Boolean(hint || slots.hint));
const interactive = computed(() => Boolean(href) || selectable);
const tag = computed(() => (href ? Link : selectable ? 'button' : 'div'));
</script>

<template>
  <component
    :is="tag"
    :class="[styles.root, interactive && styles.interactive, $slots.icon && styles.withIcon]"
    :href="href || undefined"
    :type="!href && selectable ? 'button' : undefined"
    @click="!href && selectable ? emit('select') : undefined"
  >
    <span v-if="$slots.icon" :class="styles.icon"><slot name="icon" /></span>
    <span :class="styles.value">{{ formatted }}</span>
    <span :class="styles.label">
      <slot name="label">{{ label }}</slot>
    </span>
    <span v-if="hasHint" :class="styles.hint">
      <slot name="hint">{{ hint }}</slot>
    </span>
    <span v-if="$slots.action" :class="styles.action">
      <slot name="action" />
      <Icon name="arrow-right" size="sm" :class="styles.arrow" />
    </span>
  </component>
</template>
