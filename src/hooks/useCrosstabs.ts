import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { crosstabsApi } from '@/api'
import type { CreateCrosstabRequest, UpdateCrosstabRequest } from '@/api/types'

export function useCrosstabs(params?: { page?: number; per_page?: number; search?: string }) {
  return useQuery({
    queryKey: ['crosstabs', params],
    queryFn: () => crosstabsApi.list(params),
  })
}

export function useCrosstab(id: string) {
  return useQuery({
    queryKey: ['crosstabs', id],
    queryFn: () => crosstabsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateCrosstab() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCrosstabRequest) => crosstabsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crosstabs'] })
      toast.success('Crosstab created')
    },
    onError: () => {
      toast.error('Failed to create crosstab')
    },
  })
}

export function useUpdateCrosstab() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCrosstabRequest }) =>
      crosstabsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['crosstabs'] })
      queryClient.invalidateQueries({ queryKey: ['crosstabs', id] })
      toast.success('Crosstab updated')
    },
    onError: () => {
      toast.error('Failed to update crosstab')
    },
  })
}

export function useDeleteCrosstab() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => crosstabsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crosstabs'] })
      toast.success('Crosstab deleted')
    },
    onError: () => {
      toast.error('Failed to delete crosstab')
    },
  })
}

export function useDuplicateCrosstab() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => crosstabsApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crosstabs'] })
      toast.success('Crosstab duplicated')
    },
    onError: () => {
      toast.error('Failed to duplicate crosstab')
    },
  })
}
