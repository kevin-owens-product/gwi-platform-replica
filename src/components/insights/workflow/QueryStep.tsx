import { useEffect, useMemo, useState } from 'react'
import ChartRenderer from '@/components/chart/ChartRenderer'
import type { MetricType, InsightFilterSet, Question, RunInsightQueryResponse } from '@/api/types'
import type { InsightDraftRecord } from '@/features/insights/draft-store'

interface QueryStepProps {
  draft: InsightDraftRecord
  questions: Question[]
  result: RunInsightQueryResponse | null
  onMetricToggle: (metric: MetricType) => void
  onViewModeChange: (mode: 'chart' | 'crosstab') => void
  onChartTypeChange: (chartType: InsightDraftRecord['view_config']['chart_type']) => void
  onAddFilter: (filter: Omit<InsightFilterSet, 'id' | 'source'>) => void
  onRemoveFilter: (filterId: string) => void
}

const metricOptions: Array<{ label: string; value: MetricType }> = [
  { label: 'Audience %', value: 'audience_percentage' },
  { label: 'Audience Index', value: 'audience_index' },
  { label: 'Audience Size', value: 'audience_size' },
  { label: 'Column %', value: 'column_percentage' },
  { label: 'Row %', value: 'row_percentage' },
]

function chartDataFromResult(
  result: RunInsightQueryResponse | null,
  metric: MetricType,
): Array<{ name: string; value: number }> {
  const firstQuestion = result?.chart?.results?.[0]
  if (!firstQuestion) return []
  return firstQuestion.datapoints.map((datapoint) => ({
    name: datapoint.datapoint_name,
    value: datapoint.metrics[metric] ?? 0,
  }))
}

