import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { projectsApi, orgApi } from '@/api'
import type { CreateProjectRequest, UpdateProjectRequest, Project } from '@/api/types'

export function useProjects(params?: { page?: number; per_page?: number; search?: string; scope?: string; team_id?: string; status?: string }) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsApi.list(params),
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created')
    },
    onError: () => {
      toast.error('Failed to create project')
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) => projectsApi.update(id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] })
      toast.success('Project updated')
    },
    onError: () => {
      toast.error('Failed to update project')
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted')
    },
    onError: () => {
      toast.error('Failed to delete project')
    },
  })
}

export function useProjectWorkspace(projectId: string) {
  return useQuery({
    queryKey: ['project-workspace', projectId],
    queryFn: () => projectsApi.getWorkspace(projectId),
    enabled: !!projectId,
  })
}

export function useUpdateProjectWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Parameters<typeof projectsApi.updateWorkspace>[1] }) =>
      projectsApi.updateWorkspace(projectId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-workspace', variables.projectId] })
      toast.success('Project workspace updated')
    },
    onError: () => {
      toast.error('Failed to update project workspace')
    },
  })
}

export function useOrgWorkspace() {
  return useQuery({
    queryKey: ['org-workspace'],
    queryFn: () => orgApi.getWorkspace(),
  })
}

export function useUpdateOrgWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof orgApi.updateWorkspace>[0]) => orgApi.updateWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-workspace'] })
      toast.success('Organization workspace updated')
    },
    onError: () => {
      toast.error('Failed to update organization workspace')
    },
  })
}

export function toActiveProject(project: Project) {
  return { id: project.id, name: project.name, scope: project.scope, team_id: project.team_id }
}
