import { createOperation } from '~/lib/createOperation';
import { type ChangePasswordRequest, userService } from '~/services/common/user';

/** Hook for the `changePassword` operation of the User Journey Service. */
export function useChangePassword() {
  return createOperation((request: ChangePasswordRequest) => userService.changePassword(request));
}
