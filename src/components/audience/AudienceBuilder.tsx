import { useState, useCallback, useMemo } from 'react'
import {
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Trash2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  Tag,
  Zap,
  Lock,
  Code,
  BarChart3,
  Globe,
  AlertTriangle,
  CheckCircle,
  MinusCircle,
  Check,
  Search,
} from 'lucide-react'
import type {
  AudienceExpression,
  AudienceEstimateResult,
  AudienceHealthScore,
  Question,
  Datapoint,
} from '@/api/types'
import QuestionBrowser from '@/components/taxonomy/QuestionBrowser'
import { Modal, Button } from '@/components/shared'
import './AudienceBuilder.css'

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface Condition {
  id: string
  questionId: string
  questionName: string
  datapointIds: string[]
  datapointNames: string[]
}

type GroupMode = 'any' | 'all' | 'at_least'
type GroupConnector = 'and' | 'or' | 'and_not'

interface ConditionGroup {
  id: string
  operator: 'and' | 'or'
  mode: GroupMode
  atLeastCount: number
  exclude: boolean
  collapsed: boolean
  conditions: Condition[]
  subGroups: ConditionGroup[]
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AudienceBuilderProps {
  expression?: AudienceExpression
  onChange: (expression: AudienceExpression) => void
  onQuestionSearch?: () => void
  estimatedSize?: AudienceEstimateResult
  isEstimating?: boolean
  healthScore?: AudienceHealthScore
  audienceType?: 'dynamic' | 'static'
  onAudienceTypeChange?: (type: 'dynamic' | 'static') => void
  tags?: string[]
  onTagsChange?: (tags: string[]) => void
  marketSizes?: Record<string, { sample_size: number; population_size: number }>
  showExpressionViewer?: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _idCounter = 0
function uid(): string {
  _idCounter += 1
  return `ab_${Date.now()}_${_idCounter}`
}

function createEmptyGroup(): ConditionGroup {
  return {
    id: uid(),
    operator: 'and',
    mode: 'all',
    atLeastCount: 2,
    exclude: false,
    collapsed: false,
    conditions: [],
    subGroups: [],
  }
}

const DEPTH_COLORS = [
  'var(--color-primary, #4f46e5)',
  '#0ea5e9',
  '#8b5cf6',
  '#f59e0b',
  '#10b981',
  '#ef4444',
]

function depthColor(depth: number): string {
  return DEPTH_COLORS[depth % DEPTH_COLORS.length]
}

function connectorLabel(c: GroupConnector): string {
  switch (c) {
    case 'and':
      return 'AND'
    case 'or':
      return 'OR'
    case 'and_not':
      return 'AND NOT'
  }
}

function nextConnector(c: GroupConnector): GroupConnector {
  switch (c) {
    case 'and':
      return 'or'
    case 'or':
      return 'and_not'
    case 'and_not':
      return 'and'
  }
}

function modeToOperator(mode: GroupMode): 'and' | 'or' {
  return mode === 'all' ? 'and' : 'or'
}

// Recursively update a group within the tree by id
function updateGroupInTree(
  groups: ConditionGroup[],
  groupId: string,
  updater: (g: ConditionGroup) => ConditionGroup
): ConditionGroup[] {
  return groups.map((g) => {
    if (g.id === groupId) return updater(g)
    return { ...g, subGroups: updateGroupInTree(g.subGroups, groupId, updater) }
  })
}

// Recursively remove a group from the tree by id
function removeGroupFromTree(
  groups: ConditionGroup[],
  groupId: string
): ConditionGroup[] {
  return groups
    .filter((g) => g.id !== groupId)
    .map((g) => ({
      ...g,
      subGroups: removeGroupFromTree(g.subGroups, groupId),
    }))
}

// Build an AudienceExpression from a single ConditionGroup (recursive)
function buildGroupExpression(group: ConditionGroup): AudienceExpression | null {
  const condExprs: AudienceExpression[] = group.conditions
    .filter((c) => c.questionId)
    .map((c) => ({
      question: {
        question_id: c.questionId,
        datapoint_ids: c.datapointIds,
      },
    }))

  const subExprs: AudienceExpression[] = group.subGroups
    .map(buildGroupExpression)
    .filter((e): e is AudienceExpression => e !== null)

  const allExprs = [...condExprs, ...subExprs]
  if (allExprs.length === 0) return null

  let expr: AudienceExpression

  if (group.mode === 'at_least') {
    expr = {
      at_least: {
        count: group.atLeastCount,
        expressions: allExprs,
      },
    }
  } else if (allExprs.length === 1) {
    expr = allExprs[0]
  } else {
    const op = modeToOperator(group.mode)
    expr = op === 'and' ? { and: allExprs } : { or: allExprs }
  }

  if (group.exclude) {
    expr = { not: expr }
  }

  return expr
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

// -- Size estimation bar ---------------------------------------------------

function SizeEstimationBar({
  estimatedSize,
  isEstimating,
}: {
  estimatedSize?: AudienceEstimateResult
  isEstimating?: boolean
}) {
  const pct = estimatedSize?.percentage_of_universe ?? 0
  const sample = estimatedSize?.sample_size ?? 0

  let barClass = 'ab-estimation__bar-fill'
  if (sample < 100) barClass += ' ab-estimation__bar-fill--red'
  else if (sample < 500) barClass += ' ab-estimation__bar-fill--yellow'
  else barClass += ' ab-estimation__bar-fill--green'

  return (
    <div className="ab-estimation">
      <div className="ab-estimation__header">
        <span className="ab-estimation__label">Estimated Audience Size</span>
        {isEstimating && (
          <span className="ab-estimation__spinner">
            <span className="ab-estimation__spinner-dot" />
            Estimating...
          </span>
        )}
      </div>
      <div className="ab-estimation__bar">
        <div
          className={barClass}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className="ab-estimation__stats">
        <span className="ab-estimation__stat">
          <strong>{sample.toLocaleString()}</strong> sample
        </span>
        <span className="ab-estimation__stat">
          <strong>{(estimatedSize?.population_size ?? 0).toLocaleString()}</strong>{' '}
          population
        </span>
        <span className="ab-estimation__stat">
          <strong>{pct.toFixed(1)}%</strong> of universe
        </span>
      </div>
    </div>
  )
}

// -- Health score badge ----------------------------------------------------

function HealthScoreBadge({ score }: { score?: AudienceHealthScore }) {
  if (!score) return null

  const overall = score.overall
  let className = 'ab-health'
  let Icon = Shield
  if (overall >= 70) {
    className += ' ab-health--good'
    Icon = ShieldCheck
  } else if (overall >= 40) {
    className += ' ab-health--warn'
    Icon = Shield
  } else {
    className += ' ab-health--bad'
    Icon = ShieldAlert
  }

  return (
    <div className={className}>
      <Icon size={16} />
      <span className="ab-health__score">{overall}</span>
      <span className="ab-health__label">Health</span>
      {score.warnings.length > 0 && (
        <span className="ab-health__warnings" title={score.warnings.map((w) => w.message).join('\n')}>
          <AlertTriangle size={12} />
          {score.warnings.length}
        </span>
      )}
    </div>
  )
}

// -- Audience type toggle --------------------------------------------------

function AudienceTypeToggle({
  type,
  onChange,
}: {
  type: 'dynamic' | 'static'
  onChange?: (t: 'dynamic' | 'static') => void
}) {
  return (
    <div className="ab-type-toggle">
      <button
        className={`ab-type-toggle__btn ${type === 'dynamic' ? 'ab-type-toggle__btn--active' : ''}`}
        onClick={() => onChange?.('dynamic')}
        title="Dynamic audience updates automatically with new data waves"
      >
        <Zap size={14} />
        Dynamic
      </button>
      <button
        className={`ab-type-toggle__btn ${type === 'static' ? 'ab-type-toggle__btn--active' : ''}`}
        onClick={() => onChange?.('static')}
        title="Static audience is a fixed snapshot"
      >
        <Lock size={14} />
        Static
      </button>
    </div>
  )
}

// -- Tags input ------------------------------------------------------------

function TagsInput({
  tags,
  onChange,
}: {
  tags: string[]
  onChange?: (tags: string[]) => void
}) {
  const [inputValue, setInputValue] = useState('')

  const addTag = () => {
    const trimmed = inputValue.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange?.([...tags, trimmed])
    }
    setInputValue('')
  }

  const removeTag = (tag: string) => {
    onChange?.(tags.filter((t) => t !== tag))
  }

  return (
    <div className="ab-tags">
      <Tag size={14} className="ab-tags__icon" />
      <div className="ab-tags__chips">
        {tags.map((tag) => (
          <span key={tag} className="ab-tags__chip">
            {tag}
            <button className="ab-tags__chip-remove" onClick={() => removeTag(tag)}>
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          className="ab-tags__input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag()
            }
            if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
              removeTag(tags[tags.length - 1])
            }
          }}
          placeholder={tags.length === 0 ? 'Add tags...' : ''}
        />
      </div>
    </div>
  )
}

// -- Market sizing table ---------------------------------------------------

function MarketSizingTable({
  marketSizes,
}: {
  marketSizes: Record<string, { sample_size: number; population_size: number }>
}) {
  const entries = Object.entries(marketSizes)
  if (entries.length === 0) return null

  return (
    <div className="ab-market-sizes">
      <div className="ab-market-sizes__header">
        <Globe size={14} />
        <span>Per-Market Sizing</span>
      </div>
      <table className="ab-market-sizes__table">
        <thead>
          <tr>
            <th>Market</th>
            <th>Sample</th>
            <th>Population</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([market, sizes]) => {
            let StatusIcon = CheckCircle
            let statusClass = 'ab-market-sizes__status--good'
            if (sizes.sample_size < 100) {
              StatusIcon = MinusCircle
              statusClass = 'ab-market-sizes__status--red'
            } else if (sizes.sample_size < 500) {
              StatusIcon = AlertTriangle
              statusClass = 'ab-market-sizes__status--yellow'
            }
            return (
              <tr key={market}>
                <td>{market}</td>
                <td>{sizes.sample_size.toLocaleString()}</td>
                <td>{sizes.population_size.toLocaleString()}</td>
                <td className={statusClass}>
                  <StatusIcon size={12} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// -- Demographic preview ---------------------------------------------------

function DemographicPreview({
  estimatedSize,
}: {
  estimatedSize?: AudienceEstimateResult
}) {
  const demo = estimatedSize?.demographic_preview
  if (!demo) return null

  const ageEntries = Object.entries(demo.age_groups)
  const genderEntries = Object.entries(demo.gender)
  const ageMax = Math.max(...ageEntries.map(([, v]) => v), 1)
  const genderMax = Math.max(...genderEntries.map(([, v]) => v), 1)

  return (
    <div className="ab-demo-preview">
      <div className="ab-demo-preview__header">
        <BarChart3 size={14} />
        <span>Demographic Preview</span>
      </div>
      <div className="ab-demo-preview__section">
        <span className="ab-demo-preview__section-label">Age</span>
        <div className="ab-demo-preview__bars">
          {ageEntries.map(([label, value]) => (
            <div key={label} className="ab-demo-preview__bar-row">
              <span className="ab-demo-preview__bar-label">{label}</span>
              <div className="ab-demo-preview__bar-track">
                <div
                  className="ab-demo-preview__bar-fill"
                  style={{ width: `${(value / ageMax) * 100}%` }}
                />
              </div>
              <span className="ab-demo-preview__bar-value">{value}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="ab-demo-preview__section">
        <span className="ab-demo-preview__section-label">Gender</span>
        <div className="ab-demo-preview__bars">
          {genderEntries.map(([label, value]) => (
            <div key={label} className="ab-demo-preview__bar-row">
              <span className="ab-demo-preview__bar-label">{label}</span>
              <div className="ab-demo-preview__bar-track">
                <div
                  className="ab-demo-preview__bar-fill ab-demo-preview__bar-fill--gender"
                  style={{ width: `${(value / genderMax) * 100}%` }}
                />
              </div>
              <span className="ab-demo-preview__bar-value">{value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// -- Expression viewer -----------------------------------------------------

function ExpressionViewer({ expression }: { expression: AudienceExpression | null }) {
  return (
    <div className="ab-expression-viewer">
      <div className="ab-expression-viewer__header">
        <Code size={14} />
        <span>Expression JSON</span>
      </div>
      <pre className="ab-expression-viewer__code">
        <code>{expression ? JSON.stringify(expression, null, 2) : '// No expression built yet'}</code>
      </pre>
    </div>
  )
}

// -- Group connector between groups ----------------------------------------

function GroupConnectorButton({
  connector,
  onClick,
}: {
  connector: GroupConnector
  onClick: () => void
}) {
  let cls = 'ab-group-connector'
  if (connector === 'and_not') cls += ' ab-group-connector--not'
  if (connector === 'or') cls += ' ab-group-connector--or'

  return (
    <div className={cls}>
      <button className="ab-group-connector__btn" onClick={onClick}>
        {connectorLabel(connector)}
      </button>
    </div>
  )
}

// -- Recursive group rendering ---------------------------------------------

interface GroupRendererProps {
  group: ConditionGroup
  depth: number
  canRemove: boolean
  onUpdate: (id: string, updater: (g: ConditionGroup) => ConditionGroup) => void
  onRemove: (id: string) => void
  onQuestionSearch?: () => void
  onOpenQuestionPicker: (groupId: string, conditionId?: string) => void
}

function GroupRenderer({
  group,
  depth,
  canRemove,
  onUpdate,
  onRemove,
  onQuestionSearch,
  onOpenQuestionPicker,
}: GroupRendererProps) {
  const borderColor = depthColor(depth)

  const toggleCollapsed = () => {
    onUpdate(group.id, (g) => ({ ...g, collapsed: !g.collapsed }))
  }

  const toggleExclude = () => {
    onUpdate(group.id, (g) => ({ ...g, exclude: !g.exclude }))
  }

  const setMode = (mode: GroupMode) => {
    onUpdate(group.id, (g) => ({
      ...g,
      mode,
      operator: modeToOperator(mode),
    }))
  }

  const setAtLeastCount = (count: number) => {
    onUpdate(group.id, (g) => ({ ...g, atLeastCount: Math.max(1, count) }))
  }

  const addCondition = () => {
    onOpenQuestionPicker(group.id)
  }

  const removeCondition = (conditionId: string) => {
    onUpdate(group.id, (g) => ({
      ...g,
      conditions: g.conditions.filter((c) => c.id !== conditionId),
    }))
  }

  const addSubGroup = () => {
    onUpdate(group.id, (g) => ({
      ...g,
      subGroups: [...g.subGroups, createEmptyGroup()],
    }))
  }

  // Sub-group connectors track per-gap connector type
  const [subGroupConnectors, setSubGroupConnectors] = useState<Record<string, GroupConnector>>({})

  const getSubGroupConnector = (afterGroupId: string): GroupConnector => {
    return subGroupConnectors[afterGroupId] ?? 'and'
  }

  const cycleSubGroupConnector = (afterGroupId: string) => {
    setSubGroupConnectors((prev) => ({
      ...prev,
      [afterGroupId]: nextConnector(prev[afterGroupId] ?? 'and'),
    }))
  }

  const modeLabel =
    group.mode === 'any' ? 'ANY (OR)' : group.mode === 'all' ? 'ALL (AND)' : `AT LEAST ${group.atLeastCount} OF`

  const operatorLabel = group.mode === 'any' ? 'OR' : group.mode === 'all' ? 'AND' : 'OR'

  return (
    <div
      className={`ab-group ${group.exclude ? 'ab-group--exclude' : ''} ${group.collapsed ? 'ab-group--collapsed' : ''}`}
      style={{
        borderLeftColor: borderColor,
        marginLeft: depth > 0 ? 16 : 0,
      }}
    >
      {/* Group header */}
      <div className="ab-group__header">
        <div className="ab-group__header-left">
          <button className="ab-group__collapse-btn" onClick={toggleCollapsed}>
            {group.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </button>

          {/* Mode selector */}
          <div className="ab-group__mode-selector">
            <button
              className={`ab-group__mode-btn ${group.mode === 'all' ? 'ab-group__mode-btn--active' : ''}`}
              onClick={() => setMode('all')}
            >
              All
            </button>
            <button
              className={`ab-group__mode-btn ${group.mode === 'any' ? 'ab-group__mode-btn--active' : ''}`}
              onClick={() => setMode('any')}
            >
              Any
            </button>
            <button
              className={`ab-group__mode-btn ${group.mode === 'at_least' ? 'ab-group__mode-btn--active' : ''}`}
              onClick={() => setMode('at_least')}
            >
              At least
            </button>
            {group.mode === 'at_least' && (
              <input
                type="number"
                className="ab-group__at-least-input"
                value={group.atLeastCount}
                min={1}
                onChange={(e) => setAtLeastCount(parseInt(e.target.value, 10) || 1)}
              />
            )}
          </div>

          {/* Include / Exclude toggle */}
          <button
            className={`ab-group__exclude-toggle ${group.exclude ? 'ab-group__exclude-toggle--active' : ''}`}
            onClick={toggleExclude}
            title={group.exclude ? 'Excluding this group (NOT)' : 'Including this group'}
          >
            {group.exclude ? <EyeOff size={12} /> : <Eye size={12} />}
            {group.exclude ? 'Exclude' : 'Include'}
          </button>
        </div>

        <div className="ab-group__header-right">
          {depth > 0 && (
            <span className="ab-group__depth-badge" style={{ backgroundColor: borderColor }}>
              L{depth}
            </span>
          )}
          {canRemove && (
            <button
              className="ab-group__remove-btn"
              onClick={() => onRemove(group.id)}
              title="Remove group"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Collapsible body */}
      {!group.collapsed && (
        <div className="ab-group__body">
          {/* Conditions */}
          {group.conditions.map((condition, condIndex) => (
            <div key={condition.id} className="ab-group__condition">
              {condIndex > 0 && (
                <span className="ab-group__condition-op">{operatorLabel}</span>
              )}
              <div className="ab-group__condition-content">
                <button
                  className="ab-group__condition-question"
                  onClick={() => onOpenQuestionPicker(group.id, condition.id)}
                >
                  <span>{condition.questionName}</span>
                  <ChevronDown size={14} />
                </button>
                {condition.datapointNames.length > 0 && (
                  <div className="ab-group__condition-values">
                    {condition.datapointNames.map((name) => (
                      <span key={name} className="ab-group__value-tag">
                        {name}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  className="ab-group__condition-remove"
                  onClick={() => removeCondition(condition.id)}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Sub-groups */}
          {group.subGroups.map((subGroup, sgIndex) => (
            <div key={subGroup.id} className="ab-group__subgroup-wrapper">
              {(sgIndex > 0 || group.conditions.length > 0) && (
                <GroupConnectorButton
                  connector={getSubGroupConnector(
                    sgIndex > 0 ? group.subGroups[sgIndex - 1].id : '__conditions'
                  )}
                  onClick={() =>
                    cycleSubGroupConnector(
                      sgIndex > 0 ? group.subGroups[sgIndex - 1].id : '__conditions'
                    )
                  }
                />
              )}
              <GroupRenderer
                group={subGroup}
                depth={depth + 1}
                canRemove={true}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onQuestionSearch={onQuestionSearch}
                onOpenQuestionPicker={onOpenQuestionPicker}
              />
            </div>
          ))}

          {/* Actions row */}
          <div className="ab-group__actions">
            <button className="ab-group__add-btn" onClick={addCondition}>
              <Plus size={14} />
              <span>Add condition</span>
            </button>
            <button className="ab-group__add-btn ab-group__add-btn--sub" onClick={addSubGroup}>
              <Plus size={14} />
              <span>Add sub-group</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AudienceBuilder({
  onChange,
  onQuestionSearch,
  estimatedSize,
  isEstimating,
  healthScore,
  audienceType = 'dynamic',
  onAudienceTypeChange,
  tags = [],
  onTagsChange,
  marketSizes,
  showExpressionViewer: showExpressionViewerProp,
}: AudienceBuilderProps) {
  const [groups, setGroups] = useState<ConditionGroup[]>([createEmptyGroup()])
  const [groupConnectors, setGroupConnectors] = useState<Record<string, GroupConnector>>({})
  const [expressionViewerOpen, setExpressionViewerOpen] = useState(showExpressionViewerProp ?? false)

  // Question picker state
  const [questionPickerOpen, setQuestionPickerOpen] = useState(false)
  const [pickerTargetGroupId, setPickerTargetGroupId] = useState<string | null>(null)
  const [pickerTargetConditionId, setPickerTargetConditionId] = useState<string | null>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [selectedDatapointIds, setSelectedDatapointIds] = useState<Set<string>>(new Set())

  // Retrieve connector for the gap after a given group
  const getConnector = useCallback(
    (afterGroupId: string): GroupConnector => groupConnectors[afterGroupId] ?? 'and',
    [groupConnectors]
  )

  const cycleConnector = useCallback((afterGroupId: string) => {
    setGroupConnectors((prev) => ({
      ...prev,
      [afterGroupId]: nextConnector(prev[afterGroupId] ?? 'and'),
    }))
  }, [])

  // Build and emit expression whenever groups change
  const rebuildExpression = useCallback(
    (currentGroups: ConditionGroup[], connectors: Record<string, GroupConnector>) => {
      const groupExpressions = currentGroups
        .map(buildGroupExpression)
        .filter((e): e is AudienceExpression => e !== null)

      if (groupExpressions.length === 0) return
      if (groupExpressions.length === 1) {
        onChange(groupExpressions[0])
        return
      }

      // Fold groups with their connectors
      let result: AudienceExpression = groupExpressions[0]
      for (let i = 1; i < groupExpressions.length; i++) {
        const prevId = currentGroups[i - 1].id
        const conn = connectors[prevId] ?? 'and'
        const right = groupExpressions[i]

        if (conn === 'and') {
          // Merge into AND
          if ('and' in result) {
            result = { and: [...(result as { and: AudienceExpression[] }).and, right] }
          } else {
            result = { and: [result, right] }
          }
        } else if (conn === 'or') {
          // Merge into OR
          if ('or' in result) {
            result = { or: [...(result as { or: AudienceExpression[] }).or, right] }
          } else {
            result = { or: [result, right] }
          }
        } else {
          // AND NOT
          const notRight: AudienceExpression = { not: right }
          if ('and' in result) {
            result = { and: [...(result as { and: AudienceExpression[] }).and, notRight] }
          } else {
            result = { and: [result, notRight] }
          }
        }
      }

      onChange(result)
    },
    [onChange]
  )

  // Group tree mutation helper
  const updateGroup = useCallback(
    (groupId: string, updater: (g: ConditionGroup) => ConditionGroup) => {
      setGroups((prev) => {
        const next = updateGroupInTree(prev, groupId, updater)
        // Defer expression rebuild
        setTimeout(() => rebuildExpression(next, groupConnectors), 0)
        return next
      })
    },
    [groupConnectors, rebuildExpression]
  )

  const removeGroup = useCallback(
    (groupId: string) => {
      setGroups((prev) => {
        const next = removeGroupFromTree(prev, groupId)
        setTimeout(() => rebuildExpression(next, groupConnectors), 0)
        return next.length === 0 ? [createEmptyGroup()] : next
      })
    },
    [groupConnectors, rebuildExpression]
  )

  const addGroup = useCallback(() => {
    setGroups((prev) => [...prev, createEmptyGroup()])
  }, [])

  // Question picker handlers
  const openQuestionPicker = useCallback((groupId: string, conditionId?: string) => {
    setPickerTargetGroupId(groupId)
    setPickerTargetConditionId(conditionId ?? null)
    setSelectedQuestion(null)
    setSelectedDatapointIds(new Set())
    setQuestionPickerOpen(true)
  }, [])

  const closeQuestionPicker = useCallback(() => {
    setQuestionPickerOpen(false)
    setPickerTargetGroupId(null)
    setPickerTargetConditionId(null)
    setSelectedQuestion(null)
    setSelectedDatapointIds(new Set())
  }, [])

  const handleSelectQuestion = useCallback((question: Question) => {
    setSelectedQuestion(question)
    // Auto-select all datapoints when question is first picked
    setSelectedDatapointIds(new Set(question.datapoints.map((dp) => dp.id)))
  }, [])

  const toggleDatapoint = useCallback((dpId: string) => {
    setSelectedDatapointIds((prev) => {
      const next = new Set(prev)
      if (next.has(dpId)) {
        next.delete(dpId)
      } else {
        next.add(dpId)
      }
      return next
    })
  }, [])

  const handleApplyQuestionSelection = useCallback(() => {
    if (!selectedQuestion || !pickerTargetGroupId || selectedDatapointIds.size === 0) return

    const selectedDps = selectedQuestion.datapoints.filter((dp) =>
      selectedDatapointIds.has(dp.id)
    )

    if (pickerTargetConditionId) {
      // Update existing condition
      updateGroup(pickerTargetGroupId, (g) => ({
        ...g,
        conditions: g.conditions.map((c) =>
          c.id === pickerTargetConditionId
            ? {
                ...c,
                questionId: selectedQuestion.id,
                questionName: selectedQuestion.name,
                datapointIds: selectedDps.map((dp) => dp.id),
                datapointNames: selectedDps.map((dp) => dp.name),
              }
            : c
        ),
      }))
    } else {
      // Add new condition
      updateGroup(pickerTargetGroupId, (g) => ({
        ...g,
        conditions: [
          ...g.conditions,
          {
            id: uid(),
            questionId: selectedQuestion.id,
            questionName: selectedQuestion.name,
            datapointIds: selectedDps.map((dp) => dp.id),
            datapointNames: selectedDps.map((dp) => dp.name),
          },
        ],
      }))
    }

    closeQuestionPicker()
  }, [selectedQuestion, pickerTargetGroupId, pickerTargetConditionId, selectedDatapointIds, updateGroup, closeQuestionPicker])

  // Compute the current expression (for the viewer)
  const currentExpression = useMemo(() => {
    const groupExpressions = groups
      .map(buildGroupExpression)
      .filter((e): e is AudienceExpression => e !== null)
    if (groupExpressions.length === 0) return null
    if (groupExpressions.length === 1) return groupExpressions[0]

    let result: AudienceExpression = groupExpressions[0]
    for (let i = 1; i < groupExpressions.length; i++) {
      const prevId = groups[i - 1].id
      const conn = groupConnectors[prevId] ?? 'and'
      const right = groupExpressions[i]

      if (conn === 'and') {
        if ('and' in result) {
          result = { and: [...(result as { and: AudienceExpression[] }).and, right] }
        } else {
          result = { and: [result, right] }
        }
      } else if (conn === 'or') {
        if ('or' in result) {
          result = { or: [...(result as { or: AudienceExpression[] }).or, right] }
        } else {
          result = { or: [result, right] }
        }
      } else {
        const notRight: AudienceExpression = { not: right }
        if ('and' in result) {
          result = { and: [...(result as { and: AudienceExpression[] }).and, notRight] }
        } else {
          result = { and: [result, notRight] }
        }
      }
    }
    return result
  }, [groups, groupConnectors])

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="audience-builder">
      {/* Top toolbar */}
      <div className="ab-toolbar">
        <div className="ab-toolbar__left">
          <AudienceTypeToggle
            type={audienceType}
            onChange={onAudienceTypeChange}
          />
          <HealthScoreBadge score={healthScore} />
        </div>
        <div className="ab-toolbar__right">
          <button
            className={`ab-toolbar__toggle-btn ${expressionViewerOpen ? 'ab-toolbar__toggle-btn--active' : ''}`}
            onClick={() => setExpressionViewerOpen((v) => !v)}
            title="Toggle expression viewer"
          >
            <Code size={14} />
          </button>
        </div>
      </div>

      {/* Tags */}
      {onTagsChange && <TagsInput tags={tags} onChange={onTagsChange} />}

      {/* Size estimation bar */}
      <SizeEstimationBar estimatedSize={estimatedSize} isEstimating={isEstimating} />

      {/* Market sizing */}
      {marketSizes && Object.keys(marketSizes).length > 0 && (
        <MarketSizingTable marketSizes={marketSizes} />
      )}

      {/* Demographic preview */}
      <DemographicPreview estimatedSize={estimatedSize} />

      {/* Groups */}
      <div className="ab-groups">
        {groups.map((group, groupIndex) => (
          <div key={group.id} className="ab-groups__item">
            {groupIndex > 0 && (
              <GroupConnectorButton
                connector={getConnector(groups[groupIndex - 1].id)}
                onClick={() => cycleConnector(groups[groupIndex - 1].id)}
              />
            )}
            <GroupRenderer
              group={group}
              depth={0}
              canRemove={groups.length > 1}
              onUpdate={updateGroup}
              onRemove={removeGroup}
              onQuestionSearch={onQuestionSearch}
              onOpenQuestionPicker={openQuestionPicker}
            />
          </div>
        ))}
      </div>

      <button className="ab-add-group" onClick={addGroup}>
        <Plus size={16} />
        <span>Add condition group</span>
      </button>

      {/* Expression viewer */}
      {expressionViewerOpen && <ExpressionViewer expression={currentExpression} />}

      {/* Question Picker Modal */}
      <Modal
        open={questionPickerOpen}
        onClose={closeQuestionPicker}
        title={pickerTargetConditionId ? 'Edit Condition' : 'Add Condition'}
        size="lg"
        footer={
          <div className="ab-picker__footer">
            <Button variant="secondary" onClick={closeQuestionPicker}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApplyQuestionSelection}
              disabled={!selectedQuestion || selectedDatapointIds.size === 0}
            >
              {pickerTargetConditionId ? 'Update Condition' : 'Add Condition'}
            </Button>
          </div>
        }
      >
        <div className="ab-picker">
          <div className="ab-picker__left">
            <QuestionBrowser
              onSelectQuestion={handleSelectQuestion}
              selectedQuestionIds={selectedQuestion ? [selectedQuestion.id] : []}
            />
          </div>
          <div className="ab-picker__right">
            {selectedQuestion ? (
              <>
                <div className="ab-picker__question-header">
                  <h4 className="ab-picker__question-name">{selectedQuestion.name}</h4>
                  <span className="ab-picker__question-type">{selectedQuestion.type}</span>
                </div>
                <div className="ab-picker__dp-actions">
                  <button
                    className="ab-picker__select-all-btn"
                    onClick={() =>
                      setSelectedDatapointIds(
                        new Set(selectedQuestion.datapoints.map((dp) => dp.id))
                      )
                    }
                  >
                    Select all
                  </button>
                  <button
                    className="ab-picker__select-all-btn"
                    onClick={() => setSelectedDatapointIds(new Set())}
                  >
                    Clear
                  </button>
                  <span className="ab-picker__dp-count">
                    {selectedDatapointIds.size} of {selectedQuestion.datapoints.length} selected
                  </span>
                </div>
                <div className="ab-picker__dp-list">
                  {selectedQuestion.datapoints.map((dp) => {
                    const checked = selectedDatapointIds.has(dp.id)
                    return (
                      <label
                        key={dp.id}
                        className={`ab-picker__dp-item ${checked ? 'ab-picker__dp-item--checked' : ''}`}
                      >
                        <span
                          className={`ab-picker__dp-checkbox ${checked ? 'ab-picker__dp-checkbox--checked' : ''}`}
                        >
                          {checked && <Check size={12} />}
                        </span>
                        <span className="ab-picker__dp-name">{dp.name}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleDatapoint(dp.id)}
                          className="ab-picker__dp-hidden-input"
                        />
                      </label>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="ab-picker__empty">
                <Search size={32} className="ab-picker__empty-icon" />
                <p>Select a question from the left panel</p>
                <p className="ab-picker__empty-hint">
                  Browse categories or search to find questions, then pick the datapoints to include.
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
