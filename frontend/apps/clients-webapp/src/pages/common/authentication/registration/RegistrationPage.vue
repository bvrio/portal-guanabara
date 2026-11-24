<script setup lang="ts">
import { ref } from 'vue';

import {
  Alert,
  BasicData,
  type BasicDataValues,
  FormattedMessage,
  Link,
  type MessageDescriptor,
  PageTitle,
} from '@portal-guanabara/presentation-lake';

import { useRegister } from '~/hooks/common/authentication';
import { errorCodeOf, pickErrorMessage } from '~/lib/http';
import { goToRoute, routePaths } from '~/shared/hooks/navigation';
import { useTracking } from '~/shared/hooks/tracking';

import styles from './RegistrationPage.module.scss';
import { defaultMessages } from './RegistrationPage.messages';

const tracking = useTracking();
const { execute: register, pending } = useRegister();

const error = ref<MessageDescriptor | null>(null);

async function handleSubmit(values: BasicDataValues) {
  error.value = null;

  try {
    await register(values);
    tracking.success('authentication.registration');
    await goToRoute('authenticationLogin', { registered: '1' });
  } catch (cause) {
    error.value = pickErrorMessage<MessageDescriptor>(
      cause,
      {
        EMAIL_ALREADY_REGISTERED: defaultMessages.emailAlreadyRegistered,
        PASSWORD_TOO_SHORT: defaultMessages.passwordTooShort,
        PASSWORD_MISMATCH: defaultMessages.passwordMismatch,
        VALIDATION_ERROR: defaultMessages.validationError,
      },
      defaultMessages.genericError,
    );
    tracking.error('authentication.registration', { code: errorCodeOf(cause) });
  }
}
</script>

<template>
  <main :class="styles.root">
    <div :class="styles.content">
      <header :class="styles.header">
        <PageTitle>
          <FormattedMessage v-bind="defaultMessages.title" />
        </PageTitle>
      </header>

      <Alert v-if="error" variant="error">
        <FormattedMessage v-bind="error" />
      </Alert>

      <BasicData mode="registration" :loading="pending" @submit="handleSubmit" />

      <p :class="styles.footer">
        <Link :href="routePaths.authenticationLogin">
          <FormattedMessage v-bind="defaultMessages.alreadyHaveAccount" />
        </Link>
      </p>
    </div>
  </main>
</template>
