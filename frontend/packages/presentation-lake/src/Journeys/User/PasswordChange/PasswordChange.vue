<script lang="ts">
export interface PasswordChangeValues {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

/**
 * Password change form. Password rules are business rules owned by the BFF;
 * the Page shows its errors through the `feedback` slot and may pass a
 * translated rule description through the `hint` slot.
 */
export interface PasswordChangeProps {
  loading?: boolean;
  disabled?: boolean;
}
</script>

<script setup lang="ts">
import { reactive } from 'vue';

import Button from '../../../Shared/components/Button/Button.vue';
import Input from '../../../Shared/components/Input/Input.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';

import { defaultMessages } from './PasswordChange.messages';
import styles from './PasswordChange.module.scss';

const { loading = false, disabled = false } = defineProps<PasswordChangeProps>();

const emit = defineEmits<{
  submit: [values: PasswordChangeValues];
}>();

const values = reactive<PasswordChangeValues>({
  currentPassword: '',
  newPassword: '',
  newPasswordConfirmation: '',
});
</script>

<template>
  <form :class="styles.root" @submit.prevent="emit('submit', { ...values })">
    <slot name="feedback" />

    <Input
      id="password-change-current"
      v-model="values.currentPassword"
      name="currentPassword"
      type="password"
      autocomplete="current-password"
      :disabled="disabled || loading"
      full-width
      required
    >
      <template #label><FormattedMessage v-bind="defaultMessages.currentPassword" /></template>
    </Input>

    <Input
      id="password-change-new"
      v-model="values.newPassword"
      name="newPassword"
      type="password"
      autocomplete="new-password"
      :disabled="disabled || loading"
      full-width
      required
    >
      <template #label><FormattedMessage v-bind="defaultMessages.newPassword" /></template>
      <template v-if="$slots.hint" #hint><slot name="hint" /></template>
    </Input>

    <Input
      id="password-change-confirmation"
      v-model="values.newPasswordConfirmation"
      name="newPasswordConfirmation"
      type="password"
      autocomplete="new-password"
      :disabled="disabled || loading"
      full-width
      required
    >
      <template #label><FormattedMessage v-bind="defaultMessages.newPasswordConfirmation" /></template>
    </Input>

    <Button type="submit" variant="secondary" :disabled="disabled" :loading="loading">
      <FormattedMessage v-bind="defaultMessages.submit" />
    </Button>
  </form>
</template>
