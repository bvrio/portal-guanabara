<script lang="ts">
export interface CommunicationPreferencesValues {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

export interface CommunicationPreferencesProps {
  initialValues: CommunicationPreferencesValues;
  loading?: boolean;
  disabled?: boolean;
}
</script>

<script setup lang="ts">
import { reactive } from 'vue';

import Button from '../../../Shared/components/Button/Button.vue';
import Checkbox from '../../../Shared/components/Checkbox/Checkbox.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';

import { defaultMessages } from './CommunicationPreferences.messages';
import styles from './CommunicationPreferences.module.scss';

const { initialValues, loading = false, disabled = false } = defineProps<CommunicationPreferencesProps>();

const emit = defineEmits<{
  submit: [values: CommunicationPreferencesValues];
}>();

const values = reactive<CommunicationPreferencesValues>({ ...initialValues });

const channels = ['email', 'sms', 'whatsapp'] as const;
</script>

<template>
  <form :class="styles.root" @submit.prevent="emit('submit', { ...values })">
    <slot name="feedback" />

    <p :class="styles.description">
      <FormattedMessage v-bind="defaultMessages.description" />
    </p>

    <div :class="styles.options">
      <Checkbox
        v-for="channel in channels"
        :id="`communication-preferences-${channel}`"
        :key="channel"
        v-model="values[channel]"
        :name="channel"
        :disabled="disabled || loading"
      >
        <FormattedMessage v-bind="defaultMessages[channel]" />
      </Checkbox>
    </div>

    <Button type="submit" variant="secondary" :disabled="disabled" :loading="loading">
      <FormattedMessage v-bind="defaultMessages.submit" />
    </Button>
  </form>
</template>
