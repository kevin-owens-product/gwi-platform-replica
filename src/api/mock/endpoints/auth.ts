import type { LoginRequest, LoginResponse, SignUpRequest, User, PasswordResetRequest, PasswordResetConfirmRequest } from '../../types'
import { mockUser } from '../data/auth'
import { delay, now } from '../helpers'

let currentUser = { ...mockUser }

export const authApi = {
  async login(_data: LoginRequest): Promise<LoginResponse> {
    await delay()
    return {
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      expires_in: 3600,
      user: { ...currentUser, last_login_at: now() },
    }
  },

  async signup(_data: SignUpRequest): Promise<LoginResponse> {
    await delay()
    return {
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      expires_in: 3600,
      user: { ...currentUser, last_login_at: now() },
    }
  },

  async logout(): Promise<void> {
    await delay()
  },

  async refreshToken(_refreshToken: string): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
    await delay()
    return {
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      expires_in: 3600,
    }
  },

  async getProfile(): Promise<User> {
    await delay()
    return { ...currentUser }
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    await delay()
    currentUser = { ...currentUser, ...data }
    return { ...currentUser }
  },

  async requestPasswordReset(_data: PasswordResetRequest): Promise<void> {
    await delay()
  },

  async confirmPasswordReset(_data: PasswordResetConfirmRequest): Promise<void> {
    await delay()
  },

  async resendConfirmation(_email: string): Promise<void> {
    await delay()
  },
}
