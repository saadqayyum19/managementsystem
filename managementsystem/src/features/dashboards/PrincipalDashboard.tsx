import { AlertTriangle, CalendarClock, ClipboardList, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, Badge, PageHeader, Panel, ProgressBar } from '../../components/ui/primitives'
import { StatCard } from '../../components/ui/StatCard'
import { ChartCard, ChartTooltip, chartAxisProps, chartColors, chartGridProps } from '../../components/ui/ChartCard'
import { useExportStub } from '../../hooks/useExportStub'
import type { DashboardData } from './types'

export function PrincipalDashboard({ data }: { data: DashboardData }) {
  const { exportStub } = useExportStub()
  const { headline } = data
  const topTeachers = [...data.teacherEffectiveness].sort((left, right) => right.effectiveness - left.effectiveness).slice(0, 5)
  const riskList = data.atRisk.filter((row) => row.riskLevel !== 'low').slice(0, 5)
  const defaulters = data.classes.filter((row) => row.belowThreshold > 0).sort((left, right) => right.belowThreshold - left.belowThreshold)
  return <div className="ec-page">
    <PageHeader eyebrow="Dashboard · principal" title="Academic leadership overview" subtitle={`${headline.students} learners · ${headline.teachers} faculty · ${headline.classes} classes`} actions={<button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Principal briefing')}>Export briefing</button>} />
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Average performance" value={`${headline.averagePerformance}%`} icon={TrendingUp} tone="success" delta={2.6} deltaLabel="vs last term" />
      <StatCard label="Attendance rate" value={`${headline.attendanceRate}%`} icon={CalendarClock} tone={headline.attendanceRate >= 90 ? 'success' : 'warning'} delta={Math.round((headline.attendanceRate - 90) * 10) / 10} deltaLabel="vs 90% target" />
      <StatCard label="At-risk students" value={data.atRisk.filter((row) => row.riskLevel === 'high').length} icon={AlertTriangle} tone={headline.highRisk > 0 ? 'danger' : 'success'} hint={`${data.atRisk.filter((row) => row.riskLevel === 'medium').length} medium risk`} />
      <StatCard label="Pending approvals" value={data.pendingLeaves.length} icon={ClipboardList} tone={data.pendingLeaves.length > 0 ? 'warning' : 'success'} hint="Leave requests" />
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="Class performance" hint="Average score by class against the 70% floor" isEmpty={data.classes.length === 0} legend={[{ label: 'Average %', color: chartColors.primary }]}>
        <BarChart data={data.classes}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="className" {...chartAxisProps} />
          <YAxis {...chartAxisProps} domain={[0, 100]} />
          <Tooltip content={<ChartTooltip valueSuffix="%" />} />
          <Bar dataKey="average" name="Average %" radius={[4, 4, 0, 0]}>{data.classes.map((entry) => <Cell key={entry.classId} fill={entry.average >= 80 ? chartColors.success : entry.average >= 70 ? chartColors.primary : chartColors.warning} />)}</Bar>
        </BarChart>
      </ChartCard>
      <ChartCard title="Attendance trend" hint="Last 30 school days" isEmpty={data.attendanceTrend.length === 0} legend={[{ label: 'Attendance %', color: chartColors.teal }]}>
        <LineChart data={data.attendanceTrend}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="date" {...chartAxisProps} />
          <YAxis {...chartAxisProps} domain={[0, 100]} />
          <Tooltip content={<ChartTooltip valueSuffix="%" />} />
          <Line type="monotone" dataKey="rate" name="Attendance %" stroke={chartColors.teal} strokeWidth={2} dot={false} />
        </LineChart>
      </ChartCard>
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <Panel title="Faculty effectiveness" hint="Top five by weighted classroom outcomes">
        <div className="ec-stack">
          {topTeachers.map((teacher) => <div key={teacher.teacherId} className="ec-stack" style={{ gap: 4 }}>
            <div className="ec-row"><Avatar name={teacher.name} /><div className="ec-table__primary"><strong>{teacher.name}</strong><span>{teacher.department} · {teacher.students} students</span></div><span className="ec-spacer" /><Badge tone={teacher.effectiveness >= 80 ? 'success' : 'info'}>{teacher.effectiveness}%</Badge></div>
            <ProgressBar value={teacher.effectiveness} tone={teacher.effectiveness >= 80 ? 'success' : 'warning'} />
          </div>)}
        </div>
      </Panel>
      <Panel title="Intervention priorities" hint="Medium and high risk students">
        <div className="ec-stack">
          {riskList.length === 0 ? <p className="ec-small ec-muted">No students are currently flagged.</p> : riskList.map((row) => <div key={row.studentId} className="ec-row">
            <Badge tone={row.riskLevel === 'high' ? 'danger' : 'warning'}>{row.riskScore}</Badge>
            <Avatar name={row.name} />
            <div className="ec-table__primary"><strong>{row.name}</strong><span>{row.className} · {row.reasons[0]}</span></div>
            <span className="ec-spacer" />
            <span className="ec-small ec-muted">{row.attendance}% att.</span>
          </div>)}
        </div>
      </Panel>
    </div>
    <div className="ec-grid ec-grid--2">
      <Panel title="Attendance watchlist" hint="Classes with students below 85%">
        <div className="ec-stack">
          {defaulters.length === 0 ? <p className="ec-small ec-muted">Every class is above the watch threshold.</p> : defaulters.map((row) => <div key={row.classId} className="ec-stack" style={{ gap: 4 }}>
            <div className="ec-row"><strong style={{ fontSize: 13 }}>{row.className}</strong><span className="ec-spacer" /><Badge tone={row.average < 85 ? 'danger' : 'warning'}>{row.belowThreshold} students</Badge></div>
            <ProgressBar value={row.average} tone={row.average < 85 ? 'danger' : 'warning'} />
          </div>)}
        </div>
      </Panel>
      <Panel title="Notices" hint="Latest published communications" flush>
        <div className="ec-card__body ec-stack">
          {data.notices.map((notice) => <div key={notice.id} className="ec-row">
            <Badge tone={notice.channel === 'in_app' ? 'info' : 'neutral'}>{notice.channel.replace('_', '-')}</Badge>
            <div className="ec-table__primary"><strong>{notice.title}</strong><span>{notice.createdAt}</span></div>
            <span className="ec-spacer" />
            <Badge tone="neutral">{notice.audience}</Badge>
          </div>)}
        </div>
      </Panel>
    </div>
  </div>
}

