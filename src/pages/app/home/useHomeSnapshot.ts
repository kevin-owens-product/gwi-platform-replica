import { useCallback, useMemo } from 'react'
import { useAgenticRuns } from '@/hooks/useAgentic'
import { useAudiences } from '@/hooks/useAudiences'
import { useCharts } from '@/hooks/useCharts'
import { useCrosstabs } from '@/hooks/useCrosstabs'
import { useDashboards } from '@/hooks/useDashboards'
import { useIntegrationConnections, useIntegrationDeliveryHistory } from '@/hooks/useIntegrations'
import { useReports } from '@/hooks/useReports'
import { useSparkConversations, useSparkInsights } from '@/hooks/useSpark'
import { useWorkspaceStore } from '@/stores/workspace'
import { resolveStarterTemplates } from '@/utils/template-resolver'
import type {
  AttentionItem,
  HealthStatus,
  HomePanel,
  HomeSnapshot,
  HomeSnapshotInput,
  LaunchpadAction,
  OpsHealthSummary,
  WorkspaceArtifact,
} from './types'

const RECENT_LIMIT = 8
const ATTENTION_LIMIT = 8

const launchpadActions: LaunchpadAction[] = [
  {
    id: 'spark',
    label: 'Open Agent Spark',
    description: 'Start a guided AI workflow and route outputs across tools.',
    path: '/app/agent-spark',
    icon: 'spark',
  },
  {
    id: 'charts',
    label: 'Build Chart',
    description: 'Create chart packs with advanced visualization controls.',
    path: '/app/chart-builder',
    icon: 'charts',
  },
  {
    id: 'crosstabs',
    label: 'Run Crosstab',
    description: 'Execute significance checks and audience comparisons.',
    path: '/app/crosstabs',
    icon: 'crosstabs',
  },
  {
    id: 'dashboards',
    label: 'Open Dashboards',
    description: 'Compose narrative dashboards with operational filters.',
    path: '/app/dashboards',
    icon: 'dashboards',
  },
  {
    id: 'audiences',
    label: 'Manage Audiences',
    description: 'Define, size, and activate high-value audience segments.',
    path: '/app/audiences',
    icon: 'audiences',
  },
  {
    id: 'reports',
    label: 'Deliver Report',
    description: 'Package assets for client-ready report distribution.',
    path: '/app/reports',
    icon: 'reports',
  },
  {
    id: 'canvas',
    label: 'Open Canvas',
    description: 'Frame objectives, markets, and outputs for new briefs.',
    path: '/app/canvas',
    icon: 'canvas',
  },
]

const GOVERNANCE_TERMS = ['validation', 'citation', 'governance', 'audit', 'compliance']

