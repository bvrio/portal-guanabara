import { useAsyncData } from '#imports';

import { userService } from '~/services/common/user';

/** Hook for the `getCommunicationPreferences` operation of the User Journey Service. */
export function useGetCommunicationPreferences(options: { immediate?: boolean } = {}) {
  return useAsyncData('user:communication-preferences', () => userService.getCommunicationPreferences(), {
    immediate: options.immediate ?? true,
  });
}
