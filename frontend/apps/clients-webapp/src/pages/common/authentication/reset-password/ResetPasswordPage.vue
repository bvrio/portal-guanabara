<script setup lang="ts">
import {
  Alert,
  FormattedMessage,
  Link,
  LoginForm,
  type LoginFormValues,
  PageTitle,
} from '@portal-guanabara/presentation-lake';

import { useRequestPasswordReset } from '~/hooks/common/authentication';
import { errorCodeOf } from '~/lib/http';
import { routePaths } from '~/shared/hooks/navigation';
import { useTracking } from '~/shared/hooks/tracking';

import styles from './ResetPasswordPage.module.scss';
import { defaultMessages } from './ResetPasswordPage.messages';

const tracking = useTracking();
const { execute: requestPasswordReset, pending, status } = useRequestPasswordReset();

async function handleSubmit(values: LoginFormValues) {
  try {
    await requestPasswordReset({ email: values.email });
    tracking.success('authentication.password-reset');
  } catch (cause) {
    tracking.error('authentication.password-reset', { code: errorCodeOf(cause) });
  }
}
</script>

<template>
  <main :class="styles.root">
    <div :class="styles.content">
      <PageTitle>
        <FormattedMessage v-bind="defaultMessages.title" />
      </PageTitle>

      <p :class="styles.description">
        <FormattedMessage v-bind="defaultMessages.description" />
      </p>

      <Alert v-if="status === 'success'" variant="success">
        <FormattedMessage v-bind="defaultMessages.requested" />
      </Alert>
      <Alert v-else-if="status === 'error'" variant="error">
        <FormattedMessage v-bind="defaultMessages.genericError" />
      </Alert>

      <LoginForm mode="reset-password" :loading="pending" @submit="handleSubmit" />

      <Link :href="routePaths.authenticationLogin">
        <FormattedMessage v-bind="defaultMessages.backToLogin" />
      </Link>
    </div>
  </main>
</template>
