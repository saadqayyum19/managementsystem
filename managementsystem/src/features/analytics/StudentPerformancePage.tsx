import { useState } from 'react'
import { Award, BarChart3, GraduationCap, Users } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, Badge, KeyValue, PageHeader, Panel, ProgressBar } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { ChartCard, ChartTooltip, chartAxisProps, chartColors, chartGridProps } from '../../components/ui/ChartCard'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { Modal } from '../../components/ui/Modal'
import { RoleGate } from '../../components/ui/RoleGate'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import type { StudentPerformanceRow } from '../../mocks/analytics'
import type { UserRole } from '../../store/authSlice'

const staffRoles: UserRole[] = ['super_admin', 'principal', 'teacher']
const gradeOrder = ['A+', 'A', 'B', 'C', 'D', 'E']
const gradeTone = { 'A+': 'success', A: 'success', B: 'info', C: 'warning', D: 'warning', E: 'danger' } as const

export function StudentPerformancePage() {
  const [focus, setFocus] = useState<StudentPerformanceRow | null>(null)
  const { exportStub } = useExportStub()
  const query = useMockQuery(['analytics', 'performance'], mockApi.performanceAnalytics)
  const header = <PageHeader eyebrow="Analytics · performance" title="Student performance" subtitle="Cohort averages, subject strengths and per-student progress trends." actions={<RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Performance report')}>Export report</button></RoleGate>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={2} height={300} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const { rows, subjects, headline } = data
  const gradeCounts = gradeOrder.map((grade) => ({ grade, count: rows.filter((row) => row.grade === grade).length }))
  const classOptions = Array.from(new Map(rows.map((row) => [row.classId, row.className])).entries()).map(([value, label]) => ({ value, label }))
  const columns: Array<DataTableColumn<StudentPerformanceRow>> = [
    { key: 'student', header: 'Student', render: (row) => <div className="ec-row"><Avatar name={row.name} /><div className="ec-table__primary"><strong>{row.name}</strong><span>{row.rollNo}</span></div></div>, searchValue: (row) => `${row.name} ${row.rollNo}` },
    { key: 'class', header: 'Class', render: (row) => row.className, sortValue: (row) => row.className },
    { key: 'average', header: 'Average', align: 'right', render: (row) => <div style={{ minWidth: 120 }}><strong>{row.average}%</strong><ProgressBar value={row.average} tone={row.average >= 75 ? 'success' : row.average >= 60 ? 'warning' : 'danger'} /></div>, sortValue: (row) => row.average },
    { key: 'attendance', header: 'Attendance', align: 'right', render: (row) => `${row.attendance}%`, sortValue: (row) => row.attendance },
    { key: 'grade', header: 'Grade', render: (row) => <Badge tone={gradeTone[row.grade as keyof typeof gradeTone] ?? 'neutral'}>{row.grade}</Badge>, sortValue: (row) => row.grade },
    { key: 'bestSubject', header: 'Strongest', render: (row) => row.bestSubject, sortValue: (row) => row.bestSubject },
    { key: 'weakSubject', header: 'Needs work', render: (row) => row.weakSubject, sortValue: (row) => row.weakSubject },
  ]

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Students" value={headline.students} icon={Users} hint={`${headline.classes} classes tracked`} />
      <StatCard label="Average performance" value={`${headline.averagePerformance}%`} icon={GraduationCap} tone="success" delta={2.6} deltaLabel="vs last term" />
      <StatCard label="Attendance rate" value={`${headline.attendanceRate}%`} icon={BarChart3} tone={headline.attendanceRate >= 90 ? 'success' : 'warning'} hint="School-wide" />
      <StatCard label="High risk" value={headline.highRisk} icon={Award} tone={headline.highRisk > 0 ? 'danger' : 'success'} hint="Flagged by analytics" />
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="Subject averages" hint="Weighted across every recorded exam" isEmpty={subjects.length === 0} legend={[{ label: 'Average %', color: chartColors.primary }]}>
        <BarChart data={subjects}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="subject" {...chartAxisProps} />
          <YAxis {...chartAxisProps} domain={[0, 100]} />
          <Tooltip content={<ChartTooltip valueSuffix="%" />} />
          <Bar dataKey="average" name="Average %" radius={[4, 4, 0, 0]}>{subjects.map((entry, index) => <Cell key={entry.subjectId} fill={Object.values(chartColors)[index % 8]} />)}</Bar>
        </BarChart>
      </ChartCard>
      <ChartCard title="Grade distribution" hint="Students by computed grade band" isEmpty={rows.length === 0}>
        <PieChart>
          <Pie data={gradeCounts} dataKey="count" nameKey="grade" innerRadius={60} outerRadius={95}>{gradeCounts.map((entry) => <Cell key={entry.grade} fill={entry.grade === 'D' || entry.grade === 'E' ? chartColors.danger : entry.grade === 'C' ? chartColors.warning : entry.grade === 'B' ? chartColors.violet : chartColors.success} />)}</Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ChartCard>
    </div>
    <div style={{ marginBottom: 'var(--ec-space-4)' }}>
      <DataTable columns={columns} rows={rows} rowKey={(row) => row.studentId} searchPlaceholder="Search students…" filters={[{ key: 'class', label: 'All classes', options: classOptions, match: (row, value) => row.classId === value }, { key: 'grade', label: 'All grades', options: gradeOrder.map((grade) => ({ value: grade, label: grade })), match: (row, value) => row.grade === value }]} actions={(row) => <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => setFocus(row)}>View</button>} emptyTitle="No students" emptyMessage="No performance records match the current filters." />
    </div>
    <Panel title="Top performers" hint="Highest cohort averages this term" flush>
      <div className="ec-card__body ec-stack">
        {headline.topPerformers.map((row, index) => <div key={row.studentId} className="ec-row">
          <Badge tone={index === 0 ? 'success' : 'info'}>#{index + 1}</Badge>
          <Avatar name={row.name} />
          <div className="ec-table__primary"><strong>{row.name}</strong><span>{row.className} · {row.rollNo}</span></div>
          <span className="ec-spacer" />
          <strong>{row.average}%</strong>
        </div>)}
      </div>
    </Panel>
    <Modal open={focus !== null} title={focus?.name ?? 'Student'} description="Progress trend, subject spread and fee context." onClose={() => setFocus(null)} size="wide" footer={<button type="button" className="ec-btn" onClick={() => setFocus(null)}>Close</button>}>
      {focus && <div className="ec-stack">
        <KeyValue items={[{ label: 'Class', value: focus.className }, { label: 'Roll number', value: focus.rollNo }, { label: 'Average', value: `${focus.average}%` }, { label: 'Attendance', value: `${focus.attendance}%` }, { label: 'Grade', value: focus.grade }, { label: 'Fee status', value: <Badge tone={focus.feeStatus === 'overdue' ? 'danger' : 'success'}>{focus.feeStatus}</Badge> }]} />
        <ChartCard title="Recent trend" hint="Seeded mock checkpoints" height={220} isEmpty={focus.trend.length === 0} legend={[{ label: 'Score %', color: chartColors.primary }]}>
          <LineChart data={focus.trend}>
            <CartesianGrid {...chartGridProps} />
            <XAxis dataKey="label" {...chartAxisProps} />
            <YAxis {...chartAxisProps} domain={[0, 100]} />
            <Tooltip content={<ChartTooltip valueSuffix="%" />} />
            <Line type="monotone" dataKey="score" name="Score %" stroke={chartColors.primary} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ChartCard>
        <div className="ec-grid ec-grid--2">
          <Panel title="Strongest subject"><strong>{focus.bestSubject}</strong></Panel>
          <Panel title="Needs attention"><strong>{focus.weakSubject}</strong></Panel>
        </div>
      </div>}
    </Modal>
  </div>
}

