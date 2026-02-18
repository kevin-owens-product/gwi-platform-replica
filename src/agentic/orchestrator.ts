import type { AgenticFlow, AgenticRun, AgenticRunOutput, AgentAnalysisConfig } from '@/api/types/agentic'
import { agenticFlows } from './registry'

export function runAgenticFlow(flowId: string, brief: string, analysisConfig?: AgentAnalysisConfig): AgenticRun {
  const flow = agenticFlows.find((item) => item.id === flowId)
  const startedAt = new Date().toISOString()

  if (!flow) {
    return {
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
          summary: 'Flow not found in registry.',
        },
      ],
    }
  }

  const filterParts: string[] = []
  if (analysisConfig?.timeframe) filterParts.push(analysisConfig.timeframe)
  if (analysisConfig?.granularity) filterParts.push(`${analysisConfig.granularity}-level`)
  const filterLabel = filterParts.length ? ` (${filterParts.join(', ')})` : ''

  const outputs: AgenticRunOutput[] = flow.steps.map((step) => ({
    id: `out-${Math.random().toString(36).slice(2, 8)}`,
    label: step.name,
    type: step.output_artifacts?.includes('dashboard') ? 'dashboard' : 'insight',
    summary: `${step.description} executed with mock data for "${brief}"${filterLabel}.`,
  }))

  return {
    id: `run-${Math.random().toString(36).slice(2, 8)}`,
    flow_id: flow.id,
    status: 'completed',
    started_at: startedAt,
    completed_at: new Date(Date.now() + 120000).toISOString(),
    brief,
    analysis_config: analysisConfig,
    outputs,
  }
}

export function getAgenticFlow(flowId: string): AgenticFlow | undefined {
  return agenticFlows.find((flow) => flow.id === flowId)
}
