import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { canvasApi } from '@/api'
import type { CanvasProject } from '@/api/types'

export function useCanvasProjects() {
  return useQuery({
    queryKey: ['canvas-projects'],
    queryFn: () => canvasApi.listProjects(),
  })
}

export function useCanvasProject(id: string) {
  return useQuery({
    queryKey: ['canvas-projects', id],
    queryFn: () => canvasApi.getProject(id),
    enabled: !!id,
  })
}

export function useCreateCanvasProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; description?: string; template_id?: string }) =>
      canvasApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canvas-projects'] })
    },
  })
}

export function useUpdateCanvasStep() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      stepType,
      data,
    }: {
      projectId: string
      stepType: string
      data: Record<string, unknown>
    }) => canvasApi.updateStep(projectId, stepType, data),
    onSuccess: (project: CanvasProject) => {
      queryClient.invalidateQueries({ queryKey: ['canvas-projects'] })
      queryClient.setQueryData(['canvas-projects', project.id], project)
    },
  })
}

export function useDeleteCanvasProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => canvasApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canvas-projects'] })
    },
  })
}

export function useCanvasTemplates() {
  return useQuery({
    queryKey: ['canvas-templates'],
    queryFn: () => canvasApi.listTemplates(),
  })
}
