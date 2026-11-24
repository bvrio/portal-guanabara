<script lang="ts">
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Native select with the same field anatomy as <Input>. `placeholder` adds an
 * empty first option (value ""), e.g. "Todos". Native attributes fall through
 * to the <select>; `class` and `style` stay on the field wrapper.
 */
export interface SelectProps {
  id?: string;
  name?: string;
  label?: string;
  options: readonly SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue';

import styles from './Select.module.scss';

defineOptions({ inheritAttrs: false });

const { id, name, label, options, placeholder, disabled = false, fullWidth = false } = defineProps<SelectProps>();

const model = defineModel<string>({ default: '' });

const attrs = useAttrs();
const slots = useSlots();

const selectId = computed(() => id ?? name);
const hasLabel = computed(() => Boolean(label || slots.label));
const wrapperAttrs = computed(() => ({ class: attrs.class, style: attrs.style }));
const selectAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <div v-bind="wrapperAttrs" :class="[styles.field, fullWidth && styles.fullWidth]">
    <div :class="styles.control">
      <select
        v-bind="selectAttrs"
        :id="selectId"
        v-model="model"
        :name="name"
        :disabled="disabled"
        :class="styles.select"
      >
        <option v-if="placeholder !== undefined" value="">{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value" :disabled="option.disabled">
          {{ option.label }}
        </option>
      </select>
      <span :class="styles.chevron" aria-hidden="true" />

      <label v-if="hasLabel" :class="styles.label" :for="selectId">
        <slot name="label">{{ label }}</slot>
      </label>
    </div>
  </div>
</template>
