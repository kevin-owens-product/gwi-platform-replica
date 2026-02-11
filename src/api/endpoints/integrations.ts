import { apiClient } from '../client'
import type {
  IntegrationActivity,
  IntegrationAudienceSyncRequest,
  IntegrationCatalogItem,
  IntegrationConnection,
  IntegrationDeliveryRequest,
  IntegrationDeliveryResult,
} from '../types'

export const integrationsApi = {
  listCatalog: () =>
    apiClient.get('v3/integrations/catalog').json<IntegrationCatalogItem[]>(),

  listConnections: (params?: { capability?: string }) =>
    apiClient
      .get('v3/integrations/connections', {
        searchParams: params as Record<string, string> | undefined,
      })
      .json<IntegrationConnection[]>(),

  connect: (data: {
    app_id: IntegrationCatalogItem['app_id']
    scope_type: IntegrationConnection['scope_type']
    workspace_id: string
    project_id?: string
    connected_by: string
  }) =>
    apiClient
      .post('v3/integrations/connections', { json: data })
      .json<IntegrationConnection>(),

  disconnect: (data: { connection_id: string; actor: string }) =>
    apiClient
      .delete(`v3/integrations/connections/${data.connection_id}`, { json: data })
      .json<void>(),

  testConnection: (connection_id: string) =>
    apiClient
      .post(`v3/integrations/connections/${connection_id}/test`)
      .json<{ status: IntegrationConnection['status']; tested_at: string; error?: string }>(),

  deliver: (data: IntegrationDeliveryRequest) =>
    apiClient
      .post('v3/integrations/deliveries', { json: data })
      .json<IntegrationDeliveryResult>(),

  syncAudience: (data: IntegrationAudienceSyncRequest) =>
    apiClient
      .post('v3/integrations/audience-sync', { json: data })
      .json<IntegrationDeliveryResult>(),

  getDeliveryHistory: () =>
    apiClient
      .get('v3/integrations/activity')
      .json<IntegrationActivity[]>(),
}