export default function QueryStep({
  draft,
  questions,
  result,
  onMetricToggle,
  onViewModeChange,
  onChartTypeChange,
  onAddFilter,
  onRemoveFilter,
}: QueryStepProps): React.JSX.Element {
  const activeMetric = draft.query_spec.metrics[draft.query_spec.metrics.length - 1] ?? 'audience_percentage'
  const chartData = chartDataFromResult(result, activeMetric)
  const crosstab = result?.crosstab
  const [selectedQuestionId, setSelectedQuestionId] = useState('')
  const [selectedDatapointIds, setSelectedDatapointIds] = useState<string[]>([])
  const [manualDatapoints, setManualDatapoints] = useState('')
  const [operator, setOperator] = useState<InsightFilterSet['operator']>('include')

  const selectedQuestions = useMemo(() => {
    if (draft.selected_question_ids.length === 0) return []

    const questionMap = new Map(questions.map((question) => [question.id, question]))
    return draft.selected_question_ids.map((questionId) => {
      const question = questionMap.get(questionId)
      if (question) return question

      return {
        id: questionId,
        name: `Question ${questionId}`,
        category_name: 'Not loaded in current catalog',
        datapoints: [],
      } as Question
    })
  }, [draft.selected_question_ids, questions])

  const activeQuestion = useMemo(
    () => selectedQuestions.find((question) => question.id === selectedQuestionId),
    [selectedQuestionId, selectedQuestions],
  )

  useEffect(() => {
    if (selectedQuestions.length === 0) {
      if (selectedQuestionId) setSelectedQuestionId('')
      return
    }

    if (!selectedQuestionId || !selectedQuestions.some((question) => question.id === selectedQuestionId)) {
      setSelectedQuestionId(selectedQuestions[0].id)
    }
  }, [selectedQuestionId, selectedQuestions])

  useEffect(() => {
    if (!activeQuestion) {
      if (selectedDatapointIds.length > 0) setSelectedDatapointIds([])
      return
    }

    if (activeQuestion.datapoints.length === 0) {
      if (selectedDatapointIds.length > 0) setSelectedDatapointIds([])
      return
    }

    const validDatapointIds = new Set(activeQuestion.datapoints.map((datapoint) => datapoint.id))
    const filteredIds = selectedDatapointIds.filter((datapointId) => validDatapointIds.has(datapointId))
    if (filteredIds.length !== selectedDatapointIds.length) {
      setSelectedDatapointIds(filteredIds)
    }
  }, [activeQuestion, selectedDatapointIds])

  const handleToggleDatapoint = (datapointId: string) => {
    setSelectedDatapointIds((current) =>
      current.includes(datapointId)
        ? current.filter((id) => id !== datapointId)
        : [...current, datapointId],
    )
  }

  const handleAddFilter = () => {
    const questionId = selectedQuestionId.trim()
    const manualIds = manualDatapoints
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    const datapointIds = selectedDatapointIds.length > 0 ? selectedDatapointIds : manualIds

    if (!questionId || datapointIds.length === 0) return

    onAddFilter({
      question_id: questionId,
      datapoint_ids: datapointIds,
      operator,
    })

    setSelectedDatapointIds([])
    setManualDatapoints('')
  }

  return (
    <section className="ins-step-pane">
      <header className="ins-step-pane__header">
        <h2>Build the baseline query</h2>
        <p>Select metrics and core filters, then run the baseline.</p>
      </header>

      <div className="ins-field">
        <span>Metrics</span>
        <div className="ins-metrics-grid">
          {metricOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`ins-metric-chip ${draft.query_spec.metrics.includes(option.value) ? 'active' : ''}`}
              onClick={() => onMetricToggle(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ins-filter-editor">
        <strong>Question & datapoint explorer</strong>
        <p className="ins-empty">Pick from your Define-step variables to build filters with context.</p>
        <div className="ins-query-explorer">
          <div className="ins-query-explorer__questions">
            {selectedQuestions.length === 0 && (
              <p className="ins-empty">No variables selected in Define yet. Add at least one variable to use the explorer.</p>
            )}
            {selectedQuestions.map((question) => (
              <button
                key={question.id}
                type="button"
                className={`ins-selectable-list__item ${selectedQuestionId === question.id ? 'active' : ''}`}
                onClick={() => setSelectedQuestionId(question.id)}
              >
                <span>{question.name}</span>
                <small>{question.category_name}</small>
              </button>
            ))}
          </div>

          <div className="ins-query-explorer__datapoints">
            {!activeQuestion && <p className="ins-empty">Select a variable to inspect datapoints.</p>}
            {activeQuestion && activeQuestion.datapoints.length === 0 && (
              <p className="ins-empty">
                Datapoints not loaded for this variable. You can still add manual datapoint IDs below.
              </p>
            )}
            {activeQuestion?.datapoints.map((datapoint) => (
              <button
                key={datapoint.id}
                type="button"
                className={`ins-datapoint-chip ${selectedDatapointIds.includes(datapoint.id) ? 'active' : ''}`}
                onClick={() => handleToggleDatapoint(datapoint.id)}
              >
                <span>{datapoint.name}</span>
                <small>{datapoint.id}</small>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="ins-filter-editor">
        <strong>Core filters</strong>
        <div className="ins-inline-form">
          <select value={selectedQuestionId} onChange={(event) => setSelectedQuestionId(event.target.value)}>
            <option value="">Select question</option>
            {selectedQuestions.map((question) => (
              <option key={question.id} value={question.id}>
                {question.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Datapoint ids (comma fallback)"
            value={manualDatapoints}
            onChange={(event) => setManualDatapoints(event.target.value)}
          />
          <select value={operator} onChange={(event) => setOperator(event.target.value as InsightFilterSet['operator'])}>
            <option value="include">Include</option>
            <option value="exclude">Exclude</option>
          </select>
          <button type="button" onClick={handleAddFilter} disabled={!selectedQuestionId}>
            Add filter
          </button>
        </div>
        {selectedDatapointIds.length > 0 && (
          <p className="ins-empty">
            Selected datapoints: {selectedDatapointIds.length} ({selectedDatapointIds.join(', ')})
          </p>
        )}

        <div className="ins-filter-list">
          {draft.query_spec.filters.length === 0 && <p className="ins-empty">No core filters configured.</p>}
          {draft.query_spec.filters.map((filter) => (
            <div key={filter.id} className="ins-filter-row">
              <span>{filter.operator} {filter.question_id}: {filter.datapoint_ids.join(', ')}</span>
              <button type="button" className="ins-danger" onClick={() => onRemoveFilter(filter.id)}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div className="ins-toolbar">
        <div className="ins-pane__actions">
          <button type="button" className={`ins-mode-btn ${draft.view_config.mode === 'chart' ? 'active' : ''}`} onClick={() => onViewModeChange('chart')}>Chart</button>
          <button type="button" className={`ins-mode-btn ${draft.view_config.mode === 'crosstab' ? 'active' : ''}`} onClick={() => onViewModeChange('crosstab')}>Crosstab</button>
        </div>

        <label>
          Chart type
          <select value={draft.view_config.chart_type} onChange={(event) => onChartTypeChange(event.target.value as InsightDraftRecord['view_config']['chart_type'])}>
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="area">Area</option>
            <option value="pie">Pie</option>
            <option value="donut">Donut</option>
            <option value="table">Table</option>
          </select>
        </label>
      </div>

      <div className="ins-view-canvas">
        {draft.view_config.mode === 'chart' ? (
          chartData.length > 0 ? (
            <ChartRenderer
              type={draft.view_config.chart_type}
              data={chartData}
              series={['value']}
              height={300}
              showLegend
              showGrid
              showLabels
            />
          ) : (
            <p className="ins-empty">Run query to preview chart output.</p>
          )
        ) : (
          <div className="ins-crosstab-wrap">
            {crosstab ? (
              <table className="ins-crosstab-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    {crosstab.columns.slice(0, 8).map((column) => (
                      <th key={column.id}>{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {crosstab.rows.slice(0, 10).map((row, rowIdx) => (
                    <tr key={row.id}>
                      <td>{row.label}</td>
                      {crosstab.columns.slice(0, 8).map((column, colIdx) => (
                        <td key={`${row.id}_${column.id}`}>
                          {crosstab.cells[rowIdx]?.[colIdx]?.values?.[activeMetric]?.toFixed(1) ?? '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="ins-empty">Run query to preview crosstab output.</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
