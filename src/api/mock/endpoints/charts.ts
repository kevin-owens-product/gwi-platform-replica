import type { Chart, CreateChartRequest, UpdateChartRequest, ChartListParams, PaginatedResponse } from '../../types'
import { mockCharts } from '../data/charts'
import { delay, paginate, findById, newId, now } from '../helpers'

const charts = [...mockCharts]

export const chartsApi = {
  async list(params?: ChartListParams): Promise<PaginatedResponse<Chart>> {
    await delay()
    return paginate(charts, params)
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
}
