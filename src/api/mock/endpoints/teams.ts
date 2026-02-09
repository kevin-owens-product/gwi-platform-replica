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
} from '../../types'
import { mockTeams, mockTeamMembers, mockWorkspaces, mockViolations, mockApprovals } from '../data/teams'
import { delay, paginate, findById, newId, now } from '../helpers'

const teams = [...mockTeams]
const members = [...mockTeamMembers]
const workspaces = [...mockWorkspaces]
const violations = [...mockViolations]
const approvals = [...mockApprovals]

export const teamsApi = {
  // Team CRUD
  async list(params?: { page?: number; per_page?: number; search?: string }): Promise<PaginatedResponse<Team>> {
    await delay()
    return paginate(teams, params)
  },

  async get(id: string): Promise<Team> {
    await delay()
    const team = findById(teams, id)
    if (!team) throw new Error(`Team ${id} not found`)
    return { ...team }
  },

  async create(data: CreateTeamRequest): Promise<Team> {
    await delay()
    const team: Team = {
      id: newId('team'),
      name: data.name,
      description: data.description,
      avatar_color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      organization_id: 'org_gwi_demo',
      created_by: 'user_sarah',
      created_at: now(),
      updated_at: now(),
      member_count: 1,
      settings: {
        allow_member_invite: data.settings?.allow_member_invite ?? true,
        auto_share_content: data.settings?.auto_share_content ?? false,
        default_sharing_permission: data.settings?.default_sharing_permission ?? 'view',
      },
    }
    teams.push(team)

    // Auto-add creator as team_admin
    members.push({
      id: newId('tm'),
      user_id: 'user_sarah',
      team_id: team.id,
      name: 'Sarah Chen',
      email: 'sarah.chen@globalwebindex.com',
      team_role: 'team_admin',
      org_role: 'admin',
      joined_at: now(),
      invited_by: 'user_sarah',
      status: 'active',
    })

    return { ...team }
  },

  async update(id: string, data: UpdateTeamRequest): Promise<Team> {
    await delay()
    const idx = teams.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error(`Team ${id} not found`)
    teams[idx] = {
      ...teams[idx],
      ...data,
      settings: { ...teams[idx].settings, ...data.settings },
      updated_at: now(),
    }
    return { ...teams[idx] }
  },

  async delete(id: string): Promise<void> {
    await delay()
    const idx = teams.findIndex((t) => t.id === id)
    if (idx !== -1) teams.splice(idx, 1)
    // Remove associated members
    for (let i = members.length - 1; i >= 0; i--) {
      if (members[i].team_id === id) members.splice(i, 1)
    }
  },

  // Members
  async listMembers(teamId: string, params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<TeamMember>> {
    await delay()
    const teamMembers = members.filter((m) => m.team_id === teamId && m.status !== 'removed')
    return paginate(teamMembers, params)
  },

  async inviteMember(teamId: string, data: TeamInviteRequest): Promise<TeamMember> {
    await delay()
    const member: TeamMember = {
      id: newId('tm'),
      user_id: newId('user'),
      team_id: teamId,
      name: data.email.split('@')[0],
      email: data.email,
      team_role: data.team_role,
      org_role: 'analyst',
      joined_at: now(),
      invited_by: 'user_sarah',
      status: 'invited',
    }
    members.push(member)

    // Update team member count
    const teamIdx = teams.findIndex((t) => t.id === teamId)
    if (teamIdx !== -1) {
      teams[teamIdx] = { ...teams[teamIdx], member_count: teams[teamIdx].member_count + 1 }
    }

    return { ...member }
  },

  async updateMemberRole(teamId: string, userId: string, data: UpdateTeamMemberRoleRequest): Promise<TeamMember> {
    await delay()
    const idx = members.findIndex((m) => m.team_id === teamId && m.user_id === userId)
    if (idx === -1) throw new Error(`Member not found`)
    members[idx] = { ...members[idx], team_role: data.team_role }
    return { ...members[idx] }
  },

  async removeMember(teamId: string, userId: string): Promise<void> {
    await delay()
    const idx = members.findIndex((m) => m.team_id === teamId && m.user_id === userId)
    if (idx !== -1) {
      members.splice(idx, 1)
      const teamIdx = teams.findIndex((t) => t.id === teamId)
      if (teamIdx !== -1) {
        teams[teamIdx] = { ...teams[teamIdx], member_count: Math.max(0, teams[teamIdx].member_count - 1) }
      }
    }
  },

  // Workspace
  async getWorkspace(teamId: string): Promise<TeamWorkspace> {
    await delay()
    const ws = workspaces.find((w) => w.team_id === teamId)
    if (!ws) throw new Error(`Workspace for team ${teamId} not found`)
    return { ...ws }
  },

  async updateWorkspace(teamId: string, data: Partial<TeamWorkspace>): Promise<TeamWorkspace> {
    await delay()
    const idx = workspaces.findIndex((w) => w.team_id === teamId)
    if (idx === -1) throw new Error(`Workspace for team ${teamId} not found`)
    workspaces[idx] = {
      ...workspaces[idx],
      ...data,
      context: { ...workspaces[idx].context, ...data.context },
      guardrails: { ...workspaces[idx].guardrails, ...data.guardrails },
      updated_at: now(),
    }
    return { ...workspaces[idx] }
  },

  async getViolations(teamId: string): Promise<GuardrailViolation[]> {
    await delay()
    // Return violations (in a real app these would be filtered by team)
    return violations.map((v) => ({ ...v }))
  },

  // Approvals
  async listApprovals(teamId: string, params?: { status?: string }): Promise<ApprovalRequest[]> {
    await delay()
    let items = approvals.filter((a) => a.team_id === teamId)
    if (params?.status) {
      items = items.filter((a) => a.status === params.status)
    }
    return items.map((a) => ({ ...a }))
  },

  async reviewApproval(teamId: string, approvalId: string, data: { status: 'approved' | 'rejected'; comment?: string }): Promise<ApprovalRequest> {
    await delay()
    const idx = approvals.findIndex((a) => a.id === approvalId && a.team_id === teamId)
    if (idx === -1) throw new Error(`Approval ${approvalId} not found`)
    approvals[idx] = {
      ...approvals[idx],
      status: data.status,
      reviewed_by: 'user_sarah',
      reviewed_by_name: 'Sarah Chen',
      reviewed_at: now(),
      review_comment: data.comment,
    }
    return { ...approvals[idx] }
  },
}
