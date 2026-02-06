import { apiClient } from '../client'
import type {
  Audience,
  AudienceListParams,
  CreateAudienceRequest,
  UpdateAudienceRequest,
  PaginatedResponse,
} from '../types'

export const audiencesApi = {
  list: (params?: AudienceListParams) =>
    apiClient.get('v3/audiences', { searchParams: params as Record<string, string> })
      .json<PaginatedResponse<Audience>>(),

  get: (id: string) =>
    apiClient.get(`v3/audiences/${id}`).json<Audience>(),

  create: (data: CreateAudienceRequest) =>
    apiClient.post('v3/audiences', { json: data }).json<Audience>(),

  update: (id: string, data: UpdateAudienceRequest) =>
    apiClient.patch(`v3/audiences/${id}`, { json: data }).json<Audience>(),

  delete: (id: string) =>
    apiClient.delete(`v3/audiences/${id}`).json<void>(),

  duplicate: (id: string) =>
    apiClient.post(`v3/audiences/${id}/duplicate`).json<Audience>(),

  validate: (expression: CreateAudienceRequest['expression']) =>
    apiClient.post('v3/audiences/validate', { json: { expression } })
      .json<{ valid: boolean; errors?: string[] }>(),
}
