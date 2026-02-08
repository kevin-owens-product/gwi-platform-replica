import { apiClient } from '../client'
import type {
  Crosstab,
  CreateCrosstabRequest,
  UpdateCrosstabRequest,
  PaginatedResponse,
} from '../types'

export const crosstabsApi = {
  list: (params?: { page?: number; per_page?: number; search?: string }) =>
    apiClient.get('v3/crosstabs', { searchParams: params as Record<string, string> })
      .json<PaginatedResponse<Crosstab>>(),

  get: (id: string) =>
    apiClient.get(`v3/crosstabs/${id}`).json<Crosstab>(),

  create: (data: CreateCrosstabRequest) =>
    apiClient.post('v3/crosstabs', { json: data }).json<Crosstab>(),

  update: (id: string, data: UpdateCrosstabRequest) =>
    apiClient.patch(`v3/crosstabs/${id}`, { json: data }).json<Crosstab>(),

  delete: (id: string) =>
    apiClient.delete(`v3/crosstabs/${id}`).json<void>(),

  duplicate: (id: string) =>
    apiClient.post(`v3/crosstabs/${id}/duplicate`).json<Crosstab>(),

  listTemplates: () =>
    apiClient.get('v3/crosstabs/templates')
      .json<Array<{ id: string; name: string; description: string; config: any }>>(),

  applyTemplate: (crosstabId: string, templateId: string) =>
    apiClient.post(`v3/crosstabs/${crosstabId}/apply-template`, { json: { template_id: templateId } })
      .json<any>(),
}
