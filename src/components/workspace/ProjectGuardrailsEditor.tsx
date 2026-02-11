import { useState, useEffect } from 'react'
import {
  Save, Shield, FileText, Palette, Download, AlertTriangle,
  CheckCircle2, Clock, Bot,
} from 'lucide-react'
import { useProjectWorkspace, useUpdateProjectWorkspace } from '@/hooks/useProjects'
import { Button, Badge, DataTable } from '@/components/shared'
import type { Column } from '@/components/shared'
import type { WorkspaceGuardrails, GuardrailViolation } from '@/api/types'
import { formatDate } from '@/utils/format'
import './GuardrailsEditor.css'

interface ProjectGuardrailsEditorProps {
  projectId: string
}

export default function ProjectGuardrailsEditor({ projectId }: ProjectGuardrailsEditorProps) {
  const { data: workspace, isLoading } = useProjectWorkspace(projectId)
  const updateWorkspace = useUpdateProjectWorkspace()
  const violations: GuardrailViolation[] = []

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Partial<WorkspaceGuardrails>>({})

  useEffect(() => {
    if (workspace) {
      setDraft(workspace.guardrails)
    }
  }, [workspace])

  if (isLoading) return <div className="guardrails__loading">Loading guardrails...</div>
  if (!workspace) return <div className="guardrails__empty">No workspace configured.</div>

  const g = editing ? { ...workspace.guardrails, ...draft } : workspace.guardrails

  const handleSave = () => {
    updateWorkspace.mutate({
      projectId,
      data: { guardrails: { ...workspace.guardrails, ...draft } },
    }, {
      onSuccess: () => setEditing(false),
    })
  }

  const violationColumns: Column<GuardrailViolation>[] = [
    {
      key: 'severity',
      header: 'Severity',
      width: '100px',
      render: (v) => (
        <Badge variant={v.severity === 'error' ? 'danger' : v.severity === 'warning' ? 'warning' : 'info'}>
          {v.severity}
        </Badge>
      ),
    },
    { key: 'rule', header: 'Rule', sortable: true },
    { key: 'message', header: 'Message' },
    {
      key: 'entity_type',
      header: 'Entity',
      render: (v) => <span>{v.entity_type}</span>,
    },
    {
      key: 'resolved',
      header: 'Status',
      width: '90px',
      render: (v) => v.resolved
        ? <Badge variant="success">Resolved</Badge>
        : <Badge variant="warning">Open</Badge>,
    },
    {
      key: 'timestamp',
      header: 'When',
      render: (v) => formatDate(v.timestamp),
    },
  ]

  return (
    <div className="guardrails">
      <div className="guardrails__header">
        <div>
          <h3 className="guardrails__title">
            <Shield size={18} />
            Project Guardrails
          </h3>
          <p className="guardrails__subtitle">
            Set rules and restrictions that keep project output consistent and compliant.
          </p>
        </div>
        {!editing ? (
          <Button variant="secondary" onClick={() => setEditing(true)}>Edit</Button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={() => { setEditing(false); setDraft(workspace.guardrails) }}>Cancel</Button>
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

      {/* Content Standards */}
      <div className="guardrails__section">
        <h4><FileText size={16} /> Content Standards</h4>
        <div className="guardrails__field">
          <label>Required Tags</label>
          <div className="guardrails__tags">
            {g.required_tags.map((tag, i) => (
              <span key={i} className="guardrails__tag">{tag}</span>
            ))}
            {editing && (
              <input
                className="guardrails__tag-input"
                placeholder="Add tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                    setDraft({ ...draft, required_tags: [...g.required_tags, (e.target as HTMLInputElement).value.trim()] });
                    (e.target as HTMLInputElement).value = ''
                  }
                }}
              />
            )}
          </div>
        </div>
        <div className="guardrails__field">
          <label>Naming Convention {g.naming_convention && <code>{g.naming_convention}</code>}</label>
          {editing && (
            <input
              value={draft.naming_convention ?? g.naming_convention ?? ''}
              onChange={(e) => setDraft({ ...draft, naming_convention: e.target.value })}
              placeholder="Regex pattern, e.g. ^[A-Z].+"
              className="guardrails__input"
            />
          )}
        </div>
      </div>

      {/* Brand Colors */}
      <div className="guardrails__section">
        <h4><Palette size={16} /> Brand Colors</h4>
        <div className="guardrails__colors">
          {g.brand_colors.map((color, i) => (
            <div key={i} className="guardrails__color-item">
              <span className="guardrails__color-swatch" style={{ backgroundColor: color }} />
              <span className="guardrails__color-code">{color}</span>
              {editing && (
                <button
                  className="guardrails__color-remove"
                  onClick={() => setDraft({ ...draft, brand_colors: g.brand_colors.filter((_, j) => j !== i) })}
                >
                  x
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Usage Limits */}
      <div className="guardrails__section">
        <h4><Download size={16} /> Usage &amp; Export Limits</h4>
        <div className="guardrails__limits-grid">
          <div className="guardrails__field">
            <label>Monthly Query Limit</label>
            {editing ? (
              <input
                type="number"
                value={draft.monthly_query_limit ?? g.monthly_query_limit ?? ''}
                onChange={(e) => setDraft({ ...draft, monthly_query_limit: parseInt(e.target.value) || undefined })}
                className="guardrails__input guardrails__input--narrow"
              />
            ) : (
              <span className="guardrails__value">{g.monthly_query_limit?.toLocaleString() ?? 'Unlimited'}</span>
            )}
          </div>
          <div className="guardrails__field">
            <label>Monthly Export Limit</label>
            {editing ? (
              <input
                type="number"
                value={draft.monthly_export_limit ?? g.monthly_export_limit ?? ''}
                onChange={(e) => setDraft({ ...draft, monthly_export_limit: parseInt(e.target.value) || undefined })}
                className="guardrails__input guardrails__input--narrow"
              />
            ) : (
              <span className="guardrails__value">{g.monthly_export_limit?.toLocaleString() ?? 'Unlimited'}</span>
            )}
          </div>
          <div className="guardrails__field">
            <label>Max Export Rows</label>
            {editing ? (
              <input
                type="number"
                value={draft.max_export_rows ?? g.max_export_rows}
                onChange={(e) => setDraft({ ...draft, max_export_rows: parseInt(e.target.value) || 10000 })}
                className="guardrails__input guardrails__input--narrow"
              />
            ) : (
              <span className="guardrails__value">{g.max_export_rows?.toLocaleString() ?? 'Unlimited'}</span>
            )}
          </div>
          <div className="guardrails__field">
            <label>Allowed Export Formats</label>
            <div className="guardrails__tags">
              {g.allowed_export_formats.map((fmt, i) => (
                <span key={i} className="guardrails__tag">{fmt}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review Requirements */}
      <div className="guardrails__section">
        <h4><AlertTriangle size={16} /> Review Requirements</h4>
        <div className="guardrails__review-grid">
          <div className="guardrails__review-item">
            <span>Require Review Before Sharing</span>
            {editing ? (
              <button
                className="guardrails__toggle"
                onClick={() => setDraft({ ...draft, require_review_before_share: !g.require_review_before_share })}
              >
                {g.require_review_before_share ? 'Yes' : 'No'}
              </button>
            ) : (
              <Badge variant={g.require_review_before_share ? 'warning' : 'success'}>
                {g.require_review_before_share ? 'Yes' : 'No'}
              </Badge>
            )}
          </div>
          <div className="guardrails__review-item">
            <span>Require Review Before Export</span>
            {editing ? (
              <button
                className="guardrails__toggle"
                onClick={() => setDraft({ ...draft, require_review_before_export: !g.require_review_before_export })}
              >
                {g.require_review_before_export ? 'Yes' : 'No'}
              </button>
            ) : (
              <Badge variant={g.require_review_before_export ? 'warning' : 'success'}>
                {g.require_review_before_export ? 'Yes' : 'No'}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Spark AI Guardrails */}
      <div className="guardrails__section">
        <h4><Bot size={16} /> Spark AI Guardrails</h4>
        <div className="guardrails__field">
          <label>System Prompt Additions</label>
          {editing ? (
            <textarea
              value={draft.spark_system_prompt_additions ?? g.spark_system_prompt_additions ?? ''}
              onChange={(e) => setDraft({ ...draft, spark_system_prompt_additions: e.target.value })}
              className="guardrails__textarea"
              rows={3}
            />
          ) : (
            <p className="guardrails__value">{g.spark_system_prompt_additions || 'None'}</p>
          )}
        </div>
      </div>

      {/* Violations */}
      <div className="guardrails__section">
        <h4><Clock size={16} /> Recent Violations</h4>
        {violations.length === 0 ? (
          <div className="guardrails__empty">
            <CheckCircle2 size={16} />
            No violations found.
          </div>
        ) : (
          <DataTable
            data={violations}
            columns={violationColumns}
            keyField="id"
            emptyMessage="No violations found"
          />
        )}
      </div>
    </div>
  )
}