function toTimestamp(value: string | undefined): number {
  if (!value) return 0
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function statusRank(status: HealthStatus): number {
  if (status === 'critical') return 3
  if (status === 'attention') return 2
  return 1
}

function combineStatus(values: HealthStatus[]): HealthStatus {
  return values.reduce<HealthStatus>((worst, current) =>
    statusRank(current) > statusRank(worst) ? current : worst
  , 'healthy')
}

function runHasGovernanceSignal(run: HomeSnapshotInput['runs']['data'][number]): boolean {
  const flowSignal = run.flow_id.toLowerCase().includes('governance')
  if (flowSignal) return true

  return run.outputs.some((output) => {
    const source = `${output.label} ${output.summary}`.toLowerCase()
    return GOVERNANCE_TERMS.some((term) => source.includes(term))
  })
}

function deriveOpsHealth(input: HomeSnapshotInput): OpsHealthSummary {
  const runs = input.runs.data ?? []
  const connections = input.connections.data ?? []
  const activity = input.activity.data ?? []

  const completedRuns = runs.filter((run) => run.status === 'completed')
  const runningRuns = runs.filter((run) => run.status === 'running').length
  const failedRuns = runs.filter((run) => run.status === 'failed').length

  const governanceValidated = completedRuns.filter(runHasGovernanceSignal).length
  const governanceCoverage = completedRuns.length
    ? Math.round((governanceValidated / completedRuns.length) * 100)
    : 0

  const deliveryActivity = activity.filter((entry) =>
    entry.type === 'delivery' || entry.type === 'audience_sync'
  )
  const successfulDeliveries = deliveryActivity.filter((entry) => entry.status === 'success').length
  const deliverySuccessRate = deliveryActivity.length
    ? Math.round((successfulDeliveries / deliveryActivity.length) * 100)
    : 0

  const connectedDestinations = connections.filter((conn) => conn.status === 'connected').length
  const erroredDestinations = connections.filter((conn) => conn.status === 'error').length

  const agentStatus: HealthStatus = failedRuns > 0 ? 'critical' : runningRuns > 0 ? 'attention' : 'healthy'

  const governanceStatus: HealthStatus = completedRuns.length === 0
    ? 'attention'
    : governanceCoverage >= 70
      ? 'healthy'
      : governanceCoverage >= 40
        ? 'attention'
        : 'critical'

  const deliveryStatus: HealthStatus = erroredDestinations > 0
    ? 'critical'
    : deliveryActivity.length === 0
      ? 'attention'
      : deliverySuccessRate >= 90
        ? 'healthy'
        : 'attention'

  const cards = [
    {
      id: 'agent' as const,
      title: 'Agent Orchestration',
      status: agentStatus,
      summary: `${runningRuns} running · ${completedRuns.length} completed · ${failedRuns} failed`,
      detail: 'Monitors active and completed agentic workflow execution.',
      actionLabel: 'Open Agent Spark',
      actionPath: '/app/agent-spark',
    },
    {
      id: 'governance' as const,
      title: 'Governance Coverage',
      status: governanceStatus,
      summary: `${governanceCoverage}% of completed runs include validation evidence`,
      detail: 'Tracks validation and citation signals across completed runs.',
      actionLabel: 'Open Insights',
      actionPath: '/app/insights',
    },
    {
      id: 'delivery' as const,
      title: 'Delivery Reliability',
      status: deliveryStatus,
      summary: `${deliverySuccessRate}% successful deliveries · ${erroredDestinations} errored connections`,
      detail: 'Combines destination health and delivery activity outcomes.',
      actionLabel: 'Open Integrations',
      actionPath: '/app/account-settings/developer?dev_sub_tab=integrations',
    },
  ]

  return {
    overallStatus: combineStatus(cards.map((card) => card.status)),
    cards,
    totals: {
      completedRuns: completedRuns.length,
      runningRuns,
      failedRuns,
      governanceCoverage,
      deliverySuccessRate,
      connectedDestinations,
      erroredDestinations,
    },
  }
}

function buildArtifacts(input: HomeSnapshotInput): WorkspaceArtifact[] {
  const artifacts: WorkspaceArtifact[] = []

  for (const chart of input.charts.data?.data ?? []) {
    artifacts.push({
      id: `chart:${chart.id}`,
      type: 'chart',
      title: chart.name,
      subtitle: 'Chart',
      updatedAt: chart.updated_at,
      path: `/app/chart-builder/chart/${chart.id}`,
    })
  }

  for (const crosstab of input.crosstabs.data?.data ?? []) {
    artifacts.push({
      id: `crosstab:${crosstab.id}`,
      type: 'crosstab',
      title: crosstab.name,
      subtitle: 'Crosstab',
      updatedAt: crosstab.updated_at,
      path: `/app/crosstabs/${crosstab.id}`,
    })
  }

  for (const dashboard of input.dashboards.data?.data ?? []) {
    artifacts.push({
      id: `dashboard:${dashboard.id}`,
      type: 'dashboard',
      title: dashboard.name,
      subtitle: 'Dashboard',
      updatedAt: dashboard.updated_at,
      path: `/app/dashboards/${dashboard.id}`,
    })
  }

  for (const audience of input.audiences.data?.data ?? []) {
    artifacts.push({
      id: `audience:${audience.id}`,
      type: 'audience',
      title: audience.name,
      subtitle: 'Audience',
      updatedAt: audience.updated_at,
      path: `/app/audiences/${audience.id}`,
    })
  }

  for (const report of input.reports.data?.data ?? []) {
    artifacts.push({
      id: `report:${report.id}`,
      type: 'report',
      title: report.name,
      subtitle: 'Report',
      updatedAt: report.updated_at,
      path: '/app/reports',
    })
  }

  for (const conversation of input.conversations.data ?? []) {
    artifacts.push({
      id: `conversation:${conversation.id}`,
      type: 'conversation',
      title: conversation.title,
      subtitle: 'Agent Spark Conversation',
      updatedAt: conversation.updated_at,
      path: `/app/agent-spark/${conversation.id}`,
    })
  }

  for (const run of input.runs.data ?? []) {
    artifacts.push({
      id: `agent_run:${run.id}`,
      type: 'agent_run',
      title: run.brief,
      subtitle: `Flow ${run.flow_id}`,
      updatedAt: run.completed_at ?? run.started_at,
      path: '/app/agent-spark',
    })
  }

  return artifacts
    .sort((a, b) => toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt))
    .slice(0, RECENT_LIMIT)
}

