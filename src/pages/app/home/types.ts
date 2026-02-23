import type { AgentStarterTemplate } from '@/data/agent-templates'

export type SectionState = 'loading' | 'ready' | 'empty' | 'error'
export type HealthStatus = 'healthy' | 'attention' | 'critical'

export interface CommandCenterModel {
  title: string
  subtitle: string
  promptPlaceholder: string
  helperText: string
  datasetLabel: string
}

export interface OpsHealthCard {
  id: 'agent' | 'governance' | 'delivery'
  title: string
  status: HealthStatus
  summary: string
  detail: string
  actionLabel?: string
  actionPath?: string
}

export interface OpsHealthSummary {
  overallStatus: HealthStatus
  cards: OpsHealthCard[]
  totals: {
    completedRuns: number
    runningRuns: number
    failedRuns: number
    governanceCoverage: number
    deliverySuccessRate: number
    connectedDestinations: number
    erroredDestinations: number
  }
}

export interface WorkspaceArtifact {
  id: string
  type: 'chart' | 'crosstab' | 'dashboard' | 'audience' | 'report' | 'conversation' | 'agent_run'
  title: string
  subtitle: string
  updatedAt: string
  path: string
}

export interface AttentionItem {
  id: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  createdAt: string
  actionLabel: string
  actionPath: string
}

export interface LaunchpadAction {
  id: string
  label: string
  description: string
  path: string
  icon: 'spark' | 'charts' | 'crosstabs' | 'dashboards' | 'audiences' | 'reports' | 'canvas'
  disabledReason?: string
}

export interface HomePanel<T> {
  state: SectionState
  items: T[]
  errorMessage?: string
  emptyTitle: string
  emptyDescription: string
  emptyCtaLabel: string
  emptyCtaPath: string
}

export interface WorkspaceTotals {
  audiences: number
  charts: number
  crosstabs: number
  dashboards: number
  reports: number
}

export interface HomeSnapshot {
  commandCenter: CommandCenterModel
  opsHealth: OpsHealthSummary
  launchpad: LaunchpadAction[]
  recentWork: HomePanel<WorkspaceArtifact>
  attentionQueue: HomePanel<AttentionItem>
  workspaceTotals: WorkspaceTotals
  featuredTemplates: AgentStarterTemplate[]
  isLoading: boolean
  activeProjectId: string | null
  activeProjectName: string | null
}

export interface HomeSnapshotInput {
  activeProjectId: string | null
  activeProjectName: string | null
  runs: {
    data: Array<{
      id: string
      flow_id: string
      status: 'queued' | 'running' | 'completed' | 'failed'
      started_at: string
      completed_at?: string
      brief: string
      outputs: Array<{ id: string; label: string; type: string; summary: string }>
    }> | undefined
    isLoading: boolean
    isError: boolean
  }
  conversations: {
    data: Array<{ id: string; title: string; updated_at: string }> | undefined
    isLoading: boolean
    isError: boolean
  }
  insights: {
    data: Array<{ id: string; title: string; summary: string; category: string; created_at: string }> | undefined
    isLoading: boolean
    isError: boolean
  }
  dashboards: {
    data:
      | {
          data: Array<{ id: string; name: string; updated_at: string }>
          meta: { total: number }
        }
      | undefined
    isLoading: boolean
    isError: boolean
  }
  charts: {
    data:
      | {
          data: Array<{ id: string; name: string; updated_at: string }>
          meta: { total: number }
        }
      | undefined
    isLoading: boolean
    isError: boolean
  }
  crosstabs: {
    data:
      | {
          data: Array<{ id: string; name: string; updated_at: string }>
          meta: { total: number }
        }
      | undefined
    isLoading: boolean
    isError: boolean
  }
  audiences: {
    data:
      | {
          data: Array<{ id: string; name: string; updated_at: string }>
          meta: { total: number }
        }
      | undefined
    isLoading: boolean
    isError: boolean
  }
  reports: {
    data:
      | {
          data: Array<{ id: string; name: string; updated_at: string }>
          meta: { total: number }
        }
      | undefined
    isLoading: boolean
    isError: boolean
  }
  connections: {
    data:
      | Array<{
          id: string
          app_id: string
          status: 'not_connected' | 'connected' | 'error' | 'testing' | 'pending'
          last_tested_at?: string
          connected_at: string
        }>
      | undefined
    isLoading: boolean
    isError: boolean
  }
  activity: {
    data:
      | Array<{
          id: string
          type: 'delivery' | 'audience_sync' | 'connection_test' | 'connect' | 'disconnect'
          status: 'success' | 'failed' | 'pending'
          created_at: string
          details?: string
          app_id: string
        }>
      | undefined
    isLoading: boolean
    isError: boolean
  }
}
