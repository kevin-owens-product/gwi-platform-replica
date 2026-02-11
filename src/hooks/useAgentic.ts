import { useMutation, useQuery } from '@tanstack/react-query'
import { agenticApi } from '@/api'

export function useAgenticInventory() {
  return useQuery({
    queryKey: ['agentic', 'inventory'],
    queryFn: () => agenticApi.getInventory(),
  })
}

export function useAgenticFlows() {
  return useQuery({
    queryKey: ['agentic', 'flows'],
    queryFn: () => agenticApi.listFlows(),
  })
}

export function useAgenticRuns() {
  return useQuery({
    queryKey: ['agentic', 'runs'],
    queryFn: () => agenticApi.listRuns(),
  })
}

export function useRunAgenticFlow() {
  return useMutation({
    mutationFn: ({ flowId, brief }: { flowId: string; brief: string }) =>
      agenticApi.runFlow(flowId, brief),
  })
}
