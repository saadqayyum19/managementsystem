import { useState } from 'react'
import { CalendarCheck, CalendarX, Clock3, Percent } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, ChipRow, PageHeader, Panel, ProgressBar } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { ChartCard, ChartTooltip, chartAxisProps, chartColors, chartGridProps } from '../../components/ui/ChartCard'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { RoleGate } from '../../components/ui/RoleGate'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import type { UserRole } from '../../store/authSlice'

const staffRoles: UserRole[] = ['super_admin', 'principal', 'teacher']
type ClassRow = { classId: string; className: string; students: number; average: number; belowThreshold: number }

export function AttendanceAnalyticsPage() {
  const [range, setRange] = useState<'7' | '14' | '30'>('30')
  const { exportStub } = useExportStub()
  const query = useMockQuery(['analytics', 'attendance'], mockApi.attendanceAnalytics)
  const header = <PageHeader eyebrow="Analytics · attendance" title="Attendance analytics" subtitle="School-wide credited attendance, daily composition and class-level watchlists." actions={<RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Attendance analytics')}>Export analysis</button></RoleGate>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={2} height={300} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const trend = data.trend.slice(-Number(range))
  const totals = trend.reduce((acc, row) => ({ present: acc.present + row.present, absent: acc.absent + row.absent, late: acc.late + row.late }), { present: 0, absent: 0, late: 0 })
  const averageRate = trend.length === 0 ? 0 : Math.round((trend.reduce((sum, row) => sum + row.rate, 0) / trend.length) * 10) / 10
  const belowThreshold = data.classes.reduce((sum, row) => sum + row.belowThreshold, 0)
  const watchlist = [...data.classes].filter((row) => row.belowThreshold > 0).sort((left, right) => right.belowThreshold - left.belowThreshold)
  const columns: Array<DataTableColumn<ClassRow>> = [
    { key: 'className', header: 'Class', render: (row) => <strong>{row.className}</strong>, sortValue: (row) => row.className },
    { key: 'students', header: 'On roll', align: 'right', render: (row) => row.students, sortValue: (row) => row.students },
    { key: 'average', header: 'Average', align: 'right', render: (row) => <div style={{ minWidth: 130 }}><strong>{row.average}%</strong><ProgressBar value={row.average} tone={row.average >= 90 ? 'success' : row.average >= 85 ? 'warning' : 'danger'} /></div>, sortValue: (row) => row.average },
    { key: 'below', header: 'Below 85%', align: 'right', render: (row) => <Badge tone={row.belowThreshold === 0 ? 'success' : row.belowThreshold > 3 ? 'danger' : 'warning'}>{row.belowThreshold} students</Badge>, sortValue: (row) => row.belowThreshold },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={row.average >= 90 ? 'success' : row.average >= 85 ? 'info' : 'danger'} dot>{row.average >= 90 ? 'Healthy' : row.average >= 85 ? 'Watch' : 'Intervene'}</Badge> },
  ]

  return <div className="ec-page">
    {header}
    <div className="ec-row" style={{ marginBottom: 'var(--ec-space-3)', flexWrap: 'wrap', gap: 12 }}>
      <ChipRow options={[{ value: '7', label: '7 days' }, { value: '14', label: '14 days' }, { value: '30', label: '30 days' }]} value={range} onChange={setRange} />
      <span className="ec-spacer" />
      <Badge tone={averageRate >= 90 ? 'success' : 'warning'} dot>{averageRate}% credited attendance</Badge>
    </div>
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Average rate" value={`${averageRate}%`} icon={Percent} tone={averageRate >= 90 ? 'success' : 'warning'} delta={Math.round((averageRate - 90) * 10) / 10} deltaLabel="vs 90% target" />
      <StatCard label="Present marks" value={totals.present.toLocaleString()} icon={CalendarCheck} tone="success" hint={`${range}-day window`} />
      <StatCard label="Absent marks" value={totals.absent.toLocaleString()} icon={CalendarX} tone="danger" hint={`${totals.late} late arrivals`} />
      <StatCard label="Students below 85%" value={belowThreshold} icon={Clock3} tone={belowThreshold > 0 ? 'warning' : 'success'} hint="Across all classes" />
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="Attendance trend" hint={`Credited attendance over the last ${range} days`} isEmpty={trend.length === 0} legend={[{ label: 'Rate %', color: chartColors.primary }]}>
        <AreaChart data={trend}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="date" {...chartAxisProps} />
          <YAxis {...chartAxisProps} domain={[0, 100]} />
          <Tooltip content={<ChartTooltip valueSuffix="%" />} />
          <Area type="monotone" dataKey="rate" name="Rate %" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.14} strokeWidth={2} />
        </AreaChart>
      </ChartCard>
      <ChartCard title="Daily composition" hint="Present, late and absent marks per school day" isEmpty={trend.length === 0} legend={[{ label: 'Present', color: chartColors.success }, { label: 'Late', color: chartColors.warning }, { label: 'Absent', color: chartColors.danger }]}>
        <BarChart data={trend}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="date" {...chartAxisProps} />
          <YAxis {...chartAxisProps} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="present" stackId="day" name="Present" fill={chartColors.success} />
          <Bar dataKey="late" stackId="day" name="Late" fill={chartColors.warning} />
          <Bar dataKey="absent" stackId="day" name="Absent" fill={chartColors.danger} />
        </BarChart>
      </ChartCard>
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="Class comparison" hint="Average attendance against the 85% watch threshold" isEmpty={data.classes.length === 0} legend={[{ label: 'Average %', color: chartColors.violet }]}>
        <BarChart data={data.classes}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="className" {...chartAxisProps} />
          <YAxis {...chartAxisProps} domain={[0, 100]} />
          <Tooltip content={<ChartTooltip valueSuffix="%" />} />
          <ReferenceLine y={85} stroke={chartColors.danger} strokeDasharray="4 4" />
          <Bar dataKey="average" name="Average %" radius={[4, 4, 0, 0]} fill={chartColors.violet} />
        </BarChart>
      </ChartCard>
      <Panel title="Watchlist classes" hint="Students below the 85% attendance threshold">
        <div className="ec-stack">
          {watchlist.length === 0 ? <p className="ec-small ec-muted">Every class is above the watch threshold.</p> : watchlist.map((item) => <div key={item.classId} className="ec-stack" style={{ gap: 4 }}>
            <div className="ec-row"><strong style={{ fontSize: 13 }}>{item.className}</strong><span className="ec-spacer" /><Badge tone={item.average < 80 ? 'danger' : 'warning'}>{item.belowThreshold} students</Badge></div>
            <ProgressBar value={item.average} tone={item.average < 80 ? 'danger' : 'warning'} />
            <span className="ec-small ec-muted">{item.average}% average · {item.students} on roll</span>
          </div>)}
        </div>
      </Panel>
    </div>
    <div>
      <DataTable columns={columns} rows={data.classes} rowKey={(row) => row.classId} searchPlaceholder="Search classes…" filters={[{ key: 'watch', label: 'All classes', options: [{ value: 'watch', label: 'Below 85%' }, { value: 'clear', label: 'Above 85%' }], match: (row, value) => value === 'watch' ? row.belowThreshold > 0 : row.belowThreshold === 0 }]} actions={(row) => <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => exportStub(`${row.className} attendance`)}>Export</button>} emptyTitle="No classes" emptyMessage="No attendance data matches the current filters." />
    </div>
  </div>
}

