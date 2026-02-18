import { apiClient } from '../client'
import type { AgenticCapabilityInventory, AgenticFlow, AgenticRun, AgentAnalysisConfig } from '../types/agentic'

export const agenticApi = {
  getInventory: async (): Promise<AgenticCapabilityInventory> =>
    apiClient.get('agentic/inventory').json(),

  listFlows: async (): Promise<AgenticFlow[]> =>
    apiClient.get('agentic/flows').json(),

  getFlow: async (flowId: string): Promise<AgenticFlow> =>
    apiClient.get(`agentic/flows/${flowId}`).json(),

  listRuns: async (): Promise<AgenticRun[]> =>
    apiClient.get('agentic/runs').json(),

  runFlow: async (flowId: string, brief: string, analysisConfig?: AgentAnalysisConfig): Promise<AgenticRun> =>
    apiClient.post('agentic/runs', { json: { flow_id: flowId, brief, analysis_config: analysisConfig } }).json(),
}
