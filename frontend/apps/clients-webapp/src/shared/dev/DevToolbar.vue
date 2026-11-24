<script setup lang="ts">
/**
 * DEV-only toolbar (never rendered in production builds — see app.vue).
 * Switches the mock BFF persona and overrides Feature Flags locally.
 * Tooling, not product presentation: it intentionally lives outside the lake.
 */
import { nextTick, onMounted, ref, watch } from 'vue';

import { reloadNuxtApp, useCookie, useRoute } from '#imports';

import {
  FEATURE_FLAG_OVERRIDES_COOKIE,
  featureFlags,
  type FeatureFlagName,
  useFeatureFlag,
} from '~/shared/hooks/feature-flag';

import styles from './DevToolbar.module.scss';
import { type DevPersona, devSession } from './devSession';

const personas = ref<DevPersona[]>([]);
const currentAccountId = ref<string>('');
const flagNames = Object.keys(featureFlags) as FeatureFlagName[];
const flagValues = Object.fromEntries(flagNames.map((name) => [name, useFeatureFlag(name)]));
const overrides = useCookie<Partial<Record<string, boolean>> | null>(FEATURE_FLAG_OVERRIDES_COOKIE);
const collapsed = ref(false);
const route = useRoute();

async function load() {
  const [list, session] = await Promise.all([devSession.listPersonas(), devSession.getSession()]);
  personas.value = list;
  currentAccountId.value = session.accountId ?? '';
}

onMounted(load);
// Login, logout and registration change the session without a reload.
watch(() => route.fullPath, load);

async function onPersonaChange(event: Event) {
  const accountId = (event.target as HTMLSelectElement).value || null;
  await devSession.switchPersona(accountId);
  reloadNuxtApp({ force: true });
}

async function onFlagChange(name: FeatureFlagName, event: Event) {
  overrides.value = { ...(overrides.value ?? {}), [name]: (event.target as HTMLInputElement).checked };
  await nextTick(); // useCookie writes on the next flush — persist before reloading
  reloadNuxtApp({ force: true });
}

function describe(persona: DevPersona) {
  const capabilities = persona.capabilities.length ? ` · ${persona.capabilities.join(', ')}` : '';
  return `${persona.label} (${persona.userType}${capabilities})`;
}
</script>

<template>
  <aside :class="styles.root" aria-label="DEV toolbar" data-testid="dev-toolbar">
    <button
      type="button"
      :class="styles.badge"
      :aria-expanded="!collapsed"
      title="Show / hide the DEV toolbar"
      @click="collapsed = !collapsed"
    >
      DEV
    </button>

    <template v-if="!collapsed">
      <label :class="styles.field">
        Persona
        <select
          :class="styles.select"
          :value="currentAccountId"
          data-testid="dev-persona"
          @change="onPersonaChange"
        >
          <option value="">Visitante (sem login)</option>
          <option v-for="persona in personas" :key="persona.id" :value="persona.id">
            {{ describe(persona) }}
          </option>
        </select>
      </label>

      <label v-for="name in flagNames" :key="name" :class="styles.field" :title="featureFlags[name].description">
        <input
          type="checkbox"
          :checked="flagValues[name]?.value"
          :data-testid="`dev-flag-${name}`"
          @change="onFlagChange(name, $event)"
        >
        {{ name }}
      </label>
    </template>
  </aside>
</template>
