import { useAsyncData } from '#imports';

import { userService } from '~/services/common/user';

/**
 * Hook for the `getUser` operation of the User Journey Service.
 * Uses Nuxt `useAsyncData`, so the data is fetched during SSR and hydrated.
 */
export function useGetUser() {
  return useAsyncData('user:get', () => userService.getUser());
}
