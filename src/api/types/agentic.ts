import type { SparkAction, SparkCitation } from './spark'

export type AgenticCapabilityType = 'agent' | 'tool' | 'system'

export type AgenticCapabilityCategory =
  | 'Orchestration'
  | 'Data Harmonization'
  | 'Audience & Profiling'
  | 'Analysis & Crosstab'
  | 'Narrative & Knowledge'
  | 'Visualization & Packaging'
  | 'Governance & Compliance'
  | 'Delivery & Connectors'
  | 'Proactivity & ROI'
  | 'Brand & Tracking'

export interface AgenticCapability {
  id: string
  name: string
  type: AgenticCapabilityType
  category: AgenticCapabilityCategory
  description: string
  inputs: string[]
  outputs: string[]
  dependencies?: string[]
  confidence?: 'high' | 'medium' | 'low'
}

export interface AgenticPlatformLinkage {
  id: string
  name: string
  description: string
  endpoints: string[]
  auth: 'oauth' | 'token' | 'api_key'
}

export interface AgenticFlowStep {
  id: string
  name: string
  capability_id: string
  description: string
  depends_on?: string[]
  output_artifacts?: string[]
}

export interface AgenticFlow {
  id: string
  name: string
  description: string
  triggers: string[]
  steps: AgenticFlowStep[]
}

export interface AgenticRunOutput {
  id: string
  label: string
  type: 'insight' | 'chart' | 'crosstab' | 'dashboard' | 'report' | 'deck' | 'alert' | 'dataset'
  summary: string
  citations?: SparkCitation[]
  actions?: SparkAction[]
}

export interface AgenticRun {
  id: string
  flow_id: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  started_at: string
  completed_at?: string
  brief: string
  outputs: AgenticRunOutput[]
}

export interface AgenticCapabilityInventory {
  capabilities: AgenticCapability[]
  flows: AgenticFlow[]
  linkages: AgenticPlatformLinkage[]
}
