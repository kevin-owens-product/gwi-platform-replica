import { Shield, AlertTriangle, Palette, FileText, Download } from 'lucide-react'
import { useTeamWorkspace } from '@/hooks/useTeams'
import { useWorkspaceStore } from '@/stores/workspace'
import { Badge } from '@/components/shared'
import './GuardrailsPanel.css'

interface GuardrailsPanelProps {
  compact?: boolean
}

export default function GuardrailsPanel({ compact }: GuardrailsPanelProps) {
  const activeTeamId = useWorkspaceStore((s) => s.activeTeamId)
  const { data: workspace } = useTeamWorkspace(activeTeamId || '')

  if (!activeTeamId || !workspace) return null

  const g = workspace.guardrails

  return (
    <div className={`guardrails-panel ${compact ? 'guardrails-panel--compact' : ''}`}>
      <div className="guardrails-panel__header">
        <Shield size={14} />
        <span>Team Guardrails</span>
      </div>

      {g.required_tags.length > 0 && (
        <div className="guardrails-panel__item">
          <FileText size={12} />
          <span>Required tags: {g.required_tags.join(', ')}</span>
        </div>
      )}

      {g.naming_convention && (
        <div className="guardrails-panel__item">
          <AlertTriangle size={12} />
          <span>Naming convention active</span>
        </div>
      )}

      {g.brand_colors.length > 0 && (
        <div className="guardrails-panel__item">
          <Palette size={12} />
          <div className="guardrails-panel__colors">
            {g.brand_colors.map((c, i) => (
              <span key={i} className="guardrails-panel__swatch" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      )}

      {(g.require_review_before_share || g.require_review_before_export) && (
        <div className="guardrails-panel__item guardrails-panel__item--warning">
          <AlertTriangle size={12} />
          <span>
            {g.require_review_before_share && g.require_review_before_export
              ? 'Review required for sharing & exports'
              : g.require_review_before_share
              ? 'Review required before sharing'
              : 'Review required before export'}
          </span>
        </div>
      )}

      {g.max_export_rows && (
        <div className="guardrails-panel__item">
          <Download size={12} />
          <span>Export limit: {g.max_export_rows.toLocaleString()} rows</span>
        </div>
      )}
    </div>
  )
}
