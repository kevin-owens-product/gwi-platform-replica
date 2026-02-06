import { apiClient } from '../client'
import type {
  Crosstab,
  CreateCrosstabRequest,
  UpdateCrosstabRequest,
  PaginatedResponse,
} from '../types'

export const crosstabsApi = {
  list: (params?: { page?: number; per_page?: number; search?: string }) =>
    apiClient.get('crosstabs', { searchParams: params as Record<string, string> })
      .json<PaginatedResponse<Crosstab>>(),

  get: (id: string) =>
    apiClient.get(`crosstabs/${id}`).json<Crosstab>(),

  create: (data: CreateCrosstabRequest) =>
    apiClient.post('crosstabs', { json: data }).json<Crosstab>(),

  update: (id: string, data: UpdateCrosstabRequest) =>
    apiClient.patch(`crosstabs/${id}`, { json: data }).json<Crosstab>(),

  delete: (id: string) =>
    apiClient.delete(`crosstabs/${id}`).json<void>(),

  duplicate: (id: string) =>
    apiClient.post(`crosstabs/${id}/duplicate`).json<Crosstab>(),
}
