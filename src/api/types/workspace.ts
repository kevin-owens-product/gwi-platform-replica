// Workspace types — team-level context and guardrails

import type { ExportFormat } from './common'

export interface WorkspaceContext {
  default_wave_ids: string[]
  default_location_ids: string[]
  allowed_datasets: string[]
  focus_categories: string[]
  brand_names: string[]
  competitors: string[]
  target_demographics: string[]
  business_objectives: string[]
  key_metrics: string[]
  notes: string
}

export interface WorkspaceGuardrails {
  // Data access restrictions
  restricted_datasets: string[]
  max_export_rows: number
  allowed_export_formats: ExportFormat[]

  // Content standards
  required_tags: string[]
  naming_convention?: string
  brand_colors: string[]
  logo_url?: string

  // Usage limits
  monthly_query_limit?: number
  monthly_export_limit?: number

  // Approval workflows
  require_review_before_share: boolean
  require_review_before_export: boolean
  reviewers: string[]

  // AI guardrails (for Agent Spark)
  spark_system_prompt_additions: string
  spark_restricted_topics: string[]
  spark_approved_data_sources: string[]
}

export interface TeamWorkspace {
  id: string
  team_id: string
  name: string
  description?: string
  context: WorkspaceContext
  guardrails: WorkspaceGuardrails
  created_at: string
  updated_at: string
}

// Project-level workspace context and guardrails
export interface ProjectWorkspace {
  id: string
  project_id: string
  name: string
  description?: string
  context: WorkspaceContext
  guardrails: WorkspaceGuardrails
  created_at: string
  updated_at: string
}

// Organization-level defaults for org-owned projects
export interface OrganizationWorkspace {
  id: string
  organization_id: string
  name: string
  description?: string
  context: WorkspaceContext
  guardrails: WorkspaceGuardrails
  created_at: string
  updated_at: string
}

export interface GuardrailViolation {
  id: string
  rule: string
  severity: 'info' | 'warning' | 'error'
  message: string
  suggestion?: string
  entity_type: string
  entity_id: string
  timestamp: string
  resolved: boolean
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface ApprovalRequest {
  id: string
  team_id: string
  entity_type: 'chart' | 'crosstab' | 'audience' | 'dashboard' | 'report'
  entity_id: string
  entity_name: string
  action: 'share' | 'export'
  requested_by: string
  requested_by_name: string
  requested_at: string
  status: ApprovalStatus
  reviewed_by?: string
  reviewed_by_name?: string
  reviewed_at?: string
  review_comment?: string
}
