import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { integrationsApi } from '@/api'
import type {
  IntegrationAppId,
  IntegrationAudienceSyncRequest,
  IntegrationCapability,
  IntegrationDeliveryRequest,
} from '@/api/types'

export function useIntegrationCatalog() {
  return useQuery({
    queryKey: ['integrations', 'catalog'],
    queryFn: () => integrationsApi.listCatalog(),
  })
}

export function useIntegrationConnections(capability?: IntegrationCapability) {
  return useQuery({
    queryKey: ['integrations', 'connections', capability],
    queryFn: () => integrationsApi.listConnections(capability ? { capability } : undefined),
  })
}

export function useIntegrationDeliveryHistory() {
  return useQuery({
    queryKey: ['integrations', 'activity'],
    queryFn: () => integrationsApi.getDeliveryHistory(),
  })
}

export function useConnectIntegration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      app_id: IntegrationAppId
      scope_type: 'workspace' | 'project'
      workspace_id: string
      project_id?: string
      connected_by: string
    }) => integrationsApi.connect(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      toast.success('Integration connected')
    },
    onError: () => {
      toast.error('Failed to connect integration')
    },
  })
}

export function useDisconnectIntegration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { connection_id: string; actor: string }) => integrationsApi.disconnect(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      toast.success('Integration disconnected')
    },
    onError: () => {
      toast.error('Failed to disconnect integration')
    },
  })
}

export function useTestIntegrationConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (connectionId: string) => integrationsApi.testConnection(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      toast.success('Connection test complete')
    },
    onError: () => {
      toast.error('Connection test failed')
    },
  })
}

export function useDeliverIntegration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: IntegrationDeliveryRequest) => integrationsApi.deliver(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'activity'] })
      queryClient.invalidateQueries({ queryKey: ['integrations', 'connections'] })
      toast.success('Delivery queued')
    },
    onError: () => {
      toast.error('Failed to deliver output')
    },
  })
}

export function useSyncAudienceIntegration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: IntegrationAudienceSyncRequest) => integrationsApi.syncAudience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'activity'] })
      queryClient.invalidateQueries({ queryKey: ['integrations', 'connections'] })
      toast.success('Audience sync started')
    },
    onError: () => {
      toast.error('Failed to sync audience')
    },
  })
}
