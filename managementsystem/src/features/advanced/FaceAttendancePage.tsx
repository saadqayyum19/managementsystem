import { useState } from 'react'
import { Camera, ScanFace, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, KeyValue, PageHeader, Panel, ProgressBar } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { ChartCard, ChartTooltip, chartAxisProps, chartColors, chartGridProps } from '../../components/ui/ChartCard'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { Modal } from '../../components/ui/Modal'
import { RoleGate } from '../../components/ui/RoleGate'
import { useToast } from '../../components/ui/Toast'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import type { FaceAttendanceSession } from '../../mocks/types'
import type { UserRole } from '../../store/authSlice'

const leadership: UserRole[] = ['super_admin', 'principal']
const statusTone = { completed: 'success', review: 'warning' } as const

export function FaceAttendancePage() {
  const [focus, setFocus] = useState<FaceAttendanceSession | null>(null)
  const [rerunIds, setRerunIds] = useState<string[]>([])
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['advanced', 'face-attendance'], mockApi.faceAttendanceBoard)
  const header = <PageHeader eyebrow="Advanced · biometrics" title="Face recognition attendance" subtitle="Camera capture sessions, recognition confidence and manual review queue. Ships behind the face_attendance feature toggle." actions={<RoleGate roles={leadership}><button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Face attendance log')}>Export log</button></RoleGate>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={2} height={300} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const { sessions, classes } = data
  const classNameOf = (classId: string) => classes.find((item) => item.id === classId)?.name ?? classId
  const recognized = sessions.reduce((sum, session) => sum + session.recognized, 0)
  const unknown = sessions.reduce((sum, session) => sum + session.unknown, 0)
  const averageAccuracy = sessions.length === 0 ? 0 : Math.round((sessions.reduce((sum, session) => sum + session.accuracy, 0) / sessions.length) * 10) / 10
  const reviewQueue = sessions.filter((session) => session.status === 'review')
  const accuracyRows = sessions.map((session) => ({ label: session.label.replace(/—.*/, '').trim(), accuracy: session.accuracy }))
  const composition = sessions.map((session) => ({ label: session.label.replace(/—.*/, '').trim(), recognized: session.recognized, unknown: session.unknown }))
  const columns: Array<DataTableColumn<FaceAttendanceSession>> = [
    { key: 'session', header: 'Capture session', render: (row) => <div className="ec-table__primary"><strong>{row.label}</strong><span>{row.camera} · {row.capturedAt}</span></div>, searchValue: (row) => `${row.label} ${row.camera}` },
    { key: 'class', header: 'Class', render: (row) => classNameOf(row.classId), searchValue: (row) => classNameOf(row.classId) },
    { key: 'matches', header: 'Matches', align: 'right', render: (row) => `${row.recognized} matched · ${row.unknown} unknown`, sortValue: (row) => row.recognized },
    { key: 'accuracy', header: 'Accuracy', align: 'right', render: (row) => <div style={{ minWidth: 130 }}><strong>{row.accuracy}%</strong><ProgressBar value={row.accuracy} tone={row.accuracy >= 95 ? 'success' : row.accuracy >= 90 ? 'warning' : 'danger'} /></div>, sortValue: (row) => row.accuracy },
    { key: 'duration', header: 'Duration', align: 'right', render: (row) => `${row.durationSeconds}s`, sortValue: (row) => row.durationSeconds },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={rerunIds.includes(row.id) ? 'info' : statusTone[row.status]} dot>{rerunIds.includes(row.id) ? 'queued' : row.status}</Badge> },
  ]

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Sessions" value={sessions.length} icon={Camera} hint={`${reviewQueue.length} awaiting review`} />
      <StatCard label="Faces matched" value={recognized} icon={ScanFace} tone="success" hint={`${unknown} unmatched captures`} />
      <StatCard label="Average accuracy" value={`${averageAccuracy}%`} icon={ShieldCheck} tone={averageAccuracy >= 95 ? 'success' : 'warning'} delta={Math.round((averageAccuracy - 95) * 10) / 10} deltaLabel="vs 95% target" />
      <StatCard label="Unknown captures" value={unknown} icon={ShieldAlert} tone={unknown > 0 ? 'danger' : 'success'} hint="Needs manual marking" />
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="Recognition accuracy" hint="Match confidence per capture session" isEmpty={sessions.length === 0} legend={[{ label: 'Accuracy %', color: chartColors.primary }]}>
        <BarChart data={accuracyRows}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="label" {...chartAxisProps} />
          <YAxis {...chartAxisProps} domain={[60, 100]} />
          <Tooltip content={<ChartTooltip valueSuffix="%" />} />
          <ReferenceLine y={95} stroke={chartColors.danger} strokeDasharray="4 4" />
          <Bar dataKey="accuracy" name="Accuracy %" radius={[4, 4, 0, 0]}>{accuracyRows.map((entry, index) => <Cell key={entry.label} fill={index % 2 === 0 ? chartColors.primary : chartColors.teal} />)}</Bar>
        </BarChart>
      </ChartCard>
      <ChartCard title="Matched vs unknown" hint="Captured faces by outcome" isEmpty={sessions.length === 0} legend={[{ label: 'Matched', color: chartColors.success }, { label: 'Unknown', color: chartColors.danger }]}>
        <BarChart data={composition}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="label" {...chartAxisProps} />
          <YAxis {...chartAxisProps} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="recognized" stackId="faces" name="Matched" fill={chartColors.success} />
          <Bar dataKey="unknown" stackId="faces" name="Unknown" fill={chartColors.danger} />
        </BarChart>
      </ChartCard>
    </div>
    <Panel title="Manual review queue" hint="Sessions with unmatched captures or accuracy below target" flush>
      <div className="ec-card__body ec-stack">
        {reviewQueue.length === 0 ? <p className="ec-small ec-muted">No sessions need manual review.</p> : reviewQueue.map((session) => <div key={session.id} className="ec-row">
          <Badge tone={session.accuracy >= 90 ? 'warning' : 'danger'}>{session.accuracy}%</Badge>
          <div className="ec-table__primary"><strong>{session.label}</strong><span>{classNameOf(session.classId)} · {session.camera}</span></div>
          <span className="ec-spacer" />
          <span className="ec-small ec-muted">{session.unknown} unknown</span>
          <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => setFocus(session)}>Review</button>
        </div>)}
      </div>
    </Panel>
    <div style={{ marginBottom: 'var(--ec-space-4)' }}>
      <DataTable columns={columns} rows={sessions} rowKey={(row) => row.id} searchPlaceholder="Search sessions, cameras, classes…" filters={[{ key: 'status', label: 'All statuses', options: [{ value: 'completed', label: 'Completed' }, { value: 'review', label: 'In review' }], match: (row, value) => row.status === value }, { key: 'class', label: 'All classes', options: classes.map((item) => ({ value: item.id, label: item.name })), match: (row, value) => row.classId === value }]} actions={(row) => <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => setFocus(row)}>Inspect</button>} emptyTitle="No sessions" emptyMessage="No capture sessions match the current filters." />
    </div>
    <Modal open={focus !== null} title={focus?.label ?? 'Capture session'} description="Biometric capture details from the mock hardware feed." onClose={() => setFocus(null)} footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setFocus(null)}>Close</button><button type="button" className="ec-btn" onClick={() => { if (focus) { setRerunIds((prev) => prev.includes(focus.id) ? prev : [...prev, focus.id]); toast.info({ title: 'Capture re-queued', message: `${focus.label} will re-run on the next camera cycle.` }) } setFocus(null) }}>Re-run capture</button></>}>
      {focus && <div className="ec-stack">
        <KeyValue items={[{ label: 'Class', value: classNameOf(focus.classId) }, { label: 'Camera', value: focus.camera }, { label: 'Captured', value: focus.capturedAt }, { label: 'Matched', value: focus.recognized }, { label: 'Unknown', value: focus.unknown }, { label: 'Duration', value: `${focus.durationSeconds}s` }]} />
        <Panel title="Recognition confidence"><div className="ec-stack" style={{ gap: 6 }}><strong>{focus.accuracy}%</strong><ProgressBar value={focus.accuracy} tone={focus.accuracy >= 95 ? 'success' : focus.accuracy >= 90 ? 'warning' : 'danger'} /><span className="ec-small ec-muted">Sessions below 95% require a staff member to confirm unmatched faces manually.</span></div></Panel>
      </div>}
    </Modal>
  </div>
}

