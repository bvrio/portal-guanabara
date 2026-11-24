<script lang="ts">
export type BasicDataMode = 'view' | 'edit' | 'registration';

export interface BasicDataValues {
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  password?: string;
  passwordConfirmation?: string;
}

export interface BasicDataProps {
  mode: BasicDataMode;
  initialValues?: Partial<BasicDataValues>;
  disabled?: boolean;
  loading?: boolean;
}
</script>

<script setup lang="ts">
import { reactive } from 'vue';

import Button from '../../components/Button/Button.vue';
import Input from '../../components/Input/Input.vue';
import FormattedMessage from '../../foundations/i18n/FormattedMessage.vue';
import Typography from '../../foundations/Typography/Typography.vue';

import styles from './BasicData.module.scss';
import { defaultMessages } from './BasicData.messages';

const {
  mode,
  initialValues,
  disabled = false,
  loading = false,
} = defineProps<BasicDataProps>();

const emit = defineEmits<{
  submit: [values: BasicDataValues];
}>();

const values = reactive<BasicDataValues>({
  fullName: initialValues?.fullName ?? '',
  cpf: initialValues?.cpf ?? '',
  phone: initialValues?.phone ?? '',
  email: initialValues?.email ?? '',
  password: initialValues?.password ?? '',
  passwordConfirmation: initialValues?.passwordConfirmation ?? '',
});

const readOnlyFields = [
  { key: 'fullName', message: defaultMessages.fullName },
  { key: 'cpf', message: defaultMessages.cpf },
  { key: 'phone', message: defaultMessages.phone },
  { key: 'email', message: defaultMessages.email },
] as const;

function handleSubmit() {
  if (mode === 'view') {
    return;
  }

  if (mode === 'registration') {
    emit('submit', { ...values });
    return;
  }

  emit('submit', {
    fullName: values.fullName,
    cpf: values.cpf,
    phone: values.phone,
    email: values.email,
  });
}
</script>

<template>
  <div v-if="mode === 'view'" :class="styles.root">
    <div :class="styles.fields">
      <div v-for="field in readOnlyFields" :key="field.key" :class="styles.readOnlyField">
        <Typography variant="label">
          <FormattedMessage v-bind="field.message" />
        </Typography>
        <Typography>{{ values[field.key] || '—' }}</Typography>
      </div>
    </div>
  </div>

  <form v-else :class="styles.root" @submit.prevent="handleSubmit">
    <div :class="styles.fields">
      <Input
        id="basic-data-full-name"
        v-model="values.fullName"
        name="fullName"
        type="text"
        autocomplete="name"
        :disabled="disabled || loading"
        full-width
        required
      >
        <template #label><FormattedMessage v-bind="defaultMessages.fullName" /></template>
      </Input>

      <Input
        id="basic-data-cpf"
        v-model="values.cpf"
        name="cpf"
        type="text"
        inputmode="numeric"
        :disabled="disabled || loading"
        full-width
        required
      >
        <template #label><FormattedMessage v-bind="defaultMessages.cpf" /></template>
      </Input>

      <Input
        id="basic-data-phone"
        v-model="values.phone"
        name="phone"
        type="text"
        autocomplete="tel"
        inputmode="tel"
        :disabled="disabled || loading"
        full-width
        required
      >
        <template #label><FormattedMessage v-bind="defaultMessages.phone" /></template>
      </Input>

      <Input
        id="basic-data-email"
        v-model="values.email"
        name="email"
        type="email"
        autocomplete="email"
        :disabled="disabled || loading"
        full-width
        required
      >
        <template #label><FormattedMessage v-bind="defaultMessages.email" /></template>
      </Input>

      <template v-if="mode === 'registration'">
        <Input
          id="basic-data-password"
          v-model="values.password"
          name="password"
          type="password"
          autocomplete="new-password"
          :disabled="disabled || loading"
          full-width
          required
        >
          <template #label><FormattedMessage v-bind="defaultMessages.password" /></template>
        </Input>

        <Input
          id="basic-data-password-confirmation"
          v-model="values.passwordConfirmation"
          name="passwordConfirmation"
          type="password"
          autocomplete="new-password"
          :disabled="disabled || loading"
          full-width
          required
        >
          <template #label>
            <FormattedMessage v-bind="defaultMessages.passwordConfirmation" />
          </template>
        </Input>
      </template>
    </div>

    <Button type="submit" :disabled="disabled" :loading="loading" full-width>
      <FormattedMessage
        v-bind="mode === 'registration' ? defaultMessages.register : defaultMessages.save"
      />
    </Button>
  </form>
</template>
