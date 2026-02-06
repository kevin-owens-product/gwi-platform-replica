import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminApi } from '@/api'
import type { InviteUserRequest, UpdateUserRoleRequest } from '@/api/types'

export function useAdminUsers(params?: { page?: number; per_page?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => adminApi.listUsers(params),
  })
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ['admin-users', id],
    queryFn: () => adminApi.getUser(id),
    enabled: !!id,
  })
}

export function useInviteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InviteUserRequest) => adminApi.inviteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Invitation sent')
    },
    onError: () => {
      toast.error('Failed to send invitation')
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRoleRequest }) =>
      adminApi.updateUserRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User role updated')
    },
    onError: () => {
      toast.error('Failed to update user role')
    },
  })
}

export function useDisableUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adminApi.disableUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User disabled')
    },
    onError: () => {
      toast.error('Failed to disable user')
    },
  })
}

export function useEnableUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adminApi.enableUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User enabled')
    },
    onError: () => {
      toast.error('Failed to enable user')
    },
  })
}

export function useRemoveUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adminApi.removeUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User removed')
    },
    onError: () => {
      toast.error('Failed to remove user')
    },
  })
}

export function useUsageStats(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['admin-usage', params],
    queryFn: () => adminApi.getUsageStats(params),
  })
}
