import type { Dashboard, CreateDashboardRequest, UpdateDashboardRequest, PaginatedResponse } from '../../types'
import { mockDashboards } from '../data/dashboards'
import { delay, paginate, findById, newId, now } from '../helpers'

const dashboards = [...mockDashboards]

export const dashboardsApi = {
  async list(params?: { page?: number; per_page?: number; search?: string; project_id?: string }): Promise<PaginatedResponse<Dashboard>> {
    await delay()
    let items = [...dashboards]
    if (params?.search) {
      const q = params.search.toLowerCase()
      items = items.filter((d) => d.name.toLowerCase().includes(q))
    }
    if (params?.project_id) {
      items = items.filter((d) => d.project_id === params.project_id)
    }
    return paginate(items, params)
  },

  async get(id: string): Promise<Dashboard> {
    await delay()
    const d = findById(dashboards, id)
    if (!d) throw new Error(`Dashboard ${id} not found`)
    return { ...d }
  },

  async create(data: CreateDashboardRequest): Promise<Dashboard> {
    await delay()
    const dashboard: Dashboard = {
      id: newId('dash'),
      name: data.name,
      description: data.description,
      widgets: data.widgets ?? [],
      layout: data.layout ?? { columns: 12, row_height: 80 },
      created_at: now(),
      updated_at: now(),
      user_id: 'user_sarah',
      project_id: data.project_id,
      is_shared: data.is_shared ?? false,
    }
    dashboards.unshift(dashboard)
    return { ...dashboard }
  },

  async update(id: string, data: UpdateDashboardRequest): Promise<Dashboard> {
    await delay()
    const idx = dashboards.findIndex((d) => d.id === id)
    if (idx === -1) throw new Error(`Dashboard ${id} not found`)
    dashboards[idx] = { ...dashboards[idx], ...data, updated_at: now() }
    return { ...dashboards[idx] }
  },

  async delete(id: string): Promise<void> {
    await delay()
    const idx = dashboards.findIndex((d) => d.id === id)
    if (idx !== -1) dashboards.splice(idx, 1)
  },

  async listTemplates(): Promise<Array<{ id: string; name: string; description: string; widget_count: number }>> {
    await delay()
    return [
      { id: 'tpl-dash-1', name: 'Brand Performance', description: 'Track brand metrics over time', widget_count: 6 },
      { id: 'tpl-dash-2', name: 'Audience Overview', description: 'Key audience demographics and behaviors', widget_count: 8 },
      { id: 'tpl-dash-3', name: 'Media Mix', description: 'Cross-channel media consumption analysis', widget_count: 5 },
    ]
  },

  async getFilters(_dashboardId: string): Promise<Array<{ id: string; label: string; type: string; options: string[] }>> {
    await delay()
    return [
      { id: 'f-1', label: 'Market', type: 'select', options: ['US', 'UK', 'Germany', 'France'] },
      { id: 'f-2', label: 'Time Period', type: 'select', options: ['Q4 2024', 'Q3 2024', 'Q2 2024'] },
      { id: 'f-3', label: 'Age Group', type: 'multi-select', options: ['16-24', '25-34', '35-44', '45-54', '55+'] },
    ]
  },

  async export(_id: string, _format: string): Promise<Blob> {
    await delay()
    return new Blob(['Mock dashboard export'], { type: 'application/octet-stream' })
  },
}
