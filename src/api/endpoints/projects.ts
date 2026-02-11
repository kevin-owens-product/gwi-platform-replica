import { apiClient } from '../client'
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  PaginatedResponse,
  ProjectWorkspace,
} from '../types'

export const projectsApi = {
  list: (params?: { page?: number; per_page?: number; search?: string; scope?: string; team_id?: string; status?: string }) =>
    apiClient.get('v3/projects', { searchParams: params as Record<string, string> })
      .json<PaginatedResponse<Project>>(),

  get: (id: string) =>
    apiClient.get(`v3/projects/${id}`).json<Project>(),

  create: (data: CreateProjectRequest) =>
    apiClient.post('v3/projects', { json: data }).json<Project>(),

  update: (id: string, data: UpdateProjectRequest) =>
    apiClient.patch(`v3/projects/${id}`, { json: data }).json<Project>(),

  delete: (id: string) =>
    apiClient.delete(`v3/projects/${id}`).json<void>(),

  getWorkspace: (projectId: string) =>
    apiClient.get(`v3/projects/${projectId}/workspace`).json<ProjectWorkspace>(),

  updateWorkspace: (projectId: string, data: Partial<ProjectWorkspace>) =>
    apiClient.put(`v3/projects/${projectId}/workspace`, { json: data }).json<ProjectWorkspace>(),
}
