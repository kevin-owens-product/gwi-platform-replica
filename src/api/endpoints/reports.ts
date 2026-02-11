import { apiClient } from '../client'
import type {
  Report,
  ReportListParams,
  PaginatedResponse,
} from '../types'

export const reportsApi = {
  list: (params?: ReportListParams) =>
    apiClient.get('v3/reports', { searchParams: params as Record<string, string> })
      .json<PaginatedResponse<Report>>(),

  get: (id: string) =>
    apiClient.get(`v3/reports/${id}`).json<Report>(),

  download: (id: string) =>
    apiClient.get(`v3/reports/${id}/download`).blob(),

  create: (data: { name: string; description?: string; template_id?: string; project_id?: string }) =>
    apiClient.post('v3/reports', { json: data }).json<any>(),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`v3/reports/${id}`, { json: data }).json<any>(),

  delete: (id: string) =>
    apiClient.delete(`v3/reports/${id}`).json<void>(),
}
