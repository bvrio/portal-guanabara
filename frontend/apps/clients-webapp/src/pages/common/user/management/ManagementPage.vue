<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { useRoute } from '#imports';
import {
  Alert,
  BasicData,
  type BasicDataValues,
  CommunicationPreferences,
  type CommunicationPreferencesValues,
  FormattedMessage,
  Link,
  type MessageDescriptor,
  PageTitle,
  PasswordChange,
  type PasswordChangeValues,
} from '@portal-guanabara/presentation-lake';

import {
  useChangePassword,
  useGetCommunicationPreferences,
  useGetUser,
  useUpdateCommunicationPreferences,
  useUpdateUser,
} from '~/hooks/common/user';
import { errorCodeOf, pickErrorMessage } from '~/lib/http';
import { useFeatureManagement } from '~/shared/hooks/feature-management';
import { goToJourneyDenied, routePaths } from '~/shared/hooks/navigation';
import { useTracking } from '~/shared/hooks/tracking';

import styles from './ManagementPage.module.scss';
import { defaultMessages } from './ManagementPage.messages';

type Feedback = { variant: 'success' | 'error'; message: MessageDescriptor } | null;

const route = useRoute();
const tracking = useTracking();

// ── Access decisions (BFF) ─────────────────────────────────────────────
const userAccess = await useFeatureManagement('user');
if (!userAccess.granted.value) {
  await goToJourneyDenied(userAccess.reason.value, route.fullPath);
}

const canEditProfile = computed(() => userAccess.isFeatureEnabled('user.profile-edit'));
const canChangePassword = computed(() => userAccess.isFeatureEnabled('user.change-password'));
const canManagePreferences = computed(() => userAccess.isFeatureEnabled('user.communication-preferences'));

// ── Data (Page → Hook → Service → BFF) ─────────────────────────────────
const [{ data: user, error: userError }, { data: preferences }] = await Promise.all([
  useGetUser(),
  useGetCommunicationPreferences({ immediate: canManagePreferences.value }),
]);

const { execute: updateUser, pending: savingProfile } = useUpdateUser();
const { execute: changePassword, pending: changingPassword } = useChangePassword();
const { execute: updatePreferences, pending: savingPreferences } = useUpdateCommunicationPreferences();

const profileFeedback = ref<Feedback>(null);
const passwordFeedback = ref<Feedback>(null);
const preferencesFeedback = ref<Feedback>(null);
const passwordFormKey = ref(0);

const errorMessages: Record<string, MessageDescriptor> = {
  INVALID_CURRENT_PASSWORD: defaultMessages.invalidCurrentPassword,
  PASSWORD_TOO_SHORT: defaultMessages.passwordTooShort,
  PASSWORD_MISMATCH: defaultMessages.passwordMismatch,
  EMAIL_ALREADY_REGISTERED: defaultMessages.emailAlreadyRegistered,
  VALIDATION_ERROR: defaultMessages.validationError,
};

function failure(action: string, cause: unknown): Feedback {
  tracking.error(action, { code: errorCodeOf(cause) });
  return { variant: 'error', message: pickErrorMessage<MessageDescriptor>(cause, errorMessages, defaultMessages.genericError) };
}

onMounted(() => {
  if (canEditProfile.value) tracking.featureExposure('user.profile-edit');
  if (canChangePassword.value) tracking.featureExposure('user.change-password');
  if (canManagePreferences.value) tracking.featureExposure('user.communication-preferences');
});

async function handleProfileSubmit(values: BasicDataValues) {
  profileFeedback.value = null;
  try {
    user.value = await updateUser({
      fullName: values.fullName,
      cpf: values.cpf,
      phone: values.phone,
      email: values.email,
    });
    profileFeedback.value = { variant: 'success', message: defaultMessages.profileSaved };
    tracking.success('user.profile-edit');
  } catch (cause) {
    profileFeedback.value = failure('user.profile-edit', cause);
  }
}

async function handlePasswordSubmit(values: PasswordChangeValues) {
  passwordFeedback.value = null;
  try {
    await changePassword(values);
    passwordFormKey.value += 1; // clears the form
    passwordFeedback.value = { variant: 'success', message: defaultMessages.passwordChanged };
    tracking.success('user.change-password');
  } catch (cause) {
    passwordFeedback.value = failure('user.change-password', cause);
  }
}

async function handlePreferencesSubmit(values: CommunicationPreferencesValues) {
  preferencesFeedback.value = null;
  try {
    preferences.value = await updatePreferences(values);
    preferencesFeedback.value = { variant: 'success', message: defaultMessages.preferencesSaved };
    tracking.success('user.communication-preferences');
  } catch (cause) {
    preferencesFeedback.value = failure('user.communication-preferences', cause);
  }
}
</script>

<template>
  <main :class="styles.root">
    <div :class="styles.content">
      <PageTitle>
        <FormattedMessage v-bind="defaultMessages.title" />
      </PageTitle>

      <Alert v-if="userError" variant="error">
        <FormattedMessage v-bind="defaultMessages.loadError" />
      </Alert>

      <section v-if="canEditProfile && user" :class="styles.section" data-feature="user.profile-edit">
        <h2 :class="styles.sectionTitle">
          <FormattedMessage v-bind="defaultMessages.profileTitle" />
        </h2>
        <Alert v-if="profileFeedback" :variant="profileFeedback.variant">
          <FormattedMessage v-bind="profileFeedback.message" />
        </Alert>
        <BasicData
          :key="user.email"
          mode="edit"
          :initial-values="user"
          :loading="savingProfile"
          @submit="handleProfileSubmit"
        />
      </section>

      <section v-if="canChangePassword" :class="styles.section" data-feature="user.change-password">
        <h2 :class="styles.sectionTitle">
          <FormattedMessage v-bind="defaultMessages.passwordTitle" />
        </h2>
        <PasswordChange :key="passwordFormKey" :loading="changingPassword" @submit="handlePasswordSubmit">
          <template v-if="passwordFeedback" #feedback>
            <Alert :variant="passwordFeedback.variant">
              <FormattedMessage v-bind="passwordFeedback.message" />
            </Alert>
          </template>
          <template #hint>
            <FormattedMessage v-bind="defaultMessages.passwordHint" />
          </template>
        </PasswordChange>
      </section>

      <section
        v-if="canManagePreferences && preferences"
        :class="styles.section"
        data-feature="user.communication-preferences"
      >
        <h2 :class="styles.sectionTitle">
          <FormattedMessage v-bind="defaultMessages.preferencesTitle" />
        </h2>
        <CommunicationPreferences
          :initial-values="preferences"
          :loading="savingPreferences"
          @submit="handlePreferencesSubmit"
        >
          <template v-if="preferencesFeedback" #feedback>
            <Alert :variant="preferencesFeedback.variant">
              <FormattedMessage v-bind="preferencesFeedback.message" />
            </Alert>
          </template>
        </CommunicationPreferences>
      </section>

      <Link :href="routePaths.userOverview">
        <FormattedMessage v-bind="defaultMessages.backToOverview" />
      </Link>
    </div>
  </main>
</template>
