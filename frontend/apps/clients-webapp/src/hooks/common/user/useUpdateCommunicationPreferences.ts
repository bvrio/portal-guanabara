import { createOperation } from '~/lib/createOperation';
import { type CommunicationPreferences, userService } from '~/services/common/user';

/** Hook for the `updateCommunicationPreferences` operation of the User Journey Service. */
export function useUpdateCommunicationPreferences() {
  return createOperation((request: CommunicationPreferences) =>
    userService.updateCommunicationPreferences(request),
  );
}
