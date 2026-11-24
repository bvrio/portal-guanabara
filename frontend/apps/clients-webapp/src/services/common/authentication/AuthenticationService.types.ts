export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  authenticated: boolean;
}

export interface RegistrationRequest {
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  password?: string;
  passwordConfirmation?: string;
}

export interface PasswordResetRequest {
  email: string;
}

/** BFF error codes this Journey's Pages react to. */
export type AuthenticationErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'PASSWORD_TOO_SHORT'
  | 'PASSWORD_MISMATCH'
  | 'VALIDATION_ERROR';

/** Public HTTP facade of the Authentication Journey inside clients-webapp. */
export interface AuthenticationService {
  login(request: LoginRequest): Promise<LoginResponse>;
  logout(): Promise<void>;
  register(request: RegistrationRequest): Promise<void>;
  requestPasswordReset(request: PasswordResetRequest): Promise<void>;
}
