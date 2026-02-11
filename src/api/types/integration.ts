import type { ExportFormat } from './common'

export type IntegrationAppId =
  | 'slack'
  | 'microsoft_teams'
  | 'salesforce'
  | 'hubspot'
  | 'tableau'
  | 'power_bi'
  | 'zapier'
  | 'chatgpt'
  | 'claude'
  | 'gemini'
  | 'microsoft_copilot'

export type IntegrationCategory =
  | 'collaboration'
  | 'crm'
  | 'bi'
  | 'automation'
  | 'ai_assistant'

export type IntegrationCapability =
  | 'message_delivery'
  | 'report_delivery'
  | 'audience_sync'
  | 'delivery_metadata'
  | 'artifact_delivery'
  | 'dataset_handoff'
  | 'automation_trigger'
  | 'mcp_setup'
  | 'connection_test'

export type IntegrationScopeType = 'workspace' | 'project'

export type IntegrationConnectionStatus =
  | 'not_connected'
  | 'connected'
  | 'error'
  | 'testing'
  | 'pending'

export interface IntegrationCatalogItem {
  app_id: IntegrationAppId
  name: string
  description: string
  category: IntegrationCategory
  capabilities: IntegrationCapability[]
  logo_text: string
  setup_guide_url?: string
}

export interface IntegrationAccount {
  id: string
  app_id: IntegrationAppId
  display_name: string
  metadata?: Record<string, unknown>
}

export interface IntegrationConnection {
  id: string
  app_id: IntegrationAppId
  account: IntegrationAccount
  scope_type: IntegrationScopeType
  workspace_id: string
  project_id?: string
  status: IntegrationConnectionStatus
  connected_by: string
  connected_at: string
  capabilities: IntegrationCapability[]
  last_tested_at?: string
  last_synced_at?: string
  last_error?: string
}

export interface IntegrationDeliveryRequest {
  connection_ids: string[]
  source_type: 'spark' | 'report' | 'dashboard' | 'chart' | 'crosstab' | 'audience'
  source_id?: string
  summary: string
  artifacts?: Array<{
    label: string
    type: ExportFormat | 'link' | 'text'
    url?: string
  }>
  source_context?: Record<string, unknown>
  run_metadata?: Record<string, unknown>
}

export type IntegrationDeliveryStatus =
  | 'queued'
  | 'running'
  | 'success'
  | 'failed'

export type IntegrationFailureReason =
  | 'auth_error'
  | 'rate_limited'
  | 'validation_error'
  | 'destination_unavailable'

export interface IntegrationDeliveryResult {
  id: string
  status: IntegrationDeliveryStatus
  connection_ids: string[]
  created_at: string
  completed_at?: string
  failure_reason?: IntegrationFailureReason
  error_message?: string
}

export interface IntegrationAudienceSyncRequest {
  audience_id: string
  connection_id: string
  field_mapping?: Record<string, string>
}

export type IntegrationActivityType =
  | 'delivery'
  | 'audience_sync'
  | 'connection_test'
  | 'connect'
  | 'disconnect'

export interface IntegrationActivity {
  id: string
  type: IntegrationActivityType
  app_id: IntegrationAppId
  connection_id?: string
  status: 'success' | 'failed' | 'pending'
  retries: number
  actor: string
  created_at: string
  details?: string
}
