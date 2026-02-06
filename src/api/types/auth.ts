// Authentication types

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  role: UserRole
  organization_id: string
  organization_name: string
  created_at: string
  last_login_at: string
  preferences: UserPreferences
}

export type UserRole = 'admin' | 'manager' | 'analyst' | 'viewer'

export interface UserPreferences {
  default_wave_ids?: string[]
  default_location_ids?: string[]
  theme?: 'light' | 'dark'
  locale?: string
  timezone?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user: User
}

export interface SignUpRequest {
  email: string
  password: string
  name: string
  organization_name?: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirmRequest {
  token: string
  password: string
}

// Admin types
export interface OrganizationUser {
  id: string
  email: string
  name: string
  role: UserRole
  status: 'active' | 'invited' | 'disabled'
  created_at: string
  last_login_at: string
}

export interface InviteUserRequest {
  email: string
  role: UserRole
  name?: string
}

export interface UpdateUserRoleRequest {
  role: UserRole
}
