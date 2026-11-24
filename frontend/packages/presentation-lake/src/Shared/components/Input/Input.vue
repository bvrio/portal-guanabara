<script lang="ts">
export type InputType = 'text' | 'email' | 'password' | 'search';

/**
 * Native input attributes (name, autocomplete, inputmode, placeholder...)
 * fall through to the <input>; `class` and `style` stay on the field wrapper.
 *
 * `label`, `hint` and `error` accept plain strings or named slots
 * (`#label`, `#hint`, `#error`) for translated / rich content.
 */
export interface InputProps {
  id?: string;
  name?: string;
  type?: InputType;
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
}
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue';

import Typography from '../../foundations/Typography/Typography.vue';

import styles from './Input.module.scss';

defineOptions({ inheritAttrs: false });

const {
  id,
  name,
  type = 'text',
  label,
  hint,
  error,
  disabled = false,
  required = false,
  fullWidth = false,
} = defineProps<InputProps>();

const model = defineModel<string>({ default: '' });

const attrs = useAttrs();
const slots = useSlots();

const inputId = computed(() => id ?? name);
const hasLabel = computed(() => Boolean(label || slots.label));
const hasError = computed(() => Boolean(error || slots.error));
const hasHint = computed(() => Boolean(hint || slots.hint));
const descriptionId = computed(() =>
  hasError.value || hasHint.value ? `${inputId.value}-description` : undefined,
);

const wrapperAttrs = computed(() => ({ class: attrs.class, style: attrs.style }));
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <div v-bind="wrapperAttrs" :class="[styles.field, fullWidth && styles.fullWidth]">
    <div :class="styles.control">
      <input
        v-bind="inputAttrs"
        :id="inputId"
        v-model="model"
        :name="name"
        :type="type"
        :required="required"
        :disabled="disabled"
        :aria-invalid="hasError || undefined"
        :aria-describedby="descriptionId"
        :class="styles.input"
      >

      <label v-if="hasLabel" :class="styles.label" :for="inputId">
        <slot name="label">{{ label }}</slot>
        <span v-if="required" aria-hidden="true"> *</span>
      </label>
    </div>

    <div v-if="hasError || hasHint" :id="descriptionId" :class="styles.description">
      <Typography v-if="hasError" variant="caption" :class="styles.error">
        <slot name="error">{{ error }}</slot>
      </Typography>
      <Typography v-else variant="caption">
        <slot name="hint">{{ hint }}</slot>
      </Typography>
    </div>
  </div>
</template>
