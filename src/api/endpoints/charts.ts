import { apiClient } from '../client'
import type {
  Chart,
  ChartListParams,
  CreateChartRequest,
  UpdateChartRequest,
  PaginatedResponse,
} from '../types'

export const chartsApi = {
  list: (params?: ChartListParams) =>
    apiClient.get('v3/charts', { searchParams: params as Record<string, string> })
      .json<PaginatedResponse<Chart>>(),

  get: (id: string) =>
    apiClient.get(`v3/charts/${id}`).json<Chart>(),

  create: (data: CreateChartRequest) =>
    apiClient.post('v3/charts', { json: data }).json<Chart>(),

  update: (id: string, data: UpdateChartRequest) =>
    apiClient.patch(`v3/charts/${id}`, { json: data }).json<Chart>(),

  delete: (id: string) =>
    apiClient.delete(`v3/charts/${id}`).json<void>(),

  duplicate: (id: string) =>
    apiClient.post(`v3/charts/${id}/duplicate`).json<Chart>(),
}
