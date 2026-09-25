import { useState } from 'react'
import { Brain, CheckCircle2, Clock3, Target } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, Badge, KeyValue, PageHeader, Panel, ProgressBar } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { ChartCard, ChartTooltip, chartAxisProps, chartColors, chartGridProps } from '../../components/ui/ChartCard'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { Modal } from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import type { Recommendation } from '../../mocks/types'

const typeTone = { remedial: 'danger', enrichment: 'success', resource: 'info', career: 'warning' } as const

export function RecommendationEnginePage() {
  const [focus, setFocus] = useState<Recommendation | null>(null)
  const [decisions, setDecisions] = useState<Record<string, boolean>>({})
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['advanced', 'recommendations'], mockApi.recommendationBoard)
  const header = <PageHeader eyebrow="Advanced · personalisation" title="Recommendation engine" subtitle="AI-suggested remedial, enrichment, resource and career pathways per student. Ships behind the recommendation_engine feature toggle." actions={<button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Recommendation report')}>Export report</button>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={2} height={300} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const rows = data.recommendations.map((recommendation) => ({ ...recommendation, accepted: decisions[recommendation.id] ?? recommendation.accepted }))
  const accepted = rows.filter((row) => row.accepted).length
  const pending = rows.length - accepted
  const averageConfidence = rows.length === 0 ? 0 : Math.round(rows.reduce((sum, row) => sum + row.confidence, 0) / rows.length)
  const types = (['remedial', 'enrichment', 'resource', 'career'] as const).map((type) => ({ type, count: rows.filter((row) => row.type === type).length }))
  const confidenceBands = [{ label: '95–100', min: 95 }, { label: '85–94', min: 85 }, { label: '75–84', min: 75 }, { label: 'Below 75', min: 0 }].map((band, index, list) => ({ band: band.label, count: rows.filter((row) => row.confidence >= band.min && (index === 0 || row.confidence < list[index - 1].min)).length }))
  const columns: Array<DataTableColumn<Recommendation>> = [
    { key: 'student', header: 'Student', render: (row) => <div className="ec-row"><Avatar name={nameOf(row.studentId)} /><div className="ec-table__primary"><strong>{nameOf(row.studentId)}</strong><span>Generated {row.generatedAt}</span></div></div>, searchValue: (row) => nameOf(row.studentId) },
    { key: 'type', header: 'Type', render: (row) => <Badge tone={typeTone[row.type]}>{row.type}</Badge>, searchValue: (row) => row.type },
    { key: 'title', header: 'Recommendation', render: (row) => <div className="ec-table__primary"><strong>{row.title}</strong><span>{row.rationale}</span></div>, searchValue: (row) => `${row.title} ${row.rationale}` },
    { key: 'confidence', header: 'Confidence', align: 'right', render: (row) => <div style={{ minWidth: 130 }}><strong>{row.confidence}%</strong><ProgressBar value={row.confidence} tone={row.confidence >= 90 ? 'success' : row.confidence >= 80 ? 'primary' : 'warning'} /></div>, sortValue: (row) => row.confidence },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={row.accepted ? 'success' : 'warning'} dot>{row.accepted ? 'Accepted' : 'Pending'}</Badge> },
  ]

  const decide = (row: Recommendation, accepted: boolean) => {
    setDecisions((prev) => ({ ...prev, [row.id]: accepted }))
    toast.success({ title: accepted ? 'Recommendation accepted' : 'Recommendation dismissed', message: `${row.title} for ${nameOf(row.studentId)}.` })
  }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Recommendations" value={rows.length} icon={Brain} hint="Generated this cycle" />
      <StatCard label="Accepted" value={accepted} icon={CheckCircle2} tone="success" hint={`${pending} awaiting review`} />
      <StatCard label="Pending" value={pending} icon={Clock3} tone={pending > 0 ? 'warning' : 'success'} hint="Advisor decision" />
      <StatCard label="Average confidence" value={`${averageConfidence}%`} icon={Target} tone={averageConfidence >= 85 ? 'success' : 'warning'} hint="Model certainty" />
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="Recommendations by type" hint="Mix of remedial, enrichment, resource and career guidance" isEmpty={rows.length === 0} legend={[{ label: 'Recommendations', color: chartColors.primary }]}>
        <BarChart data={types}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="type" {...chartAxisProps} />
          <YAxis {...chartAxisProps} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="count" name="Recommendations" radius={[4, 4, 0, 0]}>{types.map((entry) => <Cell key={entry.type} fill={entry.type === 'remedial' ? chartColors.danger : entry.type === 'enrichment' ? chartColors.success : entry.type === 'resource' ? chartColors.teal : chartColors.warning} />)}</Bar>
        </BarChart>
      </ChartCard>
      <ChartCard title="Model confidence" hint="Distribution of recommendation confidence scores" isEmpty={rows.length === 0} legend={[{ label: 'Recommendations', color: chartColors.violet }]}>
        <PieChart>
          <Pie data={confidenceBands} dataKey="count" nameKey="band" innerRadius={55} outerRadius={90}>{confidenceBands.map((entry, index) => <Cell key={entry.band} fill={[chartColors.success, chartColors.primary, chartColors.violet, chartColors.warning][index]} />)}</Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ChartCard>
    </div>
    <Panel title="Pending advisor decisions" hint="Newest AI suggestions awaiting a decision" flush>
      <div className="ec-card__body ec-stack">
        {rows.filter((row) => !row.accepted).length === 0 ? <p className="ec-small ec-muted">Every recommendation has been reviewed.</p> : rows.filter((row) => !row.accepted).slice(0, 4).map((row) => <div key={row.id} className="ec-row">
          <Badge tone={typeTone[row.type]}>{row.type}</Badge>
          <div className="ec-table__primary"><strong>{row.title}</strong><span>{nameOf(row.studentId)} · {row.confidence}% confidence</span></div>
          <span className="ec-spacer" />
          <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => decide(row, true)}>Accept</button>
          <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => decide(row, false)}>Dismiss</button>
        </div>)}
      </div>
    </Panel>
    <div style={{ marginBottom: 'var(--ec-space-4)' }}>
      <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} searchPlaceholder="Search students, recommendations…" filters={[{ key: 'type', label: 'All types', options: types.map((entry) => ({ value: entry.type, label: entry.type })), match: (row, value) => row.type === value }, { key: 'status', label: 'All statuses', options: [{ value: 'accepted', label: 'Accepted' }, { value: 'pending', label: 'Pending' }], match: (row, value) => value === 'accepted' ? row.accepted : !row.accepted }]} actions={(row) => <div className="ec-row" style={{ justifyContent: 'flex-end' }}><button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => decide(row, true)}>Accept</button><button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => setFocus(row)}>Details</button></div>} emptyTitle="No recommendations" emptyMessage="No AI suggestions match the current filters." />
    </div>
    <Modal open={focus !== null} title={focus?.title ?? 'Recommendation'} description="Model rationale and confidence from the mock inference run." onClose={() => setFocus(null)} footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setFocus(null)}>Close</button><button type="button" className="ec-btn" onClick={() => { if (focus) decide(focus, true); setFocus(null) }}>Accept recommendation</button></>}>
      {focus && <div className="ec-stack">
        <KeyValue items={[{ label: 'Student', value: nameOf(focus.studentId) }, { label: 'Type', value: <Badge tone={typeTone[focus.type]}>{focus.type}</Badge> }, { label: 'Confidence', value: `${focus.confidence}%` }, { label: 'Generated', value: focus.generatedAt }, { label: 'Status', value: <Badge tone={focus.accepted ? 'success' : 'warning'} dot>{focus.accepted ? 'Accepted' : 'Pending'}</Badge> }]} />
        <Panel title="Why this was suggested"><p className="ec-small" style={{ margin: 0 }}>{focus.rationale}</p></Panel>
      </div>}
    </Modal>
  </div>
}

