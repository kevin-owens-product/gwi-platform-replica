import { apiClient } from '../client'
import type {
  Category,
  CategoryFilterParams,
  Question,
  QuestionFilterParams,
  Wave,
  Study,
  Splitter,
  Location,
  Namespace,
  PaginatedResponse,
} from '../types'

export const taxonomyApi = {
  // Categories
  getCategories: (params?: CategoryFilterParams) =>
    apiClient.get('v3/taxonomy/categories', { searchParams: params as Record<string, string> })
      .json<Category[]>(),

  getCategory: (id: string) =>
    apiClient.get(`v3/taxonomy/categories/${id}`).json<Category>(),

  // Questions
  getQuestions: (params?: QuestionFilterParams) =>
    apiClient.get('v3/taxonomy/questions', { searchParams: params as Record<string, string> })
      .json<PaginatedResponse<Question>>(),

  getQuestion: (id: string) =>
    apiClient.get(`v3/taxonomy/questions/${id}`).json<Question>(),

  searchQuestions: (query: string, params?: Omit<QuestionFilterParams, 'search'>) =>
    apiClient.get('v3/taxonomy/questions', {
      searchParams: { search: query, ...params } as unknown as Record<string, string>,
    }).json<PaginatedResponse<Question>>(),

  // Waves & Studies
  getStudies: () =>
    apiClient.get('v3/taxonomy/studies').json<Study[]>(),

  getWaves: (params?: { study_id?: string; location_id?: string }) =>
    apiClient.get('v3/taxonomy/waves', { searchParams: params as Record<string, string> })
      .json<Wave[]>(),

  getWave: (id: string) =>
    apiClient.get(`v3/taxonomy/waves/${id}`).json<Wave>(),

  // Locations
  getLocations: (params?: { search?: string; parent_id?: string }) =>
    apiClient.get('v3/taxonomy/locations', { searchParams: params as Record<string, string> })
      .json<Location[]>(),

  // Namespaces
  getNamespaces: () =>
    apiClient.get('v3/taxonomy/namespaces').json<Namespace[]>(),

  // Splitters
  getSplitters: (params?: { search?: string; type?: string }) =>
    apiClient.get('v3/taxonomy/splitters', { searchParams: params as Record<string, string> })
      .json<Splitter[]>(),
}
