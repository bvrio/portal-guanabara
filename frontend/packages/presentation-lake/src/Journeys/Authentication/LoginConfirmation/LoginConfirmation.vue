<script lang="ts">
export interface LoginConfirmationProps {
  registrationHref: string;
  forgotPasswordHref: string;
  loading?: boolean;
}
</script>

<script setup lang="ts">
import Link from '../../../Shared/components/Link/Link.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import Typography from '../../../Shared/foundations/Typography/Typography.vue';

import LoginForm, { type LoginFormValues } from './Components/LoginForm/LoginForm.vue';
import styles from './LoginConfirmation.module.scss';
import { defaultMessages } from './LoginConfirmation.messages';

const { registrationHref, forgotPasswordHref, loading = false } =
  defineProps<LoginConfirmationProps>();

const emit = defineEmits<{
  submit: [values: LoginFormValues];
}>();
</script>

<template>
  <section :class="styles.root">
    <header :class="styles.header">
      <Typography as="h1" variant="title" :class="styles.title">
        <FormattedMessage v-bind="defaultMessages.title" />
      </Typography>
    </header>

    <!-- Page-owned feedback (e.g. an <Alert> with a login error). -->
    <div v-if="$slots.feedback" :class="styles.feedback">
      <slot name="feedback" />
    </div>

    <LoginForm :loading="loading" @submit="(values) => emit('submit', values)" />

    <div :class="styles.links">
      <Link :href="forgotPasswordHref">
        <FormattedMessage v-bind="defaultMessages.forgotPassword" />
      </Link>

      <Link :href="registrationHref">
        <FormattedMessage v-bind="defaultMessages.register" />
      </Link>
    </div>
  </section>
</template>
