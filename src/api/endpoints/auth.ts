import { apiClient } from '../client'
import type {
  LoginRequest,
  LoginResponse,
  SignUpRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  User,
} from '../types'

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post('v3/auth/login', { json: data }).json<LoginResponse>(),

  signup: (data: SignUpRequest) =>
    apiClient.post('v3/auth/signup', { json: data }).json<LoginResponse>(),

  logout: () =>
    apiClient.post('v3/auth/logout').json<void>(),

  refreshToken: (refreshToken: string) =>
    apiClient.post('v3/auth/refresh', { json: { refresh_token: refreshToken } })
      .json<{ access_token: string; refresh_token: string; expires_in: number }>(),

  getProfile: () =>
    apiClient.get('v3/auth/me').json<User>(),

  updateProfile: (data: Partial<User>) =>
    apiClient.patch('v3/auth/me', { json: data }).json<User>(),

  requestPasswordReset: (data: PasswordResetRequest) =>
    apiClient.post('v3/auth/password-reset', { json: data }).json<void>(),

  confirmPasswordReset: (data: PasswordResetConfirmRequest) =>
    apiClient.post('v3/auth/password-reset/confirm', { json: data }).json<void>(),

  resendConfirmation: (email: string) =>
    apiClient.post('v3/auth/resend-confirmation', { json: { email } }).json<void>(),
}
