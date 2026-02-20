import { Loader2, Play } from 'lucide-react'
import ChartRenderer from '@/components/chart/ChartRenderer'
import type { ChartType, RunInsightQueryResponse } from '@/api/types'

interface InsightsViewPaneProps {
  viewMode: 'chart' | 'crosstab'
  onViewModeChange: (mode: 'chart' | 'crosstab') => void
  chartType: ChartType
  onChartTypeChange: (type: ChartType) => void
  result: RunInsightQueryResponse | null
  isRunning: boolean
  onRunQuery: () => void
}

function chartDataFromResult(result: RunInsightQueryResponse | null): Array<{ name: string; value: number }> {
  const firstQuestion = result?.chart?.results?.[0]
  if (!firstQuestion) return []
  return firstQuestion.datapoints.map((datapoint) => ({
    name: datapoint.datapoint_name,
    value: datapoint.metrics.audience_percentage ?? 0,
  }))
}

export default function InsightsViewPane({
  viewMode,
  onViewModeChange,
  chartType,
  onChartTypeChange,
  result,
  isRunning,
  onRunQuery,
}: InsightsViewPaneProps): React.JSX.Element {
  const chartData = chartDataFromResult(result)
  const crosstab = result?.crosstab

  return (
    <section className="ins-pane">
      <header className="ins-pane__header">
        <h2>View</h2>
        <div className="ins-pane__actions">
          <button type="button" className={`ins-mode-btn ${viewMode === 'chart' ? 'active' : ''}`} onClick={() => onViewModeChange('chart')}>Chart</button>
          <button type="button" className={`ins-mode-btn ${viewMode === 'crosstab' ? 'active' : ''}`} onClick={() => onViewModeChange('crosstab')}>Crosstab</button>
        </div>
      </header>

      <div className="ins-toolbar">
        <label>
          Chart type
          <select value={chartType} onChange={(event) => onChartTypeChange(event.target.value as ChartType)}>
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="area">Area</option>
            <option value="pie">Pie</option>
            <option value="donut">Donut</option>
            <option value="table">Table</option>
          </select>
        </label>

        <button type="button" className="ins-run-btn" onClick={onRunQuery} disabled={isRunning}>
          {isRunning ? <Loader2 size={14} className="spin" /> : <Play size={14} />}
          <span>{isRunning ? 'Running...' : 'Run Query'}</span>
        </button>
      </div>

      <div className="ins-view-canvas">
        {viewMode === 'chart' ? (
          chartData.length > 0 ? (
            <ChartRenderer
              type={chartType}
              data={chartData}
              series={['value']}
              height={280}
              showLegend
              showGrid
              showLabels
            />
          ) : (
            <p className="ins-empty">Run a query to render chart output.</p>
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
                          {crosstab.cells[rowIdx]?.[colIdx]?.values?.audience_percentage?.toFixed(1) ?? '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="ins-empty">Run a query to render crosstab output.</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
