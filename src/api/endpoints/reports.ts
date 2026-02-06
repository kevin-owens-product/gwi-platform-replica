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
}
