import type { AgenticCapabilityInventory, AgenticFlow, AgenticRun, AgentAnalysisConfig } from '../../types/agentic'
import { agenticCapabilities, agenticFlows, agenticLinkages, agenticRuns } from '../data/agentic'

const runsStore: AgenticRun[] = [...agenticRuns]

function outputTypeFromArtifact(artifact: string): AgenticRun['outputs'][number]['type'] {
  if (artifact.includes('dashboard')) return 'dashboard'
  if (artifact.includes('deck')) return 'deck'
  if (artifact.includes('chart')) return 'chart'
  if (artifact.includes('crosstab') || artifact.includes('significance') || artifact.includes('lift')) return 'crosstab'
  if (artifact.includes('dataset') || artifact.includes('data')) return 'dataset'
  if (artifact.includes('alert')) return 'alert'
  if (artifact.includes('report') || artifact.includes('validation') || artifact.includes('citation')) return 'report'
  return 'insight'
}

function formatAnalysisConfigSummary(config?: AgentAnalysisConfig): string {
  if (!config) return ''
  const parts: string[] = []
  if (config.timeframe) parts.push(`timeframe: ${config.timeframe}`)
  if (config.granularity) parts.push(`granularity: ${config.granularity}`)
  if (config.rebase_mode) parts.push(`rebase: ${config.rebase_mode}`)
  if (config.wave_ids?.length) parts.push(`waves: ${config.wave_ids.length}`)
  if (config.compare_waves) parts.push('wave comparison enabled')
  return parts.length > 0 ? ` [Filters: ${parts.join(', ')}]` : ''
}

function toTitleCase(value: string): string {
  return value
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export const agenticApi = {
  getInventory: async (): Promise<AgenticCapabilityInventory> => ({
    capabilities: agenticCapabilities,
    flows: agenticFlows,
    linkages: agenticLinkages,
  }),

  listFlows: async (): Promise<AgenticFlow[]> => agenticFlows,

  getFlow: async (flowId: string): Promise<AgenticFlow | undefined> =>
    agenticFlows.find((flow) => flow.id === flowId),

  listRuns: async (): Promise<AgenticRun[]> =>
    runsStore.map((run) => ({
      ...run,
      outputs: [...run.outputs],
    })),

  runFlow: async (flowId: string, brief: string, analysisConfig?: AgentAnalysisConfig): Promise<AgenticRun> => {
    const flow = agenticFlows.find((item) => item.id === flowId)
    const startedAt = new Date().toISOString()

    if (!flow) {
      const failedRun: AgenticRun = {
        id: `run-${Math.random().toString(36).slice(2, 8)}`,
        flow_id: flowId,
        status: 'failed',
        started_at: startedAt,
        completed_at: startedAt,
        brief,
        analysis_config: analysisConfig,
        outputs: [
          {
            id: `out-${Math.random().toString(36).slice(2, 8)}`,
            label: 'Flow Error',
            type: 'alert',
            summary: `Unable to run flow "${flowId}" because it was not found.`,
          },
        ],
      }
      runsStore.unshift(failedRun)
      return failedRun
    }

    const filterSummary = formatAnalysisConfigSummary(analysisConfig)

    const outputs = flow.steps.flatMap((step) => {
      const artifacts = step.output_artifacts?.length ? step.output_artifacts : ['insight_summary']
      return artifacts.map((artifact) => ({
        id: `out-${Math.random().toString(36).slice(2, 8)}`,
        label: toTitleCase(artifact),
        type: outputTypeFromArtifact(artifact),
        summary: `${step.name} produced ${toTitleCase(artifact)} for "${brief}".${filterSummary}`,
      }))
    })

    const run: AgenticRun = {
      id: `run-${Math.random().toString(36).slice(2, 8)}`,
      flow_id: flow.id,
      status: 'completed',
      started_at: startedAt,
      completed_at: new Date(Date.now() + 90_000).toISOString(),
      brief,
      analysis_config: analysisConfig,
      outputs,
    }

    runsStore.unshift(run)
    return run
  },
}
