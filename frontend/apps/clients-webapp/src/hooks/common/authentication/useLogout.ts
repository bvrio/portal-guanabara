import { createOperation } from '~/lib/createOperation';
import { authenticationService } from '~/services/common/authentication';

/** Hook for the `logout` operation of the Authentication Journey Service. */
export function useLogout() {
  return createOperation(() => authenticationService.logout());
}