function buildAttentionItems(input: HomeSnapshotInput, ops: OpsHealthSummary): AttentionItem[] {
  const items: AttentionItem[] = []

  for (const run of input.runs.data ?? []) {
    if (run.status !== 'failed') continue
    items.push({
      id: `run:${run.id}`,
      severity: 'critical',
      title: 'Agent run failed',
      description: `${run.brief}`,
      createdAt: run.completed_at ?? run.started_at,
      actionLabel: 'Review agent runs',
      actionPath: '/app/agent-spark',
    })
  }

  for (const conn of input.connections.data ?? []) {
    if (conn.status !== 'error') continue
    items.push({
      id: `connection:${conn.id}`,
      severity: 'warning',
      title: `${conn.app_id} connection requires attention`,
      description: 'Destination connection is reporting errors. Re-test or reconnect before delivery.',
      createdAt: conn.last_tested_at ?? conn.connected_at,
      actionLabel: 'Open integrations',
      actionPath: '/app/account-settings/developer?dev_sub_tab=integrations',
    })
  }

  for (const insight of input.insights.data ?? []) {
    items.push({
      id: `insight:${insight.id}`,
      severity: 'info',
      title: insight.title,
      description: insight.summary,
      createdAt: insight.created_at,
      actionLabel: 'Open Agent Spark',
      actionPath: '/app/agent-spark',
    })
  }

  if (ops.totals.completedRuns > 0 && ops.totals.governanceCoverage < 70) {
    items.push({
      id: 'governance-coverage',
      severity: ops.totals.governanceCoverage < 40 ? 'critical' : 'warning',
      title: 'Governance coverage below target',
      description: `${ops.totals.governanceCoverage}% of completed runs include validation evidence. Target is 70% or higher.`,
      createdAt: new Date().toISOString(),
      actionLabel: 'Open Insights',
      actionPath: '/app/insights',
    })
  }

  return items
    .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt))
    .slice(0, ATTENTION_LIMIT)
}

function derivePanelState<T>(
  items: T[],
  isLoading: boolean,
  hasError: boolean,
  fallback: Omit<HomePanel<T>, 'state' | 'items' | 'errorMessage'>,
  errorMessage: string
): HomePanel<T> {
  if (items.length > 0) {
    return {
      state: 'ready',
      items,
      ...fallback,
    }
  }

  if (isLoading) {
    return {
      state: 'loading',
      items,
      ...fallback,
    }
  }

  if (hasError) {
    return {
      state: 'error',
      items,
      errorMessage,
      ...fallback,
    }
  }

  return {
    state: 'empty',
    items,
    ...fallback,
  }
}

