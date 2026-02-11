import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  PaginatedResponse,
  ProjectWorkspace,
} from '../../types'
import { mockProjects, mockProjectWorkspaces, mockOrgWorkspace } from '../data/projects'
import { mockWorkspaces } from '../data/teams'
import { delay, paginate, findById, newId, now } from '../helpers'

const projects = [...mockProjects]
const workspaces = [...mockProjectWorkspaces]

function cloneWorkspace(base: ProjectWorkspace, projectId: string): ProjectWorkspace {
  return {
    ...base,
    id: newId('pws'),
    project_id: projectId,
    created_at: now(),
    updated_at: now(),
  }
}

function getBaseWorkspaceForTeam(teamId?: string): ProjectWorkspace {
  const teamWs = teamId ? mockWorkspaces.find((w) => w.team_id === teamId) : undefined
  if (teamWs) {
    return {
      id: 'template',
      project_id: 'template',
      name: teamWs.name,
      description: teamWs.description,
      context: { ...teamWs.context },
      guardrails: { ...teamWs.guardrails },
      created_at: teamWs.created_at,
      updated_at: teamWs.updated_at,
    }
  }
  return {
    id: 'template',
    project_id: 'template',
    name: mockOrgWorkspace.name,
    description: mockOrgWorkspace.description,
    context: { ...mockOrgWorkspace.context },
    guardrails: { ...mockOrgWorkspace.guardrails },
    created_at: mockOrgWorkspace.created_at,
    updated_at: mockOrgWorkspace.updated_at,
  }
}

export const projectsApi = {
  async list(params?: { page?: number; per_page?: number; search?: string; scope?: string; team_id?: string; status?: string }): Promise<PaginatedResponse<Project>> {
    await delay()
    let items = [...projects]
    if (params?.search) {
      const q = params.search.toLowerCase()
      items = items.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
    }
    if (params?.scope) {
      items = items.filter((p) => p.scope === params.scope)
    }
    if (params?.team_id) {
      items = items.filter((p) => p.team_id === params.team_id)
    }
    if (params?.status) {
      items = items.filter((p) => p.status === params.status)
    }
    return paginate(items, params)
  },

  async get(id: string): Promise<Project> {
    await delay()
    const project = findById(projects, id)
    if (!project) throw new Error(`Project ${id} not found`)
    return { ...project }
  },

  async create(data: CreateProjectRequest): Promise<Project> {
    await delay()
    const project: Project = {
      id: newId('proj'),
      name: data.name,
      description: data.description,
      scope: data.scope,
      team_id: data.scope === 'team' ? data.team_id : undefined,
      organization_id: 'org_gwi_demo',
      created_by: 'user_sarah',
      created_at: now(),
      updated_at: now(),
      status: 'active',
    }
    projects.push(project)

    const base = getBaseWorkspaceForTeam(data.scope === 'team' ? data.team_id : undefined)
    workspaces.push(cloneWorkspace(base, project.id))

    return { ...project }
  },

  async update(id: string, data: UpdateProjectRequest): Promise<Project> {
    await delay()
    const idx = projects.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error(`Project ${id} not found`)
    projects[idx] = { ...projects[idx], ...data, updated_at: now() }
    return { ...projects[idx] }
  },

  async delete(id: string): Promise<void> {
    await delay()
    const idx = projects.findIndex((p) => p.id === id)
    if (idx !== -1) projects.splice(idx, 1)
    for (let i = workspaces.length - 1; i >= 0; i--) {
      if (workspaces[i].project_id === id) workspaces.splice(i, 1)
    }
  },

  async getWorkspace(projectId: string): Promise<ProjectWorkspace> {
    await delay()
    const ws = workspaces.find((w) => w.project_id === projectId)
    if (!ws) throw new Error(`Workspace for project ${projectId} not found`)
    return { ...ws }
  },

  async updateWorkspace(projectId: string, data: Partial<ProjectWorkspace>): Promise<ProjectWorkspace> {
    await delay()
    const idx = workspaces.findIndex((w) => w.project_id === projectId)
    if (idx === -1) throw new Error(`Workspace for project ${projectId} not found`)
    workspaces[idx] = {
      ...workspaces[idx],
      ...data,
      context: { ...workspaces[idx].context, ...data.context },
      guardrails: { ...workspaces[idx].guardrails, ...data.guardrails },
      updated_at: now(),
    }
    return { ...workspaces[idx] }
  },
}
