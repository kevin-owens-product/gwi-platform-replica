import type { Dashboard, CreateDashboardRequest, UpdateDashboardRequest, PaginatedResponse } from '../../types'
import { mockDashboards } from '../data/dashboards'
import { delay, paginate, findById, newId, now } from '../helpers'

const dashboards = [...mockDashboards]

export const dashboardsApi = {
  async list(params?: { page?: number; per_page?: number; search?: string }): Promise<PaginatedResponse<Dashboard>> {
    await delay()
    return paginate(dashboards, params)
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
}
