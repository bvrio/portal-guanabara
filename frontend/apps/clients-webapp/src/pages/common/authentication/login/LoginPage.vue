<script setup lang="ts">
import { computed, ref } from 'vue';

import { clearNuxtData, navigateTo, useRoute } from '#imports';
import {
  Alert,
  FormattedMessage,
  LoginConfirmation,
  type LoginFormValues,
  type MessageDescriptor,
} from '@portal-guanabara/presentation-lake';

import { useLogin } from '~/hooks/common/authentication';
import { errorCodeOf, pickErrorMessage } from '~/lib/http';
import { routePaths, toSafeRedirect } from '~/shared/hooks/navigation';
import { refreshSession } from '~/shared/hooks/session';
import { useTracking } from '~/shared/hooks/tracking';

import styles from './LoginPage.module.scss';
import { defaultMessages } from './LoginPage.messages';

const route = useRoute();
const tracking = useTracking();
const { execute: login, pending } = useLogin();

const error = ref<MessageDescriptor | null>(null);
const registered = computed(() => route.query.registered === '1');

async function handleSubmit(values: LoginFormValues) {
  error.value = null;

  try {
    await login(values);
    tracking.success('authentication.login');
    // Access decisions changed: drop cached Feature Management / user data.
    clearNuxtData();
    // The header's account entry shows the new session.
    await refreshSession();
    await navigateTo(toSafeRedirect(route.query.redirect) ?? routePaths.userOverview);
  } catch (cause) {
    error.value = pickErrorMessage<MessageDescriptor>(
      cause,
      { INVALID_CREDENTIALS: defaultMessages.invalidCredentials },
      defaultMessages.genericError,
    );
    tracking.error('authentication.login', { code: errorCodeOf(cause) });
  }
}
</script>

<template>
  <main :class="styles.root">
    <LoginConfirmation
      :registration-href="routePaths.authenticationRegistration"
      :forgot-password-href="routePaths.authenticationResetPassword"
      :loading="pending"
      @submit="handleSubmit"
    >
      <template v-if="error || registered" #feedback>
        <Alert v-if="error" variant="error">
          <FormattedMessage v-bind="error" />
        </Alert>
        <Alert v-else variant="success">
          <FormattedMessage v-bind="defaultMessages.registered" />
        </Alert>
      </template>
    </LoginConfirmation>
  </main>
</template>
