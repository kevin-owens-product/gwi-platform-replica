// Team types

import type { SharingPermission } from './common'

export type TeamRole = 'team_admin' | 'member' | 'viewer'

export interface TeamSettings {
  allow_member_invite: boolean
  auto_share_content: boolean
  default_sharing_permission: SharingPermission
}

export interface Team {
  id: string
  name: string
  description?: string
  avatar_color?: string
  organization_id: string
  created_by: string
  created_at: string
  updated_at: string
  member_count: number
  settings: TeamSettings
}

export interface TeamMember {
  id: string
  user_id: string
  team_id: string
  name: string
  email: string
  avatar_url?: string
  team_role: TeamRole
  org_role: string
  joined_at: string
  invited_by: string
  status: 'active' | 'invited' | 'removed'
}

export interface CreateTeamRequest {
  name: string
  description?: string
  settings?: Partial<TeamSettings>
}

export interface UpdateTeamRequest {
  name?: string
  description?: string
  settings?: Partial<TeamSettings>
}

export interface TeamInviteRequest {
  email: string
  team_role: TeamRole
  message?: string
}

export interface UpdateTeamMemberRoleRequest {
  team_role: TeamRole
}
