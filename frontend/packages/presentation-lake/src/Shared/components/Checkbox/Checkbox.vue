<script lang="ts">
/**
 * Boolean choice bound with v-model. Label via `label` prop or default slot.
 * Native attributes (name, aria-*) fall through to the <input>.
 */
export interface CheckboxProps {
  id: string;
  label?: string;
  disabled?: boolean;
}
</script>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';

import styles from './Checkbox.module.scss';

defineOptions({ inheritAttrs: false });

const { id, label, disabled = false } = defineProps<CheckboxProps>();

const model = defineModel<boolean>({ default: false });

const attrs = useAttrs();
const wrapperAttrs = computed(() => ({ class: attrs.class, style: attrs.style }));
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <label v-bind="wrapperAttrs" :for="id" :class="[styles.root, disabled && styles.disabled]">
    <input
      v-bind="inputAttrs"
      :id="id"
      v-model="model"
      type="checkbox"
      :disabled="disabled"
      :class="styles.input"
    >
    <span><slot>{{ label }}</slot></span>
  </label>
</template>
