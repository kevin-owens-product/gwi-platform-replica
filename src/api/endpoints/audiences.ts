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
    apiClient.get('audiences', { searchParams: params as Record<string, string> })
      .json<PaginatedResponse<Audience>>(),

  get: (id: string) =>
    apiClient.get(`audiences/${id}`).json<Audience>(),

  create: (data: CreateAudienceRequest) =>
    apiClient.post('audiences', { json: data }).json<Audience>(),

  update: (id: string, data: UpdateAudienceRequest) =>
    apiClient.patch(`audiences/${id}`, { json: data }).json<Audience>(),

  delete: (id: string) =>
    apiClient.delete(`audiences/${id}`).json<void>(),

  duplicate: (id: string) =>
    apiClient.post(`audiences/${id}/duplicate`).json<Audience>(),

  validate: (expression: CreateAudienceRequest['expression']) =>
    apiClient.post('audiences/validate', { json: { expression } })
      .json<{ valid: boolean; errors?: string[] }>(),
}
