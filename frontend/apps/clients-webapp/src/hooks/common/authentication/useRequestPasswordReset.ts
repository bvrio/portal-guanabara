import { createOperation } from '~/lib/createOperation';
import { authenticationService, type PasswordResetRequest } from '~/services/common/authentication';

/** Hook for the `requestPasswordReset` operation of the Authentication Journey Service. */
export function useRequestPasswordReset() {
  return createOperation((request: PasswordResetRequest) =>
    authenticationService.requestPasswordReset(request),
  );
}
