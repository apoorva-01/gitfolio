import './stat-card.css'

interface StatCardProps {
  value: string | number
  label: string
  change?: string
  trend?: 'up' | 'neutral'
}

export function StatCard({ value, label, change, trend = 'neutral' }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change && <div className={`stat-change ${trend}`}>{change}</div>}
    </div>
  )
}