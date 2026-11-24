import { createOperation } from '~/lib/createOperation';
import { authenticationService, type LoginRequest } from '~/services/common/authentication';

/** Hook for the `login` operation of the Authentication Journey Service. */
export function useLogin() {
  return createOperation((request: LoginRequest) => authenticationService.login(request));
}
