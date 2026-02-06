import { useMutation, useQuery } from '@tanstack/react-query'
import { queriesApi } from '@/api'
import type { StatsQueryRequest, CrosstabQueryRequest, IntersectionQueryRequest } from '@/api/types'

export function useStatsQuery(request: StatsQueryRequest | null) {
  return useQuery({
    queryKey: ['stats-query', request],
    queryFn: () => queriesApi.stats(request!),
    enabled: !!request,
    staleTime: 5 * 60 * 1000,
  })
}

export function useStatsQueryMutation() {
  return useMutation({
    mutationFn: (data: StatsQueryRequest) => queriesApi.stats(data),
  })
}

export function useCrosstabQuery(request: CrosstabQueryRequest | null) {
  return useQuery({
    queryKey: ['crosstab-query', request],
    queryFn: () => queriesApi.crosstab(request!),
    enabled: !!request,
    staleTime: 5 * 60 * 1000,
  })
}

export function useIntersectionQuery(request: IntersectionQueryRequest | null) {
  return useQuery({
    queryKey: ['intersection-query', request],
    queryFn: () => queriesApi.intersection(request!),
    enabled: !!request,
    staleTime: 5 * 60 * 1000,
  })
}
