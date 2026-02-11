import type { Chart, CreateChartRequest, UpdateChartRequest, ChartListParams, PaginatedResponse } from '../../types'
import { mockCharts } from '../data/charts'
import { delay, paginate, findById, newId, now } from '../helpers'

const charts = [...mockCharts]

export const chartsApi = {
  async list(params?: ChartListParams): Promise<PaginatedResponse<Chart>> {
    await delay()
    let items = [...charts]
    if (params?.search) {
      const q = params.search.toLowerCase()
      items = items.filter((c) => c.name.toLowerCase().includes(q))
    }
    if (params?.project_id) {
      items = items.filter((c) => c.project_id === params.project_id)
    }
    return paginate(items, params)
  },

  async get(id: string): Promise<Chart> {
    await delay()
    const c = findById(charts, id)
    if (!c) throw new Error(`Chart ${id} not found`)
    return { ...c }
  },

  async create(data: CreateChartRequest): Promise<Chart> {
    await delay()
    const chart: Chart = {
      id: newId('chart'),
      name: data.name,
      description: data.description,
      chart_type: data.chart_type,
      config: data.config,
      created_at: now(),
      updated_at: now(),
      user_id: 'user_sarah',
      project_id: data.project_id,
      is_shared: data.is_shared ?? false,
    }
    charts.unshift(chart)
    return { ...chart }
  },

  async update(id: string, data: UpdateChartRequest): Promise<Chart> {
    await delay()
    const idx = charts.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error(`Chart ${id} not found`)
    const existing = charts[idx]
    charts[idx] = {
      ...existing,
      ...data,
      config: data.config ? { ...existing.config, ...data.config } : existing.config,
      updated_at: now(),
    }
    return { ...charts[idx] }
  },

  async delete(id: string): Promise<void> {
    await delay()
    const idx = charts.findIndex((c) => c.id === id)
    if (idx !== -1) charts.splice(idx, 1)
  },

  async duplicate(id: string): Promise<Chart> {
    await delay()
    const original = findById(charts, id)
    if (!original) throw new Error(`Chart ${id} not found`)
    const copy: Chart = {
      ...original,
      id: newId('chart'),
      name: `${original.name} (Copy)`,
      created_at: now(),
      updated_at: now(),
    }
    charts.unshift(copy)
    return { ...copy }
  },

  async getAnnotations(_chartId: string): Promise<Array<{ id: string; text: string; x: number; y: number; created_at: string }>> {
    await delay()
    return [
      { id: 'ann-1', text: 'Key inflection point', x: 0.5, y: 0.7, created_at: now() },
      { id: 'ann-2', text: 'Target reached', x: 0.8, y: 0.3, created_at: now() },
    ]
  },

  async export(_id: string, _format: string): Promise<Blob> {
    await delay()
    return new Blob(['Mock chart export'], { type: 'application/octet-stream' })
  },
}
