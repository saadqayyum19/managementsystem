import { useState } from 'react'
import { Award, ClipboardList, Frown, HeartHandshake } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, Badge, PageHeader } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { ChartCard, ChartTooltip, chartAxisProps, chartColors, chartGridProps } from '../../components/ui/ChartCard'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { Modal } from '../../components/ui/Modal'
import { FormGrid, SelectField, TextAreaField, TextField } from '../../components/ui/FormField'
import { useToast } from '../../components/ui/Toast'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import { isoDate, TODAY } from '../../mocks/seed'
import type { BehaviorIncident } from '../../mocks/types'

const categoryTone = { merit: 'success', positive: 'success', punctuality: 'warning', disruption: 'danger', bullying: 'danger' } as const
const followUpTone = { none: 'neutral', counselling: 'info', parent_call: 'warning', detention: 'danger' } as const
const categories: BehaviorIncident['category'][] = ['merit', 'positive', 'punctuality', 'disruption', 'bullying']

export function BehaviorTrackingPage() {
  const [open, setOpen] = useState(false)
  const [extra, setExtra] = useState<BehaviorIncident[]>([])
  const [followUps, setFollowUps] = useState<Record<string, BehaviorIncident['followUp']>>({})
  const [form, setForm] = useState({ studentId: '', category: 'merit', points: '5', notes: '', followUp: 'none' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['advanced', 'behavior'], mockApi.behaviorBoard)
  const header = <PageHeader eyebrow="Advanced · conduct" title="Behavior tracking" subtitle="Positive recognition and conduct incidents with follow-up workflows. Ships behind the behavior_tracking feature toggle." actions={<button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Behavior register')}>Export register</button>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={2} height={300} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const rows = [...extra, ...data.incidents].map((incident) => ({ ...incident, followUp: followUps[incident.id] ?? incident.followUp }))
  const positive = rows.filter((incident) => incident.points > 0).reduce((sum, incident) => sum + incident.points, 0)
  const negative = rows.filter((incident) => incident.points < 0).reduce((sum, incident) => sum + incident.points, 0)
  const followUpCount = rows.filter((incident) => incident.followUp !== 'none').length
  const categoryRows = categories.map((category) => ({ category, count: rows.filter((incident) => incident.category === category).length }))
  const followUpSplit = (['none', 'counselling', 'parent_call', 'detention'] as const).map((followUp) => ({ followUp, count: rows.filter((incident) => incident.followUp === followUp).length }))
  const columns: Array<DataTableColumn<BehaviorIncident>> = [
    { key: 'student', header: 'Student', render: (row) => <div className="ec-row"><Avatar name={nameOf(row.studentId)} /><div className="ec-table__primary"><strong>{nameOf(row.studentId)}</strong><span>{row.occurredAt}</span></div></div>, searchValue: (row) => nameOf(row.studentId) },
    { key: 'category', header: 'Category', render: (row) => <Badge tone={categoryTone[row.category]}>{row.category}</Badge>, searchValue: (row) => row.category },
    { key: 'points', header: 'Points', align: 'right', render: (row) => <strong style={{ color: row.points >= 0 ? '#16a34a' : '#dc2626' }}>{row.points > 0 ? `+${row.points}` : row.points}</strong>, sortValue: (row) => row.points },
    { key: 'notes', header: 'Notes', render: (row) => <span className="ec-small">{row.notes}</span>, searchValue: (row) => row.notes },
    { key: 'recordedBy', header: 'Recorded by', render: (row) => nameOf(row.recordedBy), searchValue: (row) => nameOf(row.recordedBy) },
    { key: 'followUp', header: 'Follow-up', render: (row) => <Badge tone={followUpTone[row.followUp]} dot>{row.followUp.replace('_', ' ')}</Badge> },
  ]
  const save = () => {
    const points = Number(form.points)
    const next = { studentId: form.studentId ? '' : 'Pick a student.', points: Number.isNaN(points) || points === 0 ? 'Points must be a non-zero number.' : '', notes: form.notes.trim() ? '' : 'Notes are required.' }
    setErrors(next); if (Object.values(next).some(Boolean)) return
    setExtra((list) => [{ id: `bhi-x${list.length + 1}`, studentId: form.studentId, recordedBy: 'usr-principal', category: form.category as BehaviorIncident['category'], points, notes: form.notes.trim(), occurredAt: isoDate(TODAY), followUp: form.followUp as BehaviorIncident['followUp'] }, ...list])
    setOpen(false); setForm({ studentId: '', category: 'merit', points: '5', notes: '', followUp: 'none' })
    toast.success({ title: 'Incident recorded', message: 'The conduct register has been updated.' })
  }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Recognition points" value={`+${positive}`} icon={Award} tone="success" hint={`${data.summary.window} window`} />
      <StatCard label="Conduct points" value={negative} icon={Frown} tone="danger" hint="Negative balance" />
      <StatCard label="Follow-ups open" value={followUpCount} icon={HeartHandshake} tone={followUpCount > 0 ? 'warning' : 'success'} hint="Counselling or calls" />
      <StatCard label="Incidents" value={rows.length} icon={ClipboardList} hint="All categories" />
    </div>
    <div className="ec-row" style={{ marginBottom: 'var(--ec-space-3)' }}>
      <span className="ec-small ec-muted">Positive points recognise merit and community contributions; negative points drive follow-ups.</span>
      <span className="ec-spacer" />
      <button type="button" className="ec-btn" onClick={() => setOpen(true)}>Record incident</button>
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="Incidents by category" hint="Conduct and recognition mix" isEmpty={rows.length === 0} legend={[{ label: 'Incidents', color: chartColors.primary }]}>
        <BarChart data={categoryRows}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="category" {...chartAxisProps} />
          <YAxis {...chartAxisProps} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]}>{categoryRows.map((entry) => <Cell key={entry.category} fill={categoryTone[entry.category] === 'success' ? chartColors.success : entry.category === 'punctuality' ? chartColors.warning : chartColors.danger} />)}</Bar>
        </BarChart>
      </ChartCard>
      <ChartCard title="Follow-up actions" hint="Cases by resolution path" isEmpty={rows.length === 0} legend={[{ label: 'Cases', color: chartColors.violet }]}>
        <PieChart>
          <Pie data={followUpSplit} dataKey="count" nameKey="followUp" innerRadius={55} outerRadius={90}>{followUpSplit.map((entry, index) => <Cell key={entry.followUp} fill={[chartColors.slate, chartColors.primary, chartColors.warning, chartColors.danger][index]} />)}</Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ChartCard>
    </div>
    <div style={{ marginBottom: 'var(--ec-space-4)' }}>
      <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} searchPlaceholder="Search students, notes, staff…" filters={[{ key: 'category', label: 'All categories', options: categories.map((category) => ({ value: category, label: category })), match: (row, value) => row.category === value }, { key: 'followUp', label: 'All follow-ups', options: (['none', 'counselling', 'parent_call', 'detention'] as const).map((followUp) => ({ value: followUp, label: followUp.replace('_', ' ') })), match: (row, value) => row.followUp === value }]} actions={(row) => <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" disabled={row.followUp === 'none'} onClick={() => { setFollowUps((prev) => ({ ...prev, [row.id]: 'none' })); toast.success({ title: 'Follow-up closed', message: `${nameOf(row.studentId)} · ${row.category} case resolved.` }) }}>Resolve</button>} emptyTitle="No incidents" emptyMessage="No conduct records match the current filters." />
    </div>
    <Modal open={open} title="Record incident" description="Adds a conduct or recognition entry to the mock register." onClose={() => setOpen(false)} footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="ec-btn" onClick={save}>Save incident</button></>}>
      <FormGrid>
        <SelectField label="Student" name="behavior-student" value={form.studentId} onChange={(studentId) => setForm((prev) => ({ ...prev, studentId }))} options={data.students.map((student) => ({ value: student.id, label: `${student.firstName} ${student.lastName}` }))} error={errors.studentId} required />
        <SelectField label="Category" name="behavior-category" value={form.category} onChange={(category) => setForm((prev) => ({ ...prev, category }))} options={categories.map((category) => ({ value: category, label: category }))} />
        <TextField label="Points" name="behavior-points" type="number" value={form.points} onChange={(points) => setForm((prev) => ({ ...prev, points }))} error={errors.points} hint="Positive recognises, negative records conduct." required />
        <SelectField label="Follow-up" name="behavior-followup" value={form.followUp} onChange={(followUp) => setForm((prev) => ({ ...prev, followUp }))} options={[{ value: 'none', label: 'None' }, { value: 'counselling', label: 'Counselling' }, { value: 'parent_call', label: 'Parent call' }, { value: 'detention', label: 'Detention' }]} />
      </FormGrid>
      <TextAreaField label="Notes" name="behavior-notes" value={form.notes} onChange={(notes) => setForm((prev) => ({ ...prev, notes }))} error={errors.notes} required />
    </Modal>
  </div>
}


