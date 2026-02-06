import { useUsageStats } from '@/hooks/useAdmin'
import { formatCompactNumber } from '@/utils/format'
import { BarChart2, Users, Zap, HardDrive } from 'lucide-react'
import './UsageStats.css'

export default function UsageStats() {
  const { data, isLoading } = useUsageStats()

  const stats = [
    {
      label: 'Total Queries',
      value: data?.total_queries ?? 0,
      icon: BarChart2,
      color: '#0ea5e9',
    },
    {
      label: 'Active Users',
      value: data?.active_users ?? 0,
      icon: Users,
      color: '#22c55e',
    },
    {
      label: 'API Calls',
      value: data?.api_calls ?? 0,
      icon: Zap,
      color: '#E31C79',
    },
    {
      label: 'Storage Used',
      value: data?.storage_used_mb ?? 0,
      icon: HardDrive,
      color: '#8b5cf6',
      suffix: 'MB',
    },
  ]

  if (isLoading) {
    return (
      <div className="usage-stats">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="usage-stats__card usage-stats__card--loading">
            <div className="usage-stats__skeleton" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="usage-stats">
      {stats.map((stat) => (
        <div key={stat.label} className="usage-stats__card">
          <div className="usage-stats__icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
            <stat.icon size={20} />
          </div>
          <div className="usage-stats__info">
            <span className="usage-stats__value">
              {formatCompactNumber(stat.value)}
              {stat.suffix && <span className="usage-stats__suffix">{stat.suffix}</span>}
            </span>
            <span className="usage-stats__label">{stat.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
