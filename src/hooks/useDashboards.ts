import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { dashboardsApi } from '@/api'
import type { CreateDashboardRequest, UpdateDashboardRequest, ExportFormat, DashboardListParams } from '@/api/types'

export function useDashboards(params?: DashboardListParams) {
  return useQuery({
    queryKey: ['dashboards', params],
    queryFn: () => dashboardsApi.list(params),
  })
}

export function useDashboard(id: string) {
  return useQuery({
    queryKey: ['dashboards', id],
    queryFn: () => dashboardsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateDashboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDashboardRequest) => dashboardsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] })
      toast.success('Dashboard created')
    },
    onError: () => {
      toast.error('Failed to create dashboard')
    },
  })
}

export function useUpdateDashboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDashboardRequest }) =>
      dashboardsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] })
      queryClient.invalidateQueries({ queryKey: ['dashboards', id] })
      toast.success('Dashboard updated')
    },
    onError: () => {
      toast.error('Failed to update dashboard')
    },
  })
}

export function useDeleteDashboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => dashboardsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] })
      toast.success('Dashboard deleted')
    },
    onError: () => {
      toast.error('Failed to delete dashboard')
    },
  })
}

export function useDashboardTemplates() {
  return useQuery({
    queryKey: ['dashboards', 'templates'],
    queryFn: () => dashboardsApi.listTemplates(),
  })
}

export function useDashboardFilters(dashboardId: string) {
  return useQuery({
    queryKey: ['dashboards', dashboardId, 'filters'],
    queryFn: () => dashboardsApi.getFilters(dashboardId),
    enabled: !!dashboardId,
  })
}

export function useExportDashboard() {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: ExportFormat }) =>
      dashboardsApi.export(id, format),
    onSuccess: () => {
      toast.success('Dashboard exported')
    },
    onError: () => {
      toast.error('Failed to export dashboard')
    },
  })
}
