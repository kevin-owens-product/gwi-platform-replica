import { Sparkles, Users } from 'lucide-react'
import { useTeamWorkspace, useTeam } from '@/hooks/useTeams'
import { useWorkspaceStore } from '@/stores/workspace'
import './SparkContextBadge.css'

export default function SparkContextBadge() {
  const activeTeamId = useWorkspaceStore((s) => s.activeTeamId)
  const { data: team } = useTeam(activeTeamId || '')
  const { data: workspace } = useTeamWorkspace(activeTeamId || '')

  if (!activeTeamId || !team || !workspace) return null

  return (
    <div className="spark-context-badge">
      <div className="spark-context-badge__header">
        <Users size={14} />
        <span>{team.name}</span>
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
