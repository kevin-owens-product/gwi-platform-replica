import type { Crosstab, CreateCrosstabRequest, UpdateCrosstabRequest, PaginatedResponse } from '../../types'
import { mockCrosstabs } from '../data/crosstabs'
import { delay, paginate, findById, newId, now } from '../helpers'

const crosstabs = [...mockCrosstabs]

export const crosstabsApi = {
  async list(params?: { page?: number; per_page?: number; search?: string }): Promise<PaginatedResponse<Crosstab>> {
    await delay()
    return paginate(crosstabs, params)
  },

  async get(id: string): Promise<Crosstab> {
    await delay()
    const c = findById(crosstabs, id)
    if (!c) throw new Error(`Crosstab ${id} not found`)
    return { ...c }
  },

  async create(data: CreateCrosstabRequest): Promise<Crosstab> {
    await delay()
    const crosstab: Crosstab = {
      id: newId('xt'),
      name: data.name,
      description: data.description,
      config: data.config,
      created_at: now(),
      updated_at: now(),
      user_id: 'user_sarah',
      project_id: data.project_id,
      is_shared: data.is_shared ?? false,
    }
    crosstabs.unshift(crosstab)
    return { ...crosstab }
  },

  async update(id: string, data: UpdateCrosstabRequest): Promise<Crosstab> {
    await delay()
    const idx = crosstabs.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error(`Crosstab ${id} not found`)
    const existing = crosstabs[idx]
    crosstabs[idx] = {
      ...existing,
      ...data,
      config: data.config ? { ...existing.config, ...data.config } : existing.config,
      updated_at: now(),
    }
    return { ...crosstabs[idx] }
  },

  async delete(id: string): Promise<void> {
    await delay()
    const idx = crosstabs.findIndex((c) => c.id === id)
    if (idx !== -1) crosstabs.splice(idx, 1)
  },

  async duplicate(id: string): Promise<Crosstab> {
    await delay()
    const original = findById(crosstabs, id)
    if (!original) throw new Error(`Crosstab ${id} not found`)
    const copy: Crosstab = {
      ...original,
      id: newId('xt'),
      name: `${original.name} (Copy)`,
      created_at: now(),
      updated_at: now(),
    }
    crosstabs.unshift(copy)
    return { ...copy }
  },

  async listTemplates(): Promise<Array<{ id: string; name: string; description: string; config: Crosstab['config'] }>> {
    await delay()
    return [
      { id: 'tpl-xt-1', name: 'Brand Awareness Template', description: 'Standard brand awareness crosstab layout', config: crosstabs[0]?.config ?? { rows: [], columns: [], metrics: ['audience_percentage'], wave_ids: [], location_ids: [] } },
      { id: 'tpl-xt-2', name: 'Media Usage Template', description: 'Compare media usage across demographics', config: crosstabs[1]?.config ?? { rows: [], columns: [], metrics: ['audience_percentage'], wave_ids: [], location_ids: [] } },
    ]
  },

  async applyTemplate(crosstabId: string, _templateId: string): Promise<Crosstab> {
    await delay()
    const c = findById(crosstabs, crosstabId)
    if (!c) throw new Error(`Crosstab ${crosstabId} not found`)
    c.updated_at = now()
    return { ...c }
  },
}
