import { apiClient } from '../client'
import type {
  Audience,
  AudienceListParams,
  AudienceEstimateResult,
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

  estimate: (expression: CreateAudienceRequest['expression']) =>
    apiClient.post('v3/audiences/estimate', { json: { expression } })
      .json<AudienceEstimateResult>(),

  overlap: (audienceIds: string[]) =>
    apiClient.post('v3/audiences/overlap', { json: { audience_ids: audienceIds } })
      .json<{ audiences: string[]; overlap_size: number; overlap_pct: number; exclusive_sizes: Record<string, number> }>(),

  comparison: (audienceId1: string, audienceId2: string) =>
    apiClient.get('v3/audiences/compare', { searchParams: { id1: audienceId1, id2: audienceId2 } })
      .json<{ audience_a: string; audience_b: string; similarity_score: number; top_differences: Array<{ attribute: string; a_value: number; b_value: number }> }>(),

  lookalike: (audienceId: string) =>
    apiClient.get(`v3/audiences/${audienceId}/lookalike`)
      .json<{ source_audience: string; lookalike_audiences: Array<{ id: string; name: string; similarity: number; size: number }> }>(),

  activate: (data: { audience_id: string; destination_type: string; field_mapping?: Record<string, string> }) =>
    apiClient.post(`v3/audiences/${data.audience_id}/activate`, { json: data })
      .json<{ status: string; audience_id: string; destination_type: string }>(),
}
