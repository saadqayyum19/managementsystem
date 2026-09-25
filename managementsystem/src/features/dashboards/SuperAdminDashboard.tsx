import { AlertTriangle, CalendarClock, TrendingUp, Users, Wallet } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, Badge, PageHeader, Panel, ProgressBar } from '../../components/ui/primitives'
import { StatCard } from '../../components/ui/StatCard'
import { ChartCard, ChartTooltip, chartAxisProps, chartColors, chartGridProps } from '../../components/ui/ChartCard'
import { useExportStub } from '../../hooks/useExportStub'
import { nameOf } from '../../mocks'
import type { DashboardData } from './types'

export function SuperAdminDashboard({ data }: { data: DashboardData }) {
  const { exportStub } = useExportStub()
  const { headline, fees, payroll, expenses } = data
  const riskWatchlist = [...data.riskProfile]
    .filter((profile) => profile.engagement < 65 || profile.performanceTarget < 65 || profile.feeBehaviour === 'overdue')
    .sort((left, right) => left.engagement - right.engagement)
    .slice(0, 4)
  return <div className="ec-page">
    <PageHeader eyebrow="Dashboard · super admin" title="Institution overview" subtitle={`${headline.students} students · ${headline.teachers} teachers · ${headline.classes} classes across the mock tenant.`} actions={<button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Executive summary')}>Export summary</button>} />
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Enrolment" value={headline.students} icon={Users} hint={`${headline.classes} classes`} />
      <StatCard label="Attendance rate" value={`${headline.attendanceRate}%`} icon={CalendarClock} tone={headline.attendanceRate >= 90 ? 'success' : 'warning'} delta={Math.round((headline.attendanceRate - 90) * 10) / 10} deltaLabel="vs 90% target" />
      <StatCard label="Average performance" value={`${headline.averagePerformance}%`} icon={TrendingUp} tone="success" hint="School-wide" />
      <StatCard label="High risk" value={headline.highRisk} icon={AlertTriangle} tone={headline.highRisk > 0 ? 'danger' : 'success'} hint="Early-warning flags" />
    </div>
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Fees collected" value={`$${fees.collected.toLocaleString()}`} icon={Wallet} tone="success" hint={`${fees.collectionRate}% of billed`} />
      <StatCard label="Fees outstanding" value={`$${fees.outstanding.toLocaleString()}`} icon={Wallet} tone={fees.outstanding > 0 ? 'warning' : 'success'} hint={`${fees.overdueCount} overdue invoices`} />
      <StatCard label="Net payroll" value={`$${payroll.net.toLocaleString()}`} icon={Wallet} tone="info" hint={`${payroll.headcount} staff · ${payroll.pending} pending`} />
      <StatCard label="Expenses logged" value={`$${expenses.total.toLocaleString()}`} icon={Wallet} tone="warning" hint={`${expenses.pending} awaiting approval`} />
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="Fee collection vs target" hint="Mock monthly collection against plan" isEmpty={data.feeTrend.length === 0} legend={[{ label: 'Collected', color: chartColors.success }, { label: 'Target', color: chartColors.slate }]}>
        <BarChart data={data.feeTrend}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="month" {...chartAxisProps} />
          <YAxis {...chartAxisProps} tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`} />
          <Tooltip content={<ChartTooltip valueSuffix=" USD" />} />
          <Bar dataKey="target" name="Target" radius={[4, 4, 0, 0]} fill={chartColors.slate} />
          <Bar dataKey="collected" name="Collected" radius={[4, 4, 0, 0]} fill={chartColors.success} />
        </BarChart>
      </ChartCard>
      <ChartCard title="Attendance trend" hint="School-wide credited attendance" isEmpty={data.attendanceTrend.length === 0} legend={[{ label: 'Attendance %', color: chartColors.primary }]}>
        <AreaChart data={data.attendanceTrend}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="date" {...chartAxisProps} />
          <YAxis {...chartAxisProps} domain={[0, 100]} />
          <Tooltip content={<ChartTooltip valueSuffix="%" />} />
          <Area type="monotone" dataKey="rate" name="Attendance %" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.14} strokeWidth={2} />
        </AreaChart>
      </ChartCard>
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="Class performance" hint="Average score per class" isEmpty={data.classes.length === 0} legend={[{ label: 'Average %', color: chartColors.violet }]}>
        <BarChart data={data.classes}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="className" {...chartAxisProps} />
          <YAxis {...chartAxisProps} domain={[0, 100]} />
          <Tooltip content={<ChartTooltip valueSuffix="%" />} />
          <Bar dataKey="average" name="Average %" radius={[4, 4, 0, 0]}>{data.classes.map((entry) => <Cell key={entry.classId} fill={entry.average >= 80 ? chartColors.success : entry.average >= 70 ? chartColors.primary : chartColors.warning} />)}</Bar>
        </BarChart>
      </ChartCard>
      <Panel title="At-risk watchlist" hint="Lowest engagement across the cohort" flush>
        <div className="ec-card__body ec-stack">
          {riskWatchlist.length === 0 ? <p className="ec-small ec-muted">No students currently breach the risk thresholds.</p> : riskWatchlist.map((profile) => <div key={profile.studentId} className="ec-stack" style={{ gap: 4 }}>
            <div className="ec-row"><Avatar name={profile.name} /><div className="ec-table__primary"><strong>{profile.name}</strong><span>{profile.className} · engagement {profile.engagement}%</span></div><span className="ec-spacer" /><Badge tone={profile.feeBehaviour === 'overdue' ? 'danger' : 'warning'}>{profile.feeBehaviour}</Badge></div>
            <ProgressBar value={profile.engagement} tone={profile.engagement < 65 ? 'danger' : 'warning'} />
          </div>)}
        </div>
      </Panel>
    </div>
    <div className="ec-grid ec-grid--2">
      <Panel title="Pending leave requests" hint="Awaiting leadership approval" flush>
        <div className="ec-card__body ec-stack">
          {data.pendingLeaves.length === 0 ? <p className="ec-small ec-muted">No leave requests are pending.</p> : data.pendingLeaves.slice(0, 4).map((request) => <div key={request.id} className="ec-row">
            <Avatar name={nameOf(request.applicantId)} />
            <div className="ec-table__primary"><strong>{nameOf(request.applicantId)}</strong><span>{request.type} leave · {request.from} → {request.to}</span></div>
            <span className="ec-spacer" />
            <Badge tone="warning">{request.days} days</Badge>
          </div>)}
        </div>
      </Panel>
      <Panel title="Recent audit activity" hint="Last five privileged events" flush>
        <div className="ec-card__body ec-stack">
          {data.recentAudit.map((log) => <div key={log.id} className="ec-row">
            <Badge tone={log.severity === 'critical' ? 'danger' : log.severity === 'warning' ? 'warning' : 'info'} dot>{log.severity}</Badge>
            <div className="ec-table__primary"><strong>{log.action}</strong><span>{nameOf(log.actorId)} · {log.module} · {log.timestamp}</span></div>
          </div>)}
        </div>
      </Panel>
    </div>
  </div>
}

