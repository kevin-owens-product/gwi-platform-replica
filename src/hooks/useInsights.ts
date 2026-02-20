import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { insightsApi } from '@/api'
import type {
  InsightAssetListParams,
  CreateInsightAssetRequest,
  UpdateInsightAssetRequest,
  RunInsightQueryRequest,
  ConvertInsightAssetRequest,
} from '@/api/types'

export function useInsightAssets(params?: InsightAssetListParams) {
  return useQuery({
    queryKey: ['insights', 'assets', params],
    queryFn: () => insightsApi.listAssets(params),
  })
}

export function useInsightAsset(id: string) {
  return useQuery({
    queryKey: ['insights', 'asset', id],
    queryFn: () => insightsApi.getAsset(id),
    enabled: !!id,
  })
}

export function useCreateInsightAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateInsightAssetRequest) => insightsApi.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights', 'assets'] })
      toast.success('Insight asset created')
    },
    onError: () => {
      toast.error('Failed to create insight asset')
    },
  })
}

export function useUpdateInsightAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInsightAssetRequest }) => insightsApi.updateAsset(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['insights', 'assets'] })
      queryClient.invalidateQueries({ queryKey: ['insights', 'asset', id] })
      toast.success('Insight asset updated')
    },
    onError: () => {
      toast.error('Failed to update insight asset')
    },
  })
}

export function useDeleteInsightAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => insightsApi.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights', 'assets'] })
      toast.success('Insight asset deleted')
    },
    onError: () => {
      toast.error('Failed to delete insight asset')
    },
  })
}

export function useRunInsightQuery() {
  return useMutation({
    mutationFn: (data: RunInsightQueryRequest) => insightsApi.runQuery(data),
  })
}

export function useConvertInsightAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConvertInsightAssetRequest }) => insightsApi.convertAsset(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['insights', 'assets'] })
      queryClient.invalidateQueries({ queryKey: ['insights', 'asset', id] })
      toast.success('Asset converted')
    },
    onError: () => {
      toast.error('Failed to convert asset')
    },
  })
}

export function useInsightLineage(id: string) {
  return useQuery({
    queryKey: ['insights', 'lineage', id],
    queryFn: () => insightsApi.getLineage(id),
    enabled: !!id,
  })
}
