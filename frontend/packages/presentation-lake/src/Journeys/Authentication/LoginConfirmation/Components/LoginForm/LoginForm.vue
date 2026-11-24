<script lang="ts">
/**
 * Two-field credential form reused by Authentication pages.
 * `reset-password` mode renders only the e-mail field.
 */
export type LoginFormMode = 'login' | 'reset-password';

export interface LoginFormValues {
  email: string;
  password?: string;
}

export interface LoginFormProps {
  mode?: LoginFormMode;
  loading?: boolean;
  disabled?: boolean;
}
</script>

<script setup lang="ts">
import { ref } from 'vue';

import Button from '../../../../../Shared/components/Button/Button.vue';
import Input from '../../../../../Shared/components/Input/Input.vue';
import FormattedMessage from '../../../../../Shared/foundations/i18n/FormattedMessage.vue';

import styles from './LoginForm.module.scss';
import { defaultMessages } from './LoginForm.messages';

const { mode = 'login', loading = false, disabled = false } = defineProps<LoginFormProps>();

const emit = defineEmits<{
  submit: [values: LoginFormValues];
}>();

const email = ref('');
const password = ref('');

function handleSubmit() {
  emit('submit', mode === 'login'
    ? { email: email.value, password: password.value }
    : { email: email.value });
}
</script>

<template>
  <form :class="styles.root" @submit.prevent="handleSubmit">
    <Input
      id="login-email"
      v-model="email"
      name="email"
      type="email"
      autocomplete="email"
      :disabled="disabled || loading"
      full-width
      required
    >
      <template #label><FormattedMessage v-bind="defaultMessages.emailLabel" /></template>
    </Input>

    <Input
      v-if="mode === 'login'"
      id="login-password"
      v-model="password"
      name="password"
      type="password"
      autocomplete="current-password"
      :disabled="disabled || loading"
      full-width
      required
    >
      <template #label><FormattedMessage v-bind="defaultMessages.passwordLabel" /></template>
    </Input>

    <Button type="submit" :disabled="disabled" :loading="loading" full-width>
      <FormattedMessage
        v-bind="mode === 'login' ? defaultMessages.submit : defaultMessages.resetPasswordSubmit"
      />
    </Button>
  </form>
</template>
