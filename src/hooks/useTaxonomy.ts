import { useQuery } from '@tanstack/react-query'
import { taxonomyApi } from '@/api'
import type { QuestionFilterParams, CategoryFilterParams } from '@/api/types'

export function useCategories(params?: CategoryFilterParams) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => taxonomyApi.getCategories(params),
    staleTime: 10 * 60 * 1000, // Categories rarely change
  })
}

export function useQuestions(params?: QuestionFilterParams) {
  return useQuery({
    queryKey: ['questions', params],
    queryFn: () => taxonomyApi.getQuestions(params),
    enabled: !!params?.category_id || !!params?.search || !!params?.per_page,
  })
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: ['questions', id],
    queryFn: () => taxonomyApi.getQuestion(id),
    enabled: !!id,
  })
}

export function useStudies() {
  return useQuery({
    queryKey: ['studies'],
    queryFn: () => taxonomyApi.getStudies(),
    staleTime: 30 * 60 * 1000,
  })
}

export function useWaves(params?: { study_id?: string; location_id?: string }) {
  return useQuery({
    queryKey: ['waves', params],
    queryFn: () => taxonomyApi.getWaves(params),
    staleTime: 10 * 60 * 1000,
  })
}

export function useLocations(params?: { search?: string; parent_id?: string }) {
  return useQuery({
    queryKey: ['locations', params],
    queryFn: () => taxonomyApi.getLocations(params),
    staleTime: 30 * 60 * 1000,
  })
}

export function useNamespaces() {
  return useQuery({
    queryKey: ['namespaces'],
    queryFn: () => taxonomyApi.getNamespaces(),
    staleTime: 30 * 60 * 1000,
  })
}

export function useSplitters(params?: { search?: string; type?: string }) {
  return useQuery({
    queryKey: ['splitters', params],
    queryFn: () => taxonomyApi.getSplitters(params),
    staleTime: 10 * 60 * 1000,
  })
}
