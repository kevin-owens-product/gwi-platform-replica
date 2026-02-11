import type { AgenticCapabilityInventory, AgenticFlow, AgenticRun } from '../../types/agentic'
import { agenticCapabilities, agenticFlows, agenticLinkages, agenticRuns } from '../data/agentic'

export const agenticApi = {
  getInventory: async (): Promise<AgenticCapabilityInventory> => ({
    capabilities: agenticCapabilities,
    flows: agenticFlows,
    linkages: agenticLinkages,
  }),

  listFlows: async (): Promise<AgenticFlow[]> => agenticFlows,

  getFlow: async (flowId: string): Promise<AgenticFlow | undefined> =>
    agenticFlows.find((flow) => flow.id === flowId),

  listRuns: async (): Promise<AgenticRun[]> => agenticRuns,

  runFlow: async (flowId: string, brief: string): Promise<AgenticRun> => ({
    id: `run-${Math.random().toString(36).slice(2, 8)}`,
    flow_id: flowId,
    status: 'completed',
    started_at: new Date().toISOString(),
    completed_at: new Date(Date.now() + 120000).toISOString(),
    brief,
    outputs: [
      {
        id: `out-${Math.random().toString(36).slice(2, 8)}`,
        label: 'Insight Summary',
        type: 'insight',
        summary: 'Auto-generated narrative summary with citations and action prompts.',
      },
    ],
  }),
}
