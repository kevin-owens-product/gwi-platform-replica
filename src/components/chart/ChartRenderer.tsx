import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter,
} from 'recharts'
import { getChartColors } from '@/utils/chart-colors'
import type { ChartType } from '@/api/types'
import './ChartRenderer.css'

interface ChartDataPoint {
  name: string
  [key: string]: string | number
}

interface ChartRendererProps {
  type: ChartType
  data: ChartDataPoint[]
  series: string[]
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  showLabels?: boolean
}

export default function ChartRenderer({
  type,
  data,
  series,
  height = 400,
  showLegend = true,
  showGrid = true,
}: ChartRendererProps) {
  const colors = getChartColors(series.length)

  if (data.length === 0) {
    return (
      <div className="chart-renderer__empty">
        <p>No data to display</p>
      </div>
    )
  }

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis dataKey="name" fontSize={12} tickLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
        />
        {showLegend && <Legend />}
        {series.map((s, i) => (
          <Bar key={s} dataKey={s} fill={colors[i]} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )

  const renderStackedBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis dataKey="name" fontSize={12} tickLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} />
        {showLegend && <Legend />}
        {series.map((s, i) => (
          <Bar key={s} dataKey={s} stackId="stack" fill={colors[i]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis dataKey="name" fontSize={12} tickLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} />
        {showLegend && <Legend />}
        {series.map((s, i) => (
          <Line
            key={s}
            type="monotone"
            dataKey={s}
            stroke={colors[i]}
            strokeWidth={2}
            dot={{ fill: colors[i], r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={height / 3}
          innerRadius={type === 'donut' ? height / 5 : 0}
          dataKey={series[0] || 'value'}
          nameKey="name"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label={(props: any) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={true}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={colors[index]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} />
        {showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  )

  const renderScatterChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis dataKey={series[0]} fontSize={12} name={series[0]} />
        <YAxis dataKey={series[1]} fontSize={12} name={series[1]} />
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} />
        <Scatter data={data} fill={colors[0]} />
      </ScatterChart>
    </ResponsiveContainer>
  )

  switch (type) {
    case 'bar': return renderBarChart()
    case 'stacked_bar': return renderStackedBarChart()
    case 'line': return renderLineChart()
    case 'pie': return renderPieChart()
    case 'donut': return renderPieChart()
    case 'scatter': return renderScatterChart()
    case 'table': return <div className="chart-renderer__table">Table view coming soon</div>
    default: return renderBarChart()
  }
}
