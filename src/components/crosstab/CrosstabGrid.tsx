import type { MetricType } from '@/api/types'
import { formatMetricValue } from '@/utils/format'
import { getHeatmapColor, getIndexColor } from '@/utils/chart-colors'
import './CrosstabGrid.css'

interface GridRow {
  id: string
  label: string
}

interface GridColumn {
  id: string
  label: string
}

interface GridCell {
  values: Partial<Record<MetricType, number>>
  significant?: boolean
  sample_size: number
}

interface CrosstabGridProps {
  rows: GridRow[]
  columns: GridColumn[]
  cells: GridCell[][]
  activeMetric: MetricType
  highlightMode?: 'none' | 'heatmap' | 'index'
}

export default function CrosstabGrid({
  rows,
  columns,
  cells,
  activeMetric,
  highlightMode = 'none',
}: CrosstabGridProps) {
  const allValues = cells.flat().map((c) => c.values[activeMetric] ?? 0)
  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)

  const getCellStyle = (value: number): React.CSSProperties => {
    if (highlightMode === 'heatmap') {
      return { backgroundColor: getHeatmapColor(value, minVal, maxVal) }
    }
    if (highlightMode === 'index' && activeMetric === 'audience_index') {
      return { color: getIndexColor(value) }
    }
    return {}
  }

  return (
    <div className="crosstab-grid__wrapper">
      <table className="crosstab-grid">
        <thead>
          <tr>
            <th className="crosstab-grid__corner" />
            {columns.map((col) => (
              <th key={col.id} className="crosstab-grid__col-header">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row.id}>
              <th className="crosstab-grid__row-header">{row.label}</th>
              {columns.map((col, ci) => {
                const cell = cells[ri]?.[ci]
                const value = cell?.values[activeMetric] ?? 0

                return (
                  <td
                    key={col.id}
                    className={`crosstab-grid__cell ${cell?.significant ? 'crosstab-grid__cell--significant' : ''}`}
                    style={getCellStyle(value)}
                    title={`Sample: ${cell?.sample_size ?? 0}`}
                  >
                    {formatMetricValue(activeMetric, value)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
