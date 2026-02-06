import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { audiencesApi } from '@/api'
import type { AudienceListParams, CreateAudienceRequest, UpdateAudienceRequest } from '@/api/types'

export function useAudiences(params?: AudienceListParams) {
  return useQuery({
    queryKey: ['audiences', params],
    queryFn: () => audiencesApi.list(params),
  })
}

export function useAudience(id: string) {
  return useQuery({
    queryKey: ['audiences', id],
    queryFn: () => audiencesApi.get(id),
    enabled: !!id,
  })
}

export function useCreateAudience() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAudienceRequest) => audiencesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audiences'] })
      toast.success('Audience created')
    },
    onError: () => {
      toast.error('Failed to create audience')
    },
  })
}

export function useUpdateAudience() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAudienceRequest }) =>
      audiencesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['audiences'] })
      queryClient.invalidateQueries({ queryKey: ['audiences', id] })
      toast.success('Audience updated')
    },
    onError: () => {
      toast.error('Failed to update audience')
    },
  })
}

export function useDeleteAudience() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => audiencesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audiences'] })
      toast.success('Audience deleted')
    },
    onError: () => {
      toast.error('Failed to delete audience')
    },
  })
}

export function useDuplicateAudience() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => audiencesApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audiences'] })
      toast.success('Audience duplicated')
    },
    onError: () => {
      toast.error('Failed to duplicate audience')
    },
  })
}
