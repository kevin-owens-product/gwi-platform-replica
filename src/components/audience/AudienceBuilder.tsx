import { useState } from 'react'
import { Plus, X, ChevronDown, Trash2 } from 'lucide-react'
import type { AudienceExpression } from '@/api/types'
import './AudienceBuilder.css'

interface Condition {
  id: string
  questionId: string
  questionName: string
  datapointIds: string[]
  datapointNames: string[]
}

interface ConditionGroup {
  id: string
  operator: 'and' | 'or'
  conditions: Condition[]
}

interface AudienceBuilderProps {
  expression?: AudienceExpression
  onChange: (expression: AudienceExpression) => void
  onQuestionSearch?: () => void
}

export default function AudienceBuilder({ onChange, onQuestionSearch }: AudienceBuilderProps) {
  const [groups, setGroups] = useState<ConditionGroup[]>([
    { id: '1', operator: 'and', conditions: [] },
  ])

  const addCondition = (groupId: string) => {
    if (onQuestionSearch) {
      onQuestionSearch()
    }
    // In real implementation, this would open a question picker
    // For now, add a placeholder
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              conditions: [
                ...g.conditions,
                {
                  id: String(Date.now()),
                  questionId: '',
                  questionName: 'Select a question...',
                  datapointIds: [],
                  datapointNames: [],
                },
              ],
            }
          : g
      )
    )
    buildExpression(groups)
  }

  const removeCondition = (groupId: string, conditionId: string) => {
    const updated = groups.map((g) =>
      g.id === groupId
        ? { ...g, conditions: g.conditions.filter((c) => c.id !== conditionId) }
        : g
    )
    setGroups(updated)
    buildExpression(updated)
  }

  const toggleGroupOperator = (groupId: string) => {
    const updated = groups.map((g) =>
      g.id === groupId
        ? { ...g, operator: g.operator === 'and' ? 'or' as const : 'and' as const }
        : g
    )
    setGroups(updated)
    buildExpression(updated)
  }

  const addGroup = () => {
    setGroups((prev) => [
      ...prev,
      { id: String(Date.now()), operator: 'and', conditions: [] },
    ])
  }

  const removeGroup = (groupId: string) => {
    const updated = groups.filter((g) => g.id !== groupId)
    setGroups(updated)
    buildExpression(updated)
  }

  const buildExpression = (currentGroups: ConditionGroup[]) => {
    const groupExpressions = currentGroups
      .filter((g) => g.conditions.length > 0)
      .map((g) => {
        const condExprs: AudienceExpression[] = g.conditions
          .filter((c) => c.questionId)
          .map((c) => ({
            question: {
              question_id: c.questionId,
              datapoint_ids: c.datapointIds,
            },
          }))

        if (condExprs.length === 0) return null
        if (condExprs.length === 1) return condExprs[0]
        return g.operator === 'and'
          ? { and: condExprs }
          : { or: condExprs }
      })
      .filter((e): e is AudienceExpression => e !== null)

    if (groupExpressions.length === 0) return
    if (groupExpressions.length === 1) {
      onChange(groupExpressions[0])
    } else {
      onChange({ and: groupExpressions })
    }
  }

  return (
    <div className="audience-builder">
      {groups.map((group, groupIndex) => (
        <div key={group.id} className="audience-builder__group">
          {groupIndex > 0 && (
            <div className="audience-builder__group-connector">AND</div>
          )}

          <div className="audience-builder__group-header">
            <button
              className="audience-builder__operator-toggle"
              onClick={() => toggleGroupOperator(group.id)}
            >
              {group.operator.toUpperCase()}
              <ChevronDown size={14} />
            </button>
            {groups.length > 1 && (
              <button
                className="audience-builder__group-remove"
                onClick={() => removeGroup(group.id)}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <div className="audience-builder__conditions">
            {group.conditions.map((condition, condIndex) => (
              <div key={condition.id} className="audience-builder__condition">
                {condIndex > 0 && (
                  <span className="audience-builder__condition-op">
                    {group.operator.toUpperCase()}
                  </span>
                )}
                <div className="audience-builder__condition-content">
                  <button className="audience-builder__condition-question">
                    <span>{condition.questionName}</span>
                    <ChevronDown size={14} />
                  </button>
                  {condition.datapointNames.length > 0 && (
                    <div className="audience-builder__condition-values">
                      {condition.datapointNames.map((name) => (
                        <span key={name} className="audience-builder__value-tag">
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    className="audience-builder__condition-remove"
                    onClick={() => removeCondition(group.id, condition.id)}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}

            <button
              className="audience-builder__add-condition"
              onClick={() => addCondition(group.id)}
            >
              <Plus size={16} />
              <span>Add condition</span>
            </button>
          </div>
        </div>
      ))}

      <button className="audience-builder__add-group" onClick={addGroup}>
        <Plus size={16} />
        <span>Add condition group</span>
      </button>
    </div>
  )
}
