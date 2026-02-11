import { Sparkles, Users, FolderKanban } from 'lucide-react'
import { useTeamWorkspace, useTeam } from '@/hooks/useTeams'
import { useProjectWorkspace } from '@/hooks/useProjects'
import { useWorkspaceStore } from '@/stores/workspace'
import './SparkContextBadge.css'

export default function SparkContextBadge() {
  const activeTeamId = useWorkspaceStore((s) => s.activeTeamId)
  const activeProject = useWorkspaceStore((s) => s.activeProject)
  const { data: team } = useTeam(activeProject?.team_id || activeTeamId || '')
  const { data: teamWorkspace } = useTeamWorkspace(activeProject?.team_id || activeTeamId || '')
  const { data: projectWorkspace } = useProjectWorkspace(activeProject?.id || '')

  const workspace = projectWorkspace ?? teamWorkspace

  if ((!activeProject && !activeTeamId) || !workspace) return null

  return (
    <div className="spark-context-badge">
      <div className="spark-context-badge__header">
        {activeProject ? <FolderKanban size={14} /> : <Users size={14} />}
        <span>{activeProject ? activeProject.name : team?.name}</span>
      </div>
      {workspace.context.business_objectives.length > 0 && (
        <div className="spark-context-badge__detail">
          <Sparkles size={12} />
          <span>
            {workspace.context.business_objectives.length} objective{workspace.context.business_objectives.length !== 1 ? 's' : ''} active
          </span>
        </div>
      )}
      {workspace.guardrails.spark_system_prompt_additions && (
        <div className="spark-context-badge__detail spark-context-badge__detail--active">
          <span>AI context configured</span>
        </div>
      )}
    </div>
  )
}
