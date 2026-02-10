import type { AgenticFlow, AgenticRun, AgenticRunOutput } from '@/api/types/agentic'
import { agenticFlows } from './registry'

export function runAgenticFlow(flowId: string, brief: string): AgenticRun {
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

  const outputs: AgenticRunOutput[] = flow.steps.map((step) => ({
    id: `out-${Math.random().toString(36).slice(2, 8)}`,
    label: step.name,
    type: step.output_artifacts?.includes('dashboard') ? 'dashboard' : 'insight',
    summary: `${step.description} executed with mock data for "${brief}".`,
  }))

  return {
    id: `run-${Math.random().toString(36).slice(2, 8)}`,
    flow_id: flow.id,
    status: 'completed',
    started_at: startedAt,
    completed_at: new Date(Date.now() + 120000).toISOString(),
    brief,
    outputs,
  }
}

export function getAgenticFlow(flowId: string): AgenticFlow | undefined {
  return agenticFlows.find((flow) => flow.id === flowId)
}
