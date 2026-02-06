import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/api'
import type { ReportListParams } from '@/api/types'

export function useReports(params?: ReportListParams) {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: () => reportsApi.list(params),
  })
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ['reports', id],
    queryFn: () => reportsApi.get(id),
    enabled: !!id,
  })
}