export function deriveHomeSnapshot(input: HomeSnapshotInput): HomeSnapshot {
  const opsHealth = deriveOpsHealth(input)
  const artifacts = buildArtifacts(input)
  const attentionItems = buildAttentionItems(input, opsHealth)

  const recentWork = derivePanelState(
    artifacts,
    input.dashboards.isLoading ||
      input.charts.isLoading ||
      input.crosstabs.isLoading ||
      input.audiences.isLoading ||
      input.reports.isLoading ||
      input.conversations.isLoading ||
      input.runs.isLoading,
    input.dashboards.isError ||
      input.charts.isError ||
      input.crosstabs.isError ||
      input.audiences.isError ||
      input.reports.isError ||
      input.conversations.isError ||
      input.runs.isError,
    {
      emptyTitle: 'No work artifacts yet',
      emptyDescription: 'Create a chart, crosstab, or dashboard to populate your activity stream.',
      emptyCtaLabel: 'Open Charts',
      emptyCtaPath: '/app/chart-builder',
    },
    'Unable to load recent work right now.'
  )

  const attentionQueue = derivePanelState(
    attentionItems,
    input.runs.isLoading ||
      input.connections.isLoading ||
      input.activity.isLoading ||
      input.insights.isLoading,
    input.runs.isError ||
      input.connections.isError ||
      input.activity.isError ||
      input.insights.isError,
    {
      emptyTitle: 'No attention items',
      emptyDescription: 'Operations look stable. New insights and alerts will appear here.',
      emptyCtaLabel: 'Run Agent Flow',
      emptyCtaPath: '/app/agent-spark',
    },
    'Unable to load attention items right now.'
  )

  const workspaceTotals = {
    audiences: input.audiences.data?.meta.total ?? 0,
    charts: input.charts.data?.meta.total ?? 0,
    crosstabs: input.crosstabs.data?.meta.total ?? 0,
    dashboards: input.dashboards.data?.meta.total ?? 0,
    reports: input.reports.data?.meta.total ?? 0,
  }

  return {
    commandCenter: {
      title: 'Operational AI Command Center',
      subtitle: input.activeProjectName
        ? `Executing in ${input.activeProjectName}. Route analysis, governance, and delivery from one surface.`
        : 'Route analysis, governance, and delivery workflows from one operational surface.',
      promptPlaceholder: 'Describe the analysis outcome you need, constraints, and target deliverables.',
      helperText: 'Spark launches a structured workflow with output routing and governance context.',
      datasetLabel: 'GWI Core',
    },
    opsHealth,
    launchpad: launchpadActions,
    recentWork,
    attentionQueue,
    workspaceTotals,
    featuredTemplates: resolveStarterTemplates({
      contextType: 'general',
      limit: 4,
    }),
    isLoading:
      input.runs.isLoading ||
      input.conversations.isLoading ||
      input.insights.isLoading ||
      input.dashboards.isLoading ||
      input.charts.isLoading ||
      input.crosstabs.isLoading ||
      input.audiences.isLoading ||
      input.reports.isLoading ||
      input.connections.isLoading ||
      input.activity.isLoading,
    activeProjectId: input.activeProjectId,
    activeProjectName: input.activeProjectName,
  }
}

