import { apiClient } from '../client'
import type {
  Dashboard,
  CreateDashboardRequest,
  UpdateDashboardRequest,
  PaginatedResponse,
} from '../types'

export const dashboardsApi = {
  list: (params?: { page?: number; per_page?: number; search?: string }) =>
    apiClient.get('dashboards', { searchParams: params as Record<string, string> })
      .json<PaginatedResponse<Dashboard>>(),

  get: (id: string) =>
    apiClient.get(`dashboards/${id}`).json<Dashboard>(),

  create: (data: CreateDashboardRequest) =>
    apiClient.post('dashboards', { json: data }).json<Dashboard>(),

  update: (id: string, data: UpdateDashboardRequest) =>
    apiClient.patch(`dashboards/${id}`, { json: data }).json<Dashboard>(),

  delete: (id: string) =>
    apiClient.delete(`dashboards/${id}`).json<void>(),
}
