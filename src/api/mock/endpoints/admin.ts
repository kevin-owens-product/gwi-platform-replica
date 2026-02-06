import type { OrganizationUser, InviteUserRequest, UpdateUserRoleRequest, PaginatedResponse } from '../../types'
import { mockOrgUsers, mockUsageStats } from '../data/admin'
import { delay, paginate, findById, newId, now } from '../helpers'

const orgUsers = [...mockOrgUsers]

export const adminApi = {
  async listUsers(params?: { page?: number; per_page?: number; search?: string; status?: string }): Promise<PaginatedResponse<OrganizationUser>> {
    await delay()
    let items = [...orgUsers]
    if (params?.status) items = items.filter((u) => u.status === params.status)
    return paginate(items, params)
  },

  async getUser(id: string): Promise<OrganizationUser> {
    await delay()
    const u = findById(orgUsers, id)
    if (!u) throw new Error(`User ${id} not found`)
    return { ...u }
  },

  async inviteUser(data: InviteUserRequest): Promise<OrganizationUser> {
    await delay()
    const user: OrganizationUser = {
      id: newId('user'),
      email: data.email,
      name: data.name ?? data.email.split('@')[0],
      role: data.role,
      status: 'invited',
      created_at: now(),
      last_login_at: now(),
    }
    orgUsers.push(user)
    return { ...user }
  },

  async updateUserRole(id: string, data: UpdateUserRoleRequest): Promise<OrganizationUser> {
    await delay()
    const idx = orgUsers.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error(`User ${id} not found`)
    orgUsers[idx] = { ...orgUsers[idx], role: data.role }
    return { ...orgUsers[idx] }
  },

  async disableUser(id: string): Promise<void> {
    await delay()
    const idx = orgUsers.findIndex((u) => u.id === id)
    if (idx !== -1) orgUsers[idx] = { ...orgUsers[idx], status: 'disabled' }
  },

  async enableUser(id: string): Promise<void> {
    await delay()
    const idx = orgUsers.findIndex((u) => u.id === id)
    if (idx !== -1) orgUsers[idx] = { ...orgUsers[idx], status: 'active' }
  },

  async removeUser(id: string): Promise<void> {
    await delay()
    const idx = orgUsers.findIndex((u) => u.id === id)
    if (idx !== -1) orgUsers.splice(idx, 1)
  },

  async resendInvite(_id: string): Promise<void> {
    await delay()
  },

  async getUsageStats(_params?: { start_date?: string; end_date?: string }): Promise<{ total_queries: number; active_users: number; api_calls: number; storage_used_mb: number }> {
    await delay()
    return { ...mockUsageStats }
  },
}
