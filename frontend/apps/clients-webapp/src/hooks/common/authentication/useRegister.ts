import { createOperation } from '~/lib/createOperation';
import { authenticationService, type RegistrationRequest } from '~/services/common/authentication';

/** Hook for the `register` operation of the Authentication Journey Service. */
export function useRegister() {
  return createOperation((request: RegistrationRequest) => authenticationService.register(request));
}
