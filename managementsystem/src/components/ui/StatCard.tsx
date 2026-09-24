import { ArrowDownRight, ArrowRight, ArrowUpRight, type LucideIcon } from 'lucide-react'

export type StatTone = 'info' | 'success' | 'warning' | 'danger'

type StatCardProps = {
  label: string
  value: string | number
  icon?: LucideIcon
  tone?: StatTone
  delta?: number
  deltaLabel?: string
  hint?: string
}

export function StatCard({ label, value, icon: Icon, tone = 'info', delta, deltaLabel, hint }: StatCardProps) {
  const direction = delta === undefined || delta === 0 ? 'flat' : delta > 0 ? 'up' : 'down'
  const TrendIcon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : ArrowRight
  return <article className="ec-stat">
    <div className="ec-stat__top">
      <span className="ec-stat__label">{label}</span>
      {Icon && <span className={`ec-stat__icon ec-stat__icon--${tone}`}><Icon size={16} /></span>}
    </div>
    <strong className="ec-stat__value">{value}</strong>
    {(delta !== undefined || hint) && <div className="ec-row">
      {delta !== undefined && <span className={`ec-stat__trend ec-stat__trend--${direction}`}><TrendIcon size={13} />{delta > 0 ? '+' : ''}{delta}%</span>}
      <span className="ec-small ec-muted">{deltaLabel ?? hint}</span>
    </div>}
  </article>
}
