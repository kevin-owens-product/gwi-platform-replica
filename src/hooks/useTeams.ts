import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { teamsApi } from '@/api'
import type {
  CreateTeamRequest,
  UpdateTeamRequest,
  TeamInviteRequest,
  UpdateTeamMemberRoleRequest,
} from '@/api/types'

// ── Team CRUD ──────────────────────────────────────────────────────────────

export function useTeams(params?: { page?: number; per_page?: number; search?: string }) {
  return useQuery({
    queryKey: ['teams', params],
    queryFn: () => teamsApi.list(params),
  })
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: () => teamsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTeamRequest) => teamsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      toast.success('Team created')
    },
    onError: () => {
      toast.error('Failed to create team')
    },
  })
}

export function useUpdateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamRequest }) =>
      teamsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      toast.success('Team updated')
    },
    onError: () => {
      toast.error('Failed to update team')
    },
  })
}

export function useDeleteTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => teamsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      toast.success('Team deleted')
    },
    onError: () => {
      toast.error('Failed to delete team')
    },
  })
}

// ── Members ────────────────────────────────────────────────────────────────

export function useTeamMembers(teamId: string, params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ['team-members', teamId, params],
    queryFn: () => teamsApi.listMembers(teamId, params),
    enabled: !!teamId,
  })
}

export function useInviteToTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: TeamInviteRequest }) =>
      teamsApi.inviteMember(teamId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', variables.teamId] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      toast.success('Invitation sent')
    },
    onError: () => {
      toast.error('Failed to send invitation')
    },
  })
}

export function useUpdateTeamMemberRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ teamId, userId, data }: { teamId: string; userId: string; data: UpdateTeamMemberRoleRequest }) =>
      teamsApi.updateMemberRole(teamId, userId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', variables.teamId] })
      toast.success('Role updated')
    },
    onError: () => {
      toast.error('Failed to update role')
    },
  })
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      teamsApi.removeMember(teamId, userId),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', variables.teamId] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      toast.success('Member removed')
    },
    onError: () => {
      toast.error('Failed to remove member')
    },
  })
}

// ── Workspace ──────────────────────────────────────────────────────────────

export function useTeamWorkspace(teamId: string) {
  return useQuery({
    queryKey: ['team-workspace', teamId],
    queryFn: () => teamsApi.getWorkspace(teamId),
    enabled: !!teamId,
  })
}

export function useUpdateTeamWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: Parameters<typeof teamsApi.updateWorkspace>[1] }) =>
      teamsApi.updateWorkspace(teamId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-workspace', variables.teamId] })
      toast.success('Workspace updated')
    },
    onError: () => {
      toast.error('Failed to update workspace')
    },
  })
}

export function useTeamViolations(teamId: string) {
  return useQuery({
    queryKey: ['team-violations', teamId],
    queryFn: () => teamsApi.getViolations(teamId),
    enabled: !!teamId,
  })
}

// ── Approvals ──────────────────────────────────────────────────────────────

export function useTeamApprovals(teamId: string, params?: { status?: string }) {
  return useQuery({
    queryKey: ['team-approvals', teamId, params],
    queryFn: () => teamsApi.listApprovals(teamId, params),
    enabled: !!teamId,
  })
}

export function useReviewApproval() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ teamId, approvalId, data }: { teamId: string; approvalId: string; data: { status: 'approved' | 'rejected'; comment?: string } }) =>
      teamsApi.reviewApproval(teamId, approvalId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-approvals', variables.teamId] })
      toast.success(`Request ${variables.data.status}`)
    },
    onError: () => {
      toast.error('Failed to process review')
    },
  })
}
