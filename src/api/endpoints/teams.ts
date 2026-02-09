import { apiClient } from '../client'
import type {
  Team,
  TeamMember,
  CreateTeamRequest,
  UpdateTeamRequest,
  TeamInviteRequest,
  UpdateTeamMemberRoleRequest,
  PaginatedResponse,
  TeamWorkspace,
  GuardrailViolation,
  ApprovalRequest,
} from '../types'

export const teamsApi = {
  // Team CRUD
  list: (params?: { page?: number; per_page?: number; search?: string }) =>
    apiClient.get('v3/teams', { searchParams: params as Record<string, string> })
      .json<PaginatedResponse<Team>>(),

  get: (id: string) =>
    apiClient.get(`v3/teams/${id}`).json<Team>(),

  create: (data: CreateTeamRequest) =>
    apiClient.post('v3/teams', { json: data }).json<Team>(),

  update: (id: string, data: UpdateTeamRequest) =>
    apiClient.patch(`v3/teams/${id}`, { json: data }).json<Team>(),

  delete: (id: string) =>
    apiClient.delete(`v3/teams/${id}`).json<void>(),

  // Members
  listMembers: (teamId: string, params?: { page?: number; per_page?: number }) =>
    apiClient.get(`v3/teams/${teamId}/members`, { searchParams: params as Record<string, string> })
      .json<PaginatedResponse<TeamMember>>(),

  inviteMember: (teamId: string, data: TeamInviteRequest) =>
    apiClient.post(`v3/teams/${teamId}/members/invite`, { json: data }).json<TeamMember>(),

  updateMemberRole: (teamId: string, userId: string, data: UpdateTeamMemberRoleRequest) =>
    apiClient.patch(`v3/teams/${teamId}/members/${userId}/role`, { json: data }).json<TeamMember>(),

  removeMember: (teamId: string, userId: string) =>
    apiClient.delete(`v3/teams/${teamId}/members/${userId}`).json<void>(),

  // Workspace
  getWorkspace: (teamId: string) =>
    apiClient.get(`v3/teams/${teamId}/workspace`).json<TeamWorkspace>(),

  updateWorkspace: (teamId: string, data: Partial<TeamWorkspace>) =>
    apiClient.put(`v3/teams/${teamId}/workspace`, { json: data }).json<TeamWorkspace>(),

  getViolations: (teamId: string) =>
    apiClient.get(`v3/teams/${teamId}/workspace/violations`).json<GuardrailViolation[]>(),

  // Approvals
  listApprovals: (teamId: string, params?: { status?: string }) =>
    apiClient.get(`v3/teams/${teamId}/workspace/approvals`, { searchParams: params as Record<string, string> })
      .json<ApprovalRequest[]>(),

  reviewApproval: (teamId: string, approvalId: string, data: { status: 'approved' | 'rejected'; comment?: string }) =>
    apiClient.patch(`v3/teams/${teamId}/workspace/approvals/${approvalId}`, { json: data }).json<ApprovalRequest>(),
}
