import { apiClient } from '../client'
import type {
  Dashboard,
  CreateDashboardRequest,
  UpdateDashboardRequest,
  PaginatedResponse,
  DashboardListParams,
} from '../types'

export const dashboardsApi = {
  list: (params?: DashboardListParams) =>
    apiClient.get('v3/dashboards', { searchParams: params as Record<string, string> })
      .json<PaginatedResponse<Dashboard>>(),

  get: (id: string) =>
    apiClient.get(`v3/dashboards/${id}`).json<Dashboard>(),

  create: (data: CreateDashboardRequest) =>
    apiClient.post('v3/dashboards', { json: data }).json<Dashboard>(),

  update: (id: string, data: UpdateDashboardRequest) =>
    apiClient.patch(`v3/dashboards/${id}`, { json: data }).json<Dashboard>(),

  delete: (id: string) =>
    apiClient.delete(`v3/dashboards/${id}`).json<void>(),

  listTemplates: () =>
    apiClient.get('v3/dashboards/templates')
      .json<Array<{ id: string; name: string; description: string; widget_count: number }>>(),

  getFilters: (dashboardId: string) =>
    apiClient.get(`v3/dashboards/${dashboardId}/filters`)
      .json<Array<{ id: string; label: string; type: string; options: string[] }>>(),

  export: (id: string, format: string) =>
    apiClient.get(`v3/dashboards/${id}/export`, { searchParams: { format } }).blob(),
}
