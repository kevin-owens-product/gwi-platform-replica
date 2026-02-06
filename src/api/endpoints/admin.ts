import { apiClient } from '../client'
import type {
  OrganizationUser,
  InviteUserRequest,
  UpdateUserRoleRequest,
  PaginatedResponse,
} from '../types'

export const adminApi = {
  // User management
  listUsers: (params?: { page?: number; per_page?: number; search?: string; status?: string }) =>
    apiClient.get('admin/users', { searchParams: params as Record<string, string> })
      .json<PaginatedResponse<OrganizationUser>>(),

  getUser: (id: string) =>
    apiClient.get(`admin/users/${id}`).json<OrganizationUser>(),

  inviteUser: (data: InviteUserRequest) =>
    apiClient.post('admin/users/invite', { json: data }).json<OrganizationUser>(),

  updateUserRole: (id: string, data: UpdateUserRoleRequest) =>
    apiClient.patch(`admin/users/${id}/role`, { json: data }).json<OrganizationUser>(),

  disableUser: (id: string) =>
    apiClient.post(`admin/users/${id}/disable`).json<void>(),

  enableUser: (id: string) =>
    apiClient.post(`admin/users/${id}/enable`).json<void>(),

  removeUser: (id: string) =>
    apiClient.delete(`admin/users/${id}`).json<void>(),

  resendInvite: (id: string) =>
    apiClient.post(`admin/users/${id}/resend-invite`).json<void>(),

  // Usage & analytics
  getUsageStats: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get('admin/usage', { searchParams: params as Record<string, string> })
      .json<{
        total_queries: number
        active_users: number
        api_calls: number
        storage_used_mb: number
      }>(),
}
