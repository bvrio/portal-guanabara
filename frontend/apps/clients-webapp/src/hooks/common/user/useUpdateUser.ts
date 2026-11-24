import { createOperation } from '~/lib/createOperation';
import { type UpdateUserRequest, userService } from '~/services/common/user';

/** Hook for the `updateUser` operation of the User Journey Service. */
export function useUpdateUser() {
  return createOperation((request: UpdateUserRequest) => userService.updateUser(request));
}
