import type { Report, ReportListParams, PaginatedResponse } from '../../types'
import { mockReports } from '../data/reports'
import { delay, paginate, findById } from '../helpers'

export const reportsApi = {
  async list(params?: ReportListParams): Promise<PaginatedResponse<Report>> {
    await delay()
    let items = [...mockReports]
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
}
