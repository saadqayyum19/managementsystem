import { Award, Gauge, TrendingUp, Users } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, Badge, PageHeader, Panel, ProgressBar } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { ChartCard, ChartTooltip, chartAxisProps, chartColors, chartGridProps, chartTooltipStyle } from '../../components/ui/ChartCard'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { RoleGate } from '../../components/ui/RoleGate'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import type { UserRole } from '../../store/authSlice'

const leadership: UserRole[] = ['super_admin', 'principal']
type Row = { teacherId: string; name: string; department: string; classes: number; students: number; weeklyPeriods: number; averagePerformance: number; averageAttendance: number; workloadScore: number; effectiveness: number }
const round1 = (value: number) => Math.round(value * 10) / 10

export function TeacherEffectivenessPage() {
  const { exportStub } = useExportStub()
  const query = useMockQuery(['analytics', 'teachers'], mockApi.teacherAnalytics)
  const header = <PageHeader eyebrow="Analytics · faculty" title="Teacher effectiveness" subtitle="Classroom outcomes, attendance pull-through and workload balance across faculty." actions={<RoleGate roles={leadership}><button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Faculty effectiveness')}>Export review</button></RoleGate>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={2} height={300} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const rows: Row[] = data.rows
  const ranked = [...rows].sort((left, right) => right.effectiveness - left.effectiveness)
  const averageEffectiveness = rows.length === 0 ? 0 : round1(rows.reduce((sum, row) => sum + row.effectiveness, 0) / rows.length)
  const averageAttendance = rows.length === 0 ? 0 : round1(rows.reduce((sum, row) => sum + row.averageAttendance, 0) / rows.length)
  const busiest = ranked.reduce<Row | null>((best, row) => (best === null || row.weeklyPeriods > best.weeklyPeriods ? row : best), null)
  const departmentNames = Array.from(new Set(rows.map((row) => row.department)))
  const departments = departmentNames.map((department) => {
    const members = rows.filter((row) => row.department === department)
    return { department, effectiveness: round1(members.reduce((sum, row) => sum + row.effectiveness, 0) / members.length), attendance: round1(members.reduce((sum, row) => sum + row.averageAttendance, 0) / members.length) }
  }).sort((left, right) => right.effectiveness - left.effectiveness)
  const workloadLeaders = [...rows].sort((left, right) => right.weeklyPeriods - left.weeklyPeriods).slice(0, 5)
  const columns: Array<DataTableColumn<Row>> = [
    { key: 'teacher', header: 'Teacher', render: (row) => <div className="ec-row"><Avatar name={row.name} /><div className="ec-table__primary"><strong>{row.name}</strong><span>{row.department}</span></div></div>, searchValue: (row) => `${row.name} ${row.department}` },
    { key: 'reach', header: 'Reach', render: (row) => <span className="ec-small">{row.classes} classes · {row.students} students</span>, sortValue: (row) => row.students },
    { key: 'workload', header: 'Workload', align: 'right', render: (row) => <div style={{ minWidth: 120 }}><strong>{row.weeklyPeriods} periods</strong><ProgressBar value={row.workloadScore} tone={row.workloadScore > 90 ? 'danger' : row.workloadScore > 75 ? 'warning' : 'success'} /></div>, sortValue: (row) => row.weeklyPeriods },
    { key: 'performance', header: 'Class average', align: 'right', render: (row) => `${row.averagePerformance}%`, sortValue: (row) => row.averagePerformance },
    { key: 'attendance', header: 'Attendance', align: 'right', render: (row) => `${row.averageAttendance}%`, sortValue: (row) => row.averageAttendance },
    { key: 'effectiveness', header: 'Effectiveness', align: 'right', render: (row) => <Badge tone={row.effectiveness >= 80 ? 'success' : row.effectiveness >= 65 ? 'info' : 'warning'} dot>{row.effectiveness}%</Badge>, sortValue: (row) => row.effectiveness },
  ]

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Faculty tracked" value={rows.length} icon={Users} hint={`${departments.length} departments`} />
      <StatCard label="Average effectiveness" value={`${averageEffectiveness}%`} icon={Gauge} tone={averageEffectiveness >= 75 ? 'success' : 'warning'} delta={1.8} deltaLabel="vs last review" />
      <StatCard label="Class attendance pull" value={`${averageAttendance}%`} icon={TrendingUp} tone={averageAttendance >= 90 ? 'success' : 'warning'} hint="Across assigned classes" />
      <StatCard label="Highest load" value={busiest ? `${busiest.weeklyPeriods} periods` : '—'} icon={Award} tone="info" hint={busiest?.name ?? 'No faculty data'} />
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="Effectiveness ranking" hint="Class outcomes weighted with performance reviews" isEmpty={ranked.length === 0} legend={[{ label: 'Effectiveness %', color: chartColors.primary }]}>
        <BarChart data={ranked} layout="vertical" margin={{ left: 12, right: 12 }}>
          <CartesianGrid {...chartGridProps} />
          <XAxis type="number" domain={[0, 100]} {...chartAxisProps} />
          <YAxis type="category" dataKey="name" width={140} {...chartAxisProps} />
          <Tooltip content={<ChartTooltip valueSuffix="%" />} />
          <Bar dataKey="effectiveness" name="Effectiveness %" radius={[0, 4, 4, 0]}>{ranked.map((entry, index) => <Cell key={entry.teacherId} fill={index === 0 ? chartColors.success : index < 3 ? chartColors.primary : chartColors.slate} />)}</Bar>
        </BarChart>
      </ChartCard>
      <ChartCard title="Outcomes vs attendance" hint="Each point is one teacher" isEmpty={rows.length === 0} legend={[{ label: 'Teacher', color: chartColors.violet }]}>
        <ScatterChart margin={{ left: 4, right: 12, top: 8 }}>
          <CartesianGrid {...chartGridProps} />
          <XAxis type="number" dataKey="averagePerformance" name="Performance %" domain={[40, 100]} {...chartAxisProps} />
          <YAxis type="number" dataKey="averageAttendance" name="Attendance %" domain={[60, 100]} {...chartAxisProps} />
          <Tooltip {...chartTooltipStyle} />
          <Scatter name="Teacher" data={rows} fill={chartColors.violet} />
        </ScatterChart>
      </ChartCard>
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="Department averages" hint="Effectiveness against attendance pull-through" isEmpty={departments.length === 0} legend={[{ label: 'Effectiveness %', color: chartColors.primary }, { label: 'Attendance %', color: chartColors.teal }]}>
        <BarChart data={departments}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="department" {...chartAxisProps} />
          <YAxis {...chartAxisProps} domain={[0, 100]} />
          <Tooltip content={<ChartTooltip valueSuffix="%" />} />
          <Bar dataKey="effectiveness" name="Effectiveness %" radius={[4, 4, 0, 0]} fill={chartColors.primary} />
          <Bar dataKey="attendance" name="Attendance %" radius={[4, 4, 0, 0]} fill={chartColors.teal} />
        </BarChart>
      </ChartCard>
      <Panel title="Workload leaders" hint="Weekly periods against the 30-period planning cap">
        <div className="ec-stack">
          {workloadLeaders.map((row) => <div key={row.teacherId} className="ec-stack" style={{ gap: 4 }}>
            <div className="ec-row"><strong style={{ fontSize: 13 }}>{row.name}</strong><span className="ec-spacer" /><Badge tone={row.weeklyPeriods > 27 ? 'danger' : row.weeklyPeriods > 22 ? 'warning' : 'success'}>{row.weeklyPeriods} periods</Badge></div>
            <ProgressBar value={row.weeklyPeriods} max={30} tone={row.weeklyPeriods > 27 ? 'danger' : row.weeklyPeriods > 22 ? 'warning' : 'success'} />
            <span className="ec-small ec-muted">{row.department} · {row.students} students</span>
          </div>)}
        </div>
      </Panel>
    </div>
    <div>
      <DataTable columns={columns} rows={rows} rowKey={(row) => row.teacherId} searchPlaceholder="Search teachers, departments…" filters={[{ key: 'department', label: 'All departments', options: departmentNames.map((department) => ({ value: department, label: department })), match: (row, value) => row.department === value }, { key: 'band', label: 'All bands', options: [{ value: 'strong', label: '80% and above' }, { value: 'steady', label: '65 – 79%' }, { value: 'support', label: 'Below 65%' }], match: (row, value) => value === 'strong' ? row.effectiveness >= 80 : value === 'steady' ? row.effectiveness >= 65 && row.effectiveness < 80 : row.effectiveness < 65 }]} emptyTitle="No faculty" emptyMessage="No effectiveness records match the current filters." />
    </div>
  </div>
}

