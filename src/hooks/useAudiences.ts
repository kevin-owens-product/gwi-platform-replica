import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { audiencesApi } from '@/api'
import type {
  AudienceListParams,
  CreateAudienceRequest,
  UpdateAudienceRequest,
  AudienceExpression,
  ActivateAudienceRequest,
} from '@/api/types'

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

export function useAudienceEstimate(expression?: AudienceExpression) {
  return useQuery({
    queryKey: ['audiences', 'estimate', expression],
    queryFn: () => audiencesApi.estimate(expression!),
    enabled: !!expression,
  })
}

export function useAudienceOverlap(audienceIds: string[]) {
  return useQuery({
    queryKey: ['audiences', 'overlap', audienceIds],
    queryFn: () => audiencesApi.overlap(audienceIds),
    enabled: audienceIds.length >= 2,
  })
}

export function useAudienceComparison(audienceId1: string, audienceId2: string) {
  return useQuery({
    queryKey: ['audiences', 'comparison', audienceId1, audienceId2],
    queryFn: () => audiencesApi.comparison(audienceId1, audienceId2),
    enabled: !!audienceId1 && !!audienceId2,
  })
}

export function useAudienceLookalike(audienceId: string) {
  return useQuery({
    queryKey: ['audiences', 'lookalike', audienceId],
    queryFn: () => audiencesApi.lookalike(audienceId),
    enabled: !!audienceId,
  })
}

export function useActivateAudience() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ActivateAudienceRequest) => audiencesApi.activate(data),
    onSuccess: (_, { audience_id }) => {
      queryClient.invalidateQueries({ queryKey: ['audiences'] })
      queryClient.invalidateQueries({ queryKey: ['audiences', audience_id] })
      toast.success('Audience activation started')
    },
    onError: () => {
      toast.error('Failed to activate audience')
    },
  })
}
