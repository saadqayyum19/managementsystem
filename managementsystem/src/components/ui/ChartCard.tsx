import type { ReactNode } from 'react'
import { ResponsiveContainer } from 'recharts'
import { ErrorState } from './ErrorState'
import { EmptyState } from './EmptyState'
import { Skeleton } from './Skeleton'

export const chartColors = { primary: '#2563eb', success: '#16a34a', warning: '#d97706', danger: '#dc2626', violet: '#7c3aed', slate: '#94a3b8', teal: '#0d9488', amber: '#d97706' }

export const chartAxisProps = {
  stroke: '#94a3b8',
  tick: { fontSize: 11, fill: '#94a3b8' },
  tickLine: false,
  axisLine: false,
} as const

export const chartGridProps = { stroke: '#e2e8f0', strokeDasharray: '3 3', vertical: false } as const

export const chartTooltipStyle = {
  contentStyle: { borderRadius: 6, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.10)', fontSize: 12, fontFamily: 'Inter, sans-serif' },
  labelStyle: { color: '#0f172a', fontWeight: 600, fontSize: 12 },
  itemStyle: { color: '#334155', fontSize: 12 },
} as const

type TooltipEntry = { name?: string | number; value?: string | number; color?: string; dataKey?: string | number; payload?: Record<string, unknown> }

/** Interactive tooltip used by every chart so hover styling stays identical. */
export function ChartTooltip({ active, label, payload, valueSuffix = '' }: { active?: boolean; label?: unknown; payload?: TooltipEntry[]; valueSuffix?: string }) {
  if (!active || !payload || payload.length === 0) return null
  return <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, boxShadow: '0 4px 12px rgba(15,23,42,0.10)', padding: '8px 12px', fontFamily: 'Inter, sans-serif' }}>
    {label !== undefined && <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{String(label)}</div>}
    {payload.map((entry, index) => <div key={`${String(entry.dataKey ?? entry.name)}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#334155' }}>
      <i style={{ width: 8, height: 8, borderRadius: 2, background: entry.color ?? chartColors.primary }} />
      <span style={{ color: '#64748b' }}>{String(entry.name ?? entry.dataKey)}</span>
      <strong style={{ marginLeft: 'auto' }}>{typeof entry.value === 'number' ? entry.value.toLocaleString() : String(entry.value ?? '—')}{valueSuffix}</strong>
    </div>)}
  </div>
}

type ChartCardProps = {
  title: string
  hint?: string
  actions?: ReactNode
  legend?: Array<{ label: string; color: string }>
  height?: number
  isLoading?: boolean
  isError?: boolean
  isEmpty?: boolean
  onRetry?: () => void
  emptyMessage?: string
  children: ReactNode
}

export function ChartCard({ title, hint, actions, legend, height = 280, isLoading = false, isError = false, isEmpty = false, onRetry, emptyMessage = 'No data captured for this range yet.', children }: ChartCardProps) {
  return <section className="ec-card">
    <div className="ec-card__head">
      <div><h2 className="ec-card__title">{title}</h2>{hint && <p className="ec-card__hint">{hint}</p>}</div>
      <div className="ec-row">{legend && <div className="ec-chart-legend">{legend.map((item) => <span key={item.label}><i style={{ background: item.color }} />{item.label}</span>)}</div>}{actions}</div>
    </div>
    <div className="ec-chart-body">
      {isLoading ? <Skeleton height={height} radius={6} /> : isError ? <ErrorState title="Chart unavailable" message="The mock analytics source returned an error for this chart." onRetry={onRetry} /> : isEmpty ? <EmptyState title="Nothing to plot" message={emptyMessage} /> : <ResponsiveContainer width="100%" height={height}>{children as never}</ResponsiveContainer>}
    </div>
  </section>
}
