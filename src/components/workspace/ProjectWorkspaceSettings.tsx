import { useState } from 'react'
import { Save, Target, Building2, Users, BarChart2, FileText } from 'lucide-react'
import { useProjectWorkspace, useUpdateProjectWorkspace } from '@/hooks/useProjects'
import { Button, Input, Badge } from '@/components/shared'
import type { WorkspaceContext } from '@/api/types'
import './WorkspaceSettings.css'

interface ProjectWorkspaceSettingsProps {
  projectId: string
}

export default function ProjectWorkspaceSettings({ projectId }: ProjectWorkspaceSettingsProps) {
  const { data: workspace, isLoading } = useProjectWorkspace(projectId)
  const updateWorkspace = useUpdateProjectWorkspace()

  const [editContext, setEditContext] = useState<Partial<WorkspaceContext> | null>(null)

  if (isLoading) return <div className="ws-settings__loading">Loading workspace...</div>
  if (!workspace) return <div className="ws-settings__empty">No workspace configured for this project.</div>

  const ctx = editContext
    ? { ...workspace.context, ...editContext }
    : workspace.context

  const handleSave = () => {
    if (!editContext) return
    updateWorkspace.mutate({
      projectId,
      data: { context: { ...workspace.context, ...editContext } },
    }, {
      onSuccess: () => setEditContext(null),
    })
  }

  const isEditing = editContext !== null

  const updateField = <K extends keyof WorkspaceContext>(key: K, value: WorkspaceContext[K]) => {
    setEditContext((prev) => ({ ...prev, [key]: value }))
  }

  const TagList = ({ items, field, editable }: { items: string[]; field: keyof WorkspaceContext; editable: boolean }) => {
    const [newItem, setNewItem] = useState('')
    return (
      <div className="ws-settings__tags">
        {items.map((item, i) => (
          <span key={i} className="ws-settings__tag">
            {item}
            {editable && (
              <button
                className="ws-settings__tag-remove"
                onClick={() => updateField(field, items.filter((_, j) => j !== i) as never)}
              >
                x
              </button>
            )}
          </span>
        ))}
        {editable && (
          <span className="ws-settings__tag-add">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newItem.trim()) {
                  updateField(field, [...items, newItem.trim()] as never)
                  setNewItem('')
                }
              }}
            />
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="ws-settings">
      <div className="ws-settings__header">
        <div>
          <h3 className="ws-settings__title">Project Workspace Context</h3>
          <p className="ws-settings__subtitle">
            Define project context and defaults. This context is used across all tools including Agent Spark.
          </p>
        </div>
        {!isEditing ? (
          <Button variant="secondary" onClick={() => setEditContext({})}>Edit</Button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={() => setEditContext(null)}>Cancel</Button>
            <Button
              variant="primary"
              icon={<Save size={16} />}
              onClick={handleSave}
              loading={updateWorkspace.isPending}
            >
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Business Objectives */}
      <div className="ws-settings__section">
        <h4><Target size={16} /> Business Objectives</h4>
        <div className="ws-settings__list">
          {ctx.business_objectives.map((obj, i) => (
            <div key={i} className="ws-settings__list-item">
              {isEditing ? (
                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                  <input
                    value={obj}
                    onChange={(e) => {
                      const newObjs = [...ctx.business_objectives]
                      newObjs[i] = e.target.value
                      updateField('business_objectives', newObjs)
                    }}
                    style={{ flex: 1, padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }}
                  />
                  <button
                    className="ws-settings__remove-btn"
                    onClick={() => updateField('business_objectives', ctx.business_objectives.filter((_, j) => j !== i))}
                  >
                    x
                  </button>
                </div>
              ) : (
                <span>{obj}</span>
              )}
            </div>
          ))}
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateField('business_objectives', [...ctx.business_objectives, ''])}
            >
              + Add objective
            </Button>
          )}
        </div>
      </div>

      {/* Target Demographics */}
      <div className="ws-settings__section">
        <h4><Users size={16} /> Target Demographics</h4>
        <TagList items={ctx.target_demographics} field="target_demographics" editable={isEditing} />
      </div>

      {/* Focus Categories */}
      <div className="ws-settings__section">
        <h4><BarChart2 size={16} /> Focus Categories</h4>
        <TagList items={ctx.focus_categories} field="focus_categories" editable={isEditing} />
      </div>

      {/* Brand Names */}
      <div className="ws-settings__section">
        <h4><Building2 size={16} /> Brand Names</h4>
        <TagList items={ctx.brand_names} field="brand_names" editable={isEditing} />
      </div>

      {/* Competitors */}
      <div className="ws-settings__section">
        <h4><Users size={16} /> Competitors</h4>
        <TagList items={ctx.competitors} field="competitors" editable={isEditing} />
      </div>

      {/* Key Metrics */}
      <div className="ws-settings__section">
        <h4><BarChart2 size={16} /> Key Metrics</h4>
        <TagList items={ctx.key_metrics} field="key_metrics" editable={isEditing} />
      </div>

      {/* Notes */}
      <div className="ws-settings__section">
        <h4><FileText size={16} /> Notes</h4>
        {isEditing ? (
          <Input
            type="textarea"
            value={ctx.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={4}
            fullWidth
          />
        ) : (
          <p style={{ color: '#64748b', fontSize: 14 }}>{ctx.notes || 'No notes'}</p>
        )}
      </div>

      {/* Allowed Datasets */}
      <div className="ws-settings__section">
        <h4>Allowed Datasets</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ctx.allowed_datasets.map((d) => <Badge key={d} variant="default">{d}</Badge>)}
        </div>
      </div>
    </div>
  )
}
