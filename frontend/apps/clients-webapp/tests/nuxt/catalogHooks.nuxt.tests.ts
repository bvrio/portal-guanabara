import { describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';

import { mountSuspended } from '@nuxt/test-utils/runtime';

import { useGetCatalogEntry, useGetCatalogOverview, useListCatalogEntries } from '~/hooks/common/catalog';
import { errorCodeOf } from '~/lib/http';

import { registerCatalogEndpoints } from './catalogEndpoints';

registerCatalogEndpoints([36, 999]);

async function flush() {
  for (let i = 0; i < 5; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10));
    await nextTick();
  }
}

describe('Catalog Hooks (Nuxt runtime)', () => {
  it('useGetCatalogOverview reads /api/catalog/overview', async () => {
    const wrapper = await mountSuspended(
      defineComponent({
        async setup() {
          const { data } = await useGetCatalogOverview();
          return () => h('p', `${data.value?.totals.entries}/${data.value?.totals.projects}/${data.value?.totals.studies}`);
        },
      }),
    );

    const [entries, projects, studies] = wrapper.text().split('/').map(Number);
    expect(entries).toBeGreaterThan(0);
    expect(projects! + studies!).toBe(entries);
  });

  it('useListCatalogEntries fetches again when the query changes', async () => {
    const query = ref<{ kind?: 'project' | 'study' }>({});
    const wrapper = await mountSuspended(
      defineComponent({
        async setup() {
          const { data } = await useListCatalogEntries(query);
          return () => h('p', `${data.value?.query.kind ?? 'all'}:${data.value?.total ?? '-'}`);
        },
      }),
    );

    const [, all] = wrapper.text().split(':');
    query.value = { kind: 'study' };
    await flush();
    const [kind, studies] = wrapper.text().split(':');

    expect(kind).toBe('study');
    expect(Number(studies)).toBeLessThan(Number(all));
  });

  it('useGetCatalogEntry exposes the not-found code', async () => {
    const wrapper = await mountSuspended(
      defineComponent({
        async setup() {
          const found = await useGetCatalogEntry(36);
          const missing = await useGetCatalogEntry(999);
          return () => h('p', `${found.data.value?.ref}|${errorCodeOf(missing.error.value)}`);
        },
      }),
    );

    expect(wrapper.text()).toBe('36|CATALOG_ENTRY_NOT_FOUND');
  });

  it('person names stay on the server while the flag is off (default outside nuxt dev)', async () => {
    const wrapper = await mountSuspended(
      defineComponent({
        async setup() {
          const { data } = await useGetCatalogEntry(36);
          const persons = data.value?.parties.flatMap((group) => group.parties).filter((party) => party.kind === 'person');
          return () => h('p', `${persons?.length}|${data.value?.personsHidden}`);
        },
      }),
    );

    expect(wrapper.text()).toBe('0|true');
  });
});
