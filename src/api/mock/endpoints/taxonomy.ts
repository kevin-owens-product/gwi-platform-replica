import type { Category, Question, Study, Wave, Location, Namespace, Splitter, QuestionFilterParams, CategoryFilterParams, PaginatedResponse } from '../../types'
import { mockCategories, mockQuestions, mockStudies, mockWaves, mockLocations, mockNamespaces, mockSplitters } from '../data/taxonomy'
import { delay, paginate, findById } from '../helpers'

export const taxonomyApi = {
  async getCategories(params?: CategoryFilterParams): Promise<Category[]> {
    await delay()
    let cats = [...mockCategories]
    if (params?.parent_id) cats = cats.filter((c) => c.parent_id === params.parent_id)
    if (params?.search) {
      const q = params.search.toLowerCase()
      cats = cats.filter((c) => c.name.toLowerCase().includes(q))
    }
    return cats
  },

  async getCategory(id: string): Promise<Category> {
    await delay()
    const c = findById(mockCategories, id)
    if (!c) throw new Error(`Category ${id} not found`)
    return { ...c }
  },

  async getQuestions(params?: QuestionFilterParams): Promise<PaginatedResponse<Question>> {
    await delay()
    let items = [...mockQuestions]
    if (params?.category_id) items = items.filter((q) => q.category_id === params.category_id)
    if (params?.namespace_id) items = items.filter((q) => q.namespace_id === params.namespace_id)
    if (params?.type) items = items.filter((q) => q.type === params.type)
    if (params?.wave_id) items = items.filter((q) => q.wave_ids.includes(params.wave_id!))
    if (params?.search) {
      const s = params.search.toLowerCase()
      items = items.filter((q) => q.name.toLowerCase().includes(s) || (q.description && q.description.toLowerCase().includes(s)))
    }
    return paginate(items, params)
  },

  async getQuestion(id: string): Promise<Question> {
    await delay()
    const q = findById(mockQuestions, id)
    if (!q) throw new Error(`Question ${id} not found`)
    return { ...q }
  },

  async searchQuestions(query: string, params?: Omit<QuestionFilterParams, 'search'>): Promise<PaginatedResponse<Question>> {
    await delay()
    return this.getQuestions({ ...params, search: query })
  },

  async getStudies(): Promise<Study[]> {
    await delay()
    return [...mockStudies]
  },

  async getWaves(params?: { study_id?: string; location_id?: string }): Promise<Wave[]> {
    await delay()
    let waves = [...mockWaves]
    if (params?.study_id) waves = waves.filter((w) => w.study_id === params.study_id)
    if (params?.location_id) waves = waves.filter((w) => w.location_ids.includes(params.location_id!))
    return waves
  },

  async getWave(id: string): Promise<Wave> {
    await delay()
    const w = findById(mockWaves, id)
    if (!w) throw new Error(`Wave ${id} not found`)
    return { ...w }
  },

  async getLocations(params?: { search?: string; parent_id?: string }): Promise<Location[]> {
    await delay()
    let locs = [...mockLocations]
    if (params?.parent_id) locs = locs.filter((l) => l.parent_id === params.parent_id)
    if (params?.search) {
      const q = params.search.toLowerCase()
      locs = locs.filter((l) => l.name.toLowerCase().includes(q))
    }
    return locs
  },

  async getNamespaces(): Promise<Namespace[]> {
    await delay()
    return [...mockNamespaces]
  },

  async getSplitters(params?: { search?: string; type?: string }): Promise<Splitter[]> {
    await delay()
    let splitters = [...mockSplitters]
    if (params?.type) splitters = splitters.filter((s) => s.type === params.type)
    if (params?.search) {
      const q = params.search.toLowerCase()
      splitters = splitters.filter((s) => s.name.toLowerCase().includes(q))
    }
    return splitters
  },
}
