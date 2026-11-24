export interface User {
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
}

export type UpdateUserRequest = User;

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

export interface CommunicationPreferences {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

/** BFF error codes this Journey's Pages react to. */
export type UserErrorCode =
  | 'INVALID_CURRENT_PASSWORD'
  | 'PASSWORD_TOO_SHORT'
  | 'PASSWORD_MISMATCH'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN';

/** Public HTTP facade of the User Journey inside clients-webapp. */
export interface UserService {
  getUser(): Promise<User>;
  updateUser(request: UpdateUserRequest): Promise<User>;
  changePassword(request: ChangePasswordRequest): Promise<void>;
  getCommunicationPreferences(): Promise<CommunicationPreferences>;
  updateCommunicationPreferences(request: CommunicationPreferences): Promise<CommunicationPreferences>;
}
