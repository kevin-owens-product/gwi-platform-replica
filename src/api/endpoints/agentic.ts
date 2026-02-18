import { backendClient } from '../backendClient'
import type { AgenticCapabilityInventory, AgenticFlow, AgenticRun, AgentAnalysisConfig } from '../types/agentic'

export const agenticApi = {
  getInventory: async (): Promise<AgenticCapabilityInventory> =>
    backendClient.get('agentic/inventory').json(),

  listFlows: async (): Promise<AgenticFlow[]> =>
    backendClient.get('agentic/flows').json(),

  getFlow: async (flowId: string): Promise<AgenticFlow> =>
    backendClient.get(`agentic/flows/${flowId}`).json(),

  listRuns: async (): Promise<AgenticRun[]> =>
    backendClient.get('agentic/runs').json(),

  runFlow: async (flowId: string, brief: string, analysisConfig?: AgentAnalysisConfig): Promise<AgenticRun> =>
    backendClient.post('agentic/runs', { json: { flow_id: flowId, brief, analysis_config: analysisConfig } }).json(),
}
