import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { chartsApi } from '@/api'
import type { ChartListParams, CreateChartRequest, UpdateChartRequest } from '@/api/types'

export function useCharts(params?: ChartListParams) {
  return useQuery({
    queryKey: ['charts', params],
    queryFn: () => chartsApi.list(params),
  })
}

export function useChart(id: string) {
  return useQuery({
    queryKey: ['charts', id],
    queryFn: () => chartsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateChart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateChartRequest) => chartsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charts'] })
      toast.success('Chart created')
    },
    onError: () => {
      toast.error('Failed to create chart')
    },
  })
}

export function useUpdateChart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChartRequest }) =>
      chartsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['charts'] })
      queryClient.invalidateQueries({ queryKey: ['charts', id] })
      toast.success('Chart updated')
    },
    onError: () => {
      toast.error('Failed to update chart')
    },
  })
}

export function useDeleteChart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => chartsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charts'] })
      toast.success('Chart deleted')
    },
    onError: () => {
      toast.error('Failed to delete chart')
    },
  })
}
