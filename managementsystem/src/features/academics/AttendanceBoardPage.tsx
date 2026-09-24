import { useState } from 'react'
import { ClipboardCheck, Clock3, UserCheck, UserX } from 'lucide-react'
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, Badge, ChipRow, PageHeader, Panel, ProgressBar } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { ChartCard, chartAxisProps, chartGridProps, chartTooltipStyle } from '../../components/ui/ChartCard'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { RoleGate } from '../../components/ui/RoleGate'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import { isoDate, last30Days, TODAY } from '../../mocks/seed'
import type { AttendanceStatus } from '../../mocks/types'
import type { UserRole } from '../../store/authSlice'

const staffRoles: UserRole[] = ['super_admin', 'principal', 'teacher']
const statusTone = { present: 'success', absent: 'danger', late: 'warning', excused: 'info' } as const
const cycleStatus = { present: 'late', late: 'absent', absent: 'excused', excused: 'present' } as const
const recentDays = last30Days.slice(-7)

export function AttendanceBoardPage() {
  const [date, setDate] = useState(isoDate(TODAY))
  const [classId, setClassId] = useState('all')
  const [overrides, setOverrides] = useState<Record<string, AttendanceStatus>>({})
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['attendance', date, classId], () => mockApi.attendanceBoard(date, classId === 'all' ? undefined : classId))

  const header = <PageHeader eyebrow="Academics · attendance" title="Daily attendance" subtitle="Mark and audit attendance with defaulter follow-ups and a 30-day trend." actions={<RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Attendance sheet')}>Export sheet</button></RoleGate>} />

  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={300} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const statusOf = (recordId: string, fallback: AttendanceStatus): AttendanceStatus => overrides[recordId] ?? fallback
  const counts = data.roster.reduce((acc, entry) => { acc[statusOf(entry.record.id, entry.record.status)] += 1; return acc }, { present: 0, absent: 0, late: 0, excused: 0 } as Record<AttendanceStatus, number>)
  const total = data.roster.length
  const rate = total === 0 ? 0 : Math.round(((counts.present + counts.late) / total) * 100)

  const cycleRow = (entry: (typeof data.roster)[number]) => {
    const next = cycleStatus[statusOf(entry.record.id, entry.record.status)]
    setOverrides((prev) => ({ ...prev, [entry.record.id]: next }))
    toast.success({ title: 'Attendance updated', message: `${entry.student.firstName} ${entry.student.lastName} → ${next}` })
  }

  const rosterColumns: Array<DataTableColumn<(typeof data.roster)[number]>> = [
    { key: 'student', header: 'Student', render: (row) => <div className="ec-row"><Avatar name={`${row.student.firstName} ${row.student.lastName}`} /><div className="ec-table__primary"><strong>{row.student.firstName} {row.student.lastName}</strong><span>{row.student.rollNo}</span></div></div>, searchValue: (row) => `${row.student.firstName} ${row.student.lastName} ${row.student.rollNo}` },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={statusTone[statusOf(row.record.id, row.record.status)]} dot>{statusOf(row.record.id, row.record.status)}</Badge>, sortValue: (row) => statusOf(row.record.id, row.record.status) },
    { key: 'method', header: 'Method', render: (row) => <Badge>{row.record.method}</Badge> },
    { key: 'markedBy', header: 'Marked by', render: (row) => nameOf(row.record.markedBy), searchValue: (row) => nameOf(row.record.markedBy) },
  ]

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Present" value={counts.present} icon={UserCheck} tone="success" hint={`${total} on roll today`} />
      <StatCard label="Absent" value={counts.absent} icon={UserX} tone="danger" hint={`${counts.excused} excused`} />
      <StatCard label="Late" value={counts.late} icon={Clock3} tone="warning" hint="Credited as present" />
      <StatCard label="Attendance rate" value={`${rate}%`} icon={ClipboardCheck} delta={rate - 90} deltaLabel="vs 90% target" />
    </div>
    <div className="ec-row" style={{ marginBottom: 'var(--ec-space-3)', flexWrap: 'wrap', gap: 12 }}>
      <ChipRow options={recentDays.map((day) => ({ value: day, label: day.slice(5) }))} value={recentDays.includes(date) ? date : recentDays[0]} onChange={setDate} />
      <select className="ec-select" style={{ width: 'auto' }} aria-label="Pick date" value={date} onChange={(event) => setDate(event.target.value)}>{last30Days.map((day) => <option key={day} value={day}>{day}</option>)}</select>
      <select className="ec-select" style={{ width: 'auto' }} aria-label="Pick class" value={classId} onChange={(event) => setClassId(event.target.value)}><option value="all">All classes</option>{data.classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      <span className="ec-spacer" />
      <Badge tone={rate >= 90 ? 'success' : 'warning'} dot>90% target</Badge>
    </div>
    <div style={{ marginBottom: 'var(--ec-space-4)' }}>
      <DataTable columns={rosterColumns} rows={data.roster} rowKey={(row) => row.record.id} searchPlaceholder="Search students…" emptyTitle="No records for this date" emptyMessage="Attendance has not been captured for the selected day and class." actions={(row) => <RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => cycleRow(row)}>Advance status</button></RoleGate>} />
    </div>
    <div className="ec-grid ec-grid--2">
      <Panel title="Attendance defaulters" hint="Students below the 88% threshold" flush>
        <div className="ec-card__body ec-stack">
          {data.defaulters.length === 0
            ? <p className="ec-small ec-muted">Everyone is above the threshold — great week.</p>
            : data.defaulters.map((entry) => <div key={entry.studentId} className="ec-stack" style={{ gap: 4 }}>
                <div className="ec-row"><strong style={{ fontSize: 13 }}>{entry.name}</strong><span className="ec-spacer" /><Badge tone={entry.rate < 75 ? 'danger' : 'warning'}>{entry.rate}%</Badge></div>
                <ProgressBar value={entry.rate} tone={entry.rate < 75 ? 'danger' : 'warning'} />
                <span className="ec-small ec-muted">{entry.className}</span>
              </div>)}
        </div>
      </Panel>
      <ChartCard title="30-day attendance trend" hint="School-wide credited attendance %" legend={[{ label: 'Attendance %', color: '#2563eb' }]} isLoading={query.isLoading} isError={query.isError} onRetry={() => query.refetch()} isEmpty={data.trend.length === 0}>
        <LineChart data={data.trend}><CartesianGrid {...chartGridProps} /><XAxis dataKey="date" {...chartAxisProps} /><YAxis {...chartAxisProps} domain={[0, 100]} /><Tooltip {...chartTooltipStyle} /><Line type="monotone" dataKey="rate" name="Attendance %" stroke="#2563eb" strokeWidth={2} dot={false} /></LineChart>
      </ChartCard>
    </div>
  </div>
}

