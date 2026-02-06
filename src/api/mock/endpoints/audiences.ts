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
}
