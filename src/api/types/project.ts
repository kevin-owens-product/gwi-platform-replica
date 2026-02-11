// Project types

export type ProjectScope = 'team' | 'org'
export type ProjectStatus = 'active' | 'archived'

export interface Project {
  id: string
  name: string
  description?: string
  scope: ProjectScope
  team_id?: string
  organization_id: string
  created_by: string
  created_at: string
  updated_at: string
  status: ProjectStatus
}

export interface CreateProjectRequest {
  name: string
  description?: string
  scope: ProjectScope
  team_id?: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  status?: ProjectStatus
}
