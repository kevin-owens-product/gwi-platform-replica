import type { Audience, CreateAudienceRequest, UpdateAudienceRequest, AudienceListParams, AudienceExpression, PaginatedResponse } from '../../types'
import { mockAudiences } from '../data/audiences'
import { delay, paginate, findById, newId, now } from '../helpers'

const audiences = [...mockAudiences]

export const audiencesApi = {
  async list(params?: AudienceListParams): Promise<PaginatedResponse<Audience>> {
    await delay()
    return paginate(audiences, params)
  },

  async get(id: string): Promise<Audience> {
    await delay()
    const a = findById(audiences, id)
    if (!a) throw new Error(`Audience ${id} not found`)
    return { ...a }
  },

  async create(data: CreateAudienceRequest): Promise<Audience> {
    await delay()
    const audience: Audience = {
      id: newId('aud'),
      name: data.name,
      description: data.description,
      expression: data.expression,
      created_at: now(),
      updated_at: now(),
      user_id: 'user_sarah',
      project_id: data.project_id,
      is_shared: data.is_shared ?? false,
      sample_size: Math.floor(Math.random() * 5000) + 500,
      population_size: Math.floor(Math.random() * 20000000) + 1000000,
    }
    audiences.unshift(audience)
    return { ...audience }
  },

  async update(id: string, data: UpdateAudienceRequest): Promise<Audience> {
    await delay()
    const idx = audiences.findIndex((a) => a.id === id)
    if (idx === -1) throw new Error(`Audience ${id} not found`)
    audiences[idx] = { ...audiences[idx], ...data, updated_at: now() }
    return { ...audiences[idx] }
  },

  async delete(id: string): Promise<void> {
    await delay()
    const idx = audiences.findIndex((a) => a.id === id)
    if (idx !== -1) audiences.splice(idx, 1)
  },

  async duplicate(id: string): Promise<Audience> {
    await delay()
    const original = findById(audiences, id)
    if (!original) throw new Error(`Audience ${id} not found`)
    const copy: Audience = {
      ...original,
      id: newId('aud'),
      name: `${original.name} (Copy)`,
      created_at: now(),
      updated_at: now(),
    }
    audiences.unshift(copy)
    return { ...copy }
  },

  async validate(_expression: AudienceExpression): Promise<{ valid: boolean; errors?: string[] }> {
    await delay()
    return { valid: true }
  },

  async estimate(_expression: AudienceExpression): Promise<{ population_size: number; sample_size: number; universe_size: number }> {
    await delay()
    return {
      population_size: Math.floor(Math.random() * 20000000) + 1000000,
      sample_size: Math.floor(Math.random() * 5000) + 500,
      universe_size: 50000000,
    }
  },

  async overlap(audienceIds: string[]): Promise<{ audiences: string[]; overlap_size: number; overlap_pct: number; exclusive_sizes: Record<string, number> }> {
    await delay()
    const exclusive: Record<string, number> = {}
    for (const id of audienceIds) {
      exclusive[id] = Math.floor(Math.random() * 5000000) + 500000
    }
    return {
      audiences: audienceIds,
      overlap_size: Math.floor(Math.random() * 2000000) + 100000,
      overlap_pct: Math.floor(Math.random() * 30) + 5,
      exclusive_sizes: exclusive,
    }
  },

  async comparison(audienceId1: string, audienceId2: string): Promise<{ audience_a: string; audience_b: string; similarity_score: number; top_differences: Array<{ attribute: string; a_value: number; b_value: number }> }> {
    await delay()
    return {
      audience_a: audienceId1,
      audience_b: audienceId2,
      similarity_score: Math.floor(Math.random() * 50) + 30,
      top_differences: [
        { attribute: 'Social Media Usage', a_value: 72, b_value: 45 },
        { attribute: 'Online Shopping Frequency', a_value: 58, b_value: 81 },
        { attribute: 'Streaming Subscriptions', a_value: 3.2, b_value: 1.8 },
      ],
    }
  },

  async lookalike(audienceId: string): Promise<{ source_audience: string; lookalike_audiences: Array<{ id: string; name: string; similarity: number; size: number }> }> {
    await delay()
    return {
      source_audience: audienceId,
      lookalike_audiences: [
        { id: 'look-1', name: 'Similar Audience A', similarity: 87, size: 15000000 },
        { id: 'look-2', name: 'Similar Audience B', similarity: 72, size: 22000000 },
        { id: 'look-3', name: 'Similar Audience C', similarity: 65, size: 18000000 },
      ],
    }
  },

  async activate(data: { audience_id: string; destination_type: string; field_mapping?: Record<string, string> }): Promise<{ status: string; audience_id: string; destination_type: string }> {
    await delay()
    return {
      status: 'activating',
      audience_id: data.audience_id,
      destination_type: data.destination_type,
    }
  },
}