export function useHomeSnapshot() {
  const activeProject = useWorkspaceStore((state) => state.activeProject)
  const activeProjectId = activeProject?.id ?? null
  const activeProjectName = activeProject?.name ?? null

  const dashboardsQuery = useDashboards({ page: 1, per_page: 6, ...(activeProjectId ? { project_id: activeProjectId } : {}) })
  const chartsQuery = useCharts({ page: 1, per_page: 6, ...(activeProjectId ? { project_id: activeProjectId } : {}) })
  const crosstabsQuery = useCrosstabs({ page: 1, per_page: 6, ...(activeProjectId ? { project_id: activeProjectId } : {}) })
  const audiencesQuery = useAudiences({ page: 1, per_page: 6, ...(activeProjectId ? { project_id: activeProjectId } : {}) })
  const reportsQuery = useReports({ page: 1, per_page: 6, ...(activeProjectId ? { project_id: activeProjectId } : {}) })

  const runsQuery = useAgenticRuns()
  const conversationsQuery = useSparkConversations()
  const insightsQuery = useSparkInsights()
  const connectionsQuery = useIntegrationConnections()
  const activityQuery = useIntegrationDeliveryHistory()

  const snapshot = useMemo(
    () =>
      deriveHomeSnapshot({
        activeProjectId,
        activeProjectName,
        runs: {
          data: runsQuery.data,
          isLoading: runsQuery.isLoading,
          isError: runsQuery.isError,
        },
        conversations: {
          data: conversationsQuery.data,
          isLoading: conversationsQuery.isLoading,
          isError: conversationsQuery.isError,
        },
        insights: {
          data: insightsQuery.data,
          isLoading: insightsQuery.isLoading,
          isError: insightsQuery.isError,
        },
        dashboards: {
          data: dashboardsQuery.data,
          isLoading: dashboardsQuery.isLoading,
          isError: dashboardsQuery.isError,
        },
        charts: {
          data: chartsQuery.data,
          isLoading: chartsQuery.isLoading,
          isError: chartsQuery.isError,
        },
        crosstabs: {
          data: crosstabsQuery.data,
          isLoading: crosstabsQuery.isLoading,
          isError: crosstabsQuery.isError,
        },
        audiences: {
          data: audiencesQuery.data,
          isLoading: audiencesQuery.isLoading,
          isError: audiencesQuery.isError,
        },
        reports: {
          data: reportsQuery.data,
          isLoading: reportsQuery.isLoading,
          isError: reportsQuery.isError,
        },
        connections: {
          data: connectionsQuery.data,
          isLoading: connectionsQuery.isLoading,
          isError: connectionsQuery.isError,
        },
        activity: {
          data: activityQuery.data,
          isLoading: activityQuery.isLoading,
          isError: activityQuery.isError,
        },
      }),
    [
      activeProjectId,
      activeProjectName,
      runsQuery.data,
      runsQuery.isLoading,
      runsQuery.isError,
      conversationsQuery.data,
      conversationsQuery.isLoading,
      conversationsQuery.isError,
      insightsQuery.data,
      insightsQuery.isLoading,
      insightsQuery.isError,
      dashboardsQuery.data,
      dashboardsQuery.isLoading,
      dashboardsQuery.isError,
      chartsQuery.data,
      chartsQuery.isLoading,
      chartsQuery.isError,
      crosstabsQuery.data,
      crosstabsQuery.isLoading,
      crosstabsQuery.isError,
      audiencesQuery.data,
      audiencesQuery.isLoading,
      audiencesQuery.isError,
      reportsQuery.data,
      reportsQuery.isLoading,
      reportsQuery.isError,
      connectionsQuery.data,
      connectionsQuery.isLoading,
      connectionsQuery.isError,
      activityQuery.data,
      activityQuery.isLoading,
      activityQuery.isError,
    ]
  )

  const refetchAll = useCallback(async () => {
    await Promise.allSettled([
      runsQuery.refetch(),
      conversationsQuery.refetch(),
      insightsQuery.refetch(),
      dashboardsQuery.refetch(),
      chartsQuery.refetch(),
      crosstabsQuery.refetch(),
      audiencesQuery.refetch(),
      reportsQuery.refetch(),
      connectionsQuery.refetch(),
      activityQuery.refetch(),
    ])
  }, [
    runsQuery,
    conversationsQuery,
    insightsQuery,
    dashboardsQuery,
    chartsQuery,
    crosstabsQuery,
    audiencesQuery,
    reportsQuery,
    connectionsQuery,
    activityQuery,
  ])

  return {
    snapshot,
    refetchAll,
  }
}
