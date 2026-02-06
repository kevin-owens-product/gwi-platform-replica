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
    apiClient.post('auth/login', { json: data }).json<LoginResponse>(),

  signup: (data: SignUpRequest) =>
    apiClient.post('auth/signup', { json: data }).json<LoginResponse>(),

  logout: () =>
    apiClient.post('auth/logout').json<void>(),

  refreshToken: (refreshToken: string) =>
    apiClient.post('auth/refresh', { json: { refresh_token: refreshToken } })
      .json<{ access_token: string; refresh_token: string; expires_in: number }>(),

  getProfile: () =>
    apiClient.get('auth/me').json<User>(),

  updateProfile: (data: Partial<User>) =>
    apiClient.patch('auth/me', { json: data }).json<User>(),

  requestPasswordReset: (data: PasswordResetRequest) =>
    apiClient.post('auth/password-reset', { json: data }).json<void>(),

  confirmPasswordReset: (data: PasswordResetConfirmRequest) =>
    apiClient.post('auth/password-reset/confirm', { json: data }).json<void>(),

  resendConfirmation: (email: string) =>
    apiClient.post('auth/resend-confirmation', { json: { email } }).json<void>(),
}
