import type { Report, ReportListParams, PaginatedResponse } from '../../types'
import { mockReports } from '../data/reports'
import { delay, paginate, findById } from '../helpers'

export const reportsApi = {
  async list(params?: ReportListParams): Promise<PaginatedResponse<Report>> {
    await delay()
    let items = [...mockReports]
    if (params?.project_id) {
      items = items.filter((r) => r.project_id === params.project_id)
    }
    if (params?.category) {
      items = items.filter((r) => r.category === params.category)
    }
    return paginate(items, params)
  },

  async get(id: string): Promise<Report> {
    await delay()
    const r = findById(mockReports, id)
    if (!r) throw new Error(`Report ${id} not found`)
    return { ...r }
  },

  async download(_id: string): Promise<Blob> {
    await delay()
    return new Blob(['Mock report content'], { type: 'application/pdf' })
  },

  async create(data: { name: string; description?: string; template_id?: string; project_id?: string }): Promise<Report> {
    await delay()
    const report: Report = {
      id: `report_${Date.now()}`,
      name: data.name,
      description: data.description ?? '',
      type: 'pdf',
      size: '0 KB',
      category: 'custom',
      tags: [],
      download_url: '#',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project_id: data.project_id,
    }
    mockReports.unshift(report)
    return { ...report }
  },

  async update(id: string, data: Record<string, unknown>): Promise<Report> {
    await delay()
    const report = findById(mockReports, id)
    if (!report) throw new Error(`Report ${id} not found`)
    Object.assign(report, data, { updated_at: new Date().toISOString() })
    return { ...report }
  },

  async delete(id: string): Promise<void> {
    await delay()
    const idx = mockReports.findIndex((r) => r.id === id)
    if (idx !== -1) mockReports.splice(idx, 1)
  },
}
