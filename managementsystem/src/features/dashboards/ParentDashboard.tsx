import { CalendarDays, GraduationCap, Percent, ShieldCheck } from 'lucide-react'
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, Badge, KeyValue, PageHeader, Panel } from '../../components/ui/primitives'
import { StatCard } from '../../components/ui/StatCard'
import { ChartCard, ChartTooltip, chartAxisProps, chartColors, chartGridProps } from '../../components/ui/ChartCard'
import { useMockQuery } from '../../hooks/useMockQuery'
import { mockApi } from '../../services/mockApi'
import { useAppSelector } from '../../store'
import { nameOf } from '../../mocks'
import type { DashboardData } from './types'

export function ParentDashboard({ data }: { data: DashboardData }) {
  const user = useAppSelector((state) => state.auth.user)
  const profileQuery = useMockQuery(['system', 'profiles'], mockApi.userProfileBoard)
  const guardian = profileQuery.data?.guardians.find((item) => item.id === user?.id)
  const child = profileQuery.data?.students.find((item) => item.id === guardian?.studentIds[0])
  const childPerformance = data.performance.find((row) => row.studentId === child?.id)
  const childFee = data.feeStatus.find((row) => row.studentId === child?.id)
  const childProfile = data.riskProfile.find((row) => row.studentId === child?.id)
  const childSlots = data.todaySlots.filter((slot) => slot.classId === child?.classId)
  const coGuardians = child ? (profileQuery.data?.guardians ?? []).filter((item) => child.guardianIds.includes(item.id)) : []
  return <div className="ec-page">
    <PageHeader eyebrow="Dashboard · guardian" title={`${child ? nameOf(child.id) : 'Ward'} overview`} subtitle={child ? `${child.rollNo} · ${child.house} house · guardian view` : 'Guardian workspace'} actions={childProfile ? <Badge tone={childProfile.engagement >= 75 ? 'success' : 'warning'} dot>{childProfile.engagement}% engagement</Badge> : undefined} />
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Attendance" value={childPerformance ? `${childPerformance.attendance}%` : '—'} icon={Percent} tone={(childPerformance?.attendance ?? 0) >= 90 ? 'success' : 'warning'} hint="Credited this term" />
      <StatCard label="Average score" value={childPerformance ? `${childPerformance.average}%` : '—'} icon={GraduationCap} tone={(childPerformance?.average ?? 0) >= 75 ? 'success' : 'warning'} hint={childPerformance ? `Grade ${childPerformance.grade}` : 'No marks yet'} />
      <StatCard label="Fee status" value={childFee?.status ?? '—'} icon={ShieldCheck} tone={childFee?.status === 'overdue' ? 'danger' : childFee?.status === 'partial' ? 'warning' : 'success'} hint="Current term" />
      <StatCard label="Periods today" value={childSlots.length} icon={CalendarDays} tone="info" hint={childSlots[0]?.startTime ?? 'No timetable'} />
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="Progress trend" hint="Seeded assessment checkpoints for my ward" isEmpty={(childPerformance?.trend.length ?? 0) === 0} legend={[{ label: 'Score %', color: chartColors.primary }]}>
        <LineChart data={childPerformance?.trend ?? []}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="label" {...chartAxisProps} />
          <YAxis {...chartAxisProps} domain={[0, 100]} />
          <Tooltip content={<ChartTooltip valueSuffix="%" />} />
          <Line type="monotone" dataKey="score" name="Score %" stroke={chartColors.primary} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ChartCard>
      <ChartCard title="School attendance" hint="School-wide trend for context" isEmpty={data.attendanceTrend.length === 0} legend={[{ label: 'Attendance %', color: chartColors.teal }]}>
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
      <Panel title="Ward profile" hint="Read-only record from the mock directory">
        <div className="ec-stack">
          {child ? <KeyValue items={[{ label: 'Class', value: child.classId }, { label: 'Roll number', value: child.rollNo }, { label: 'House', value: child.house }, { label: 'Blood group', value: child.bloodGroup }, { label: 'Transport route', value: child.transportRouteId ?? 'Day scholar' }]} /> : <p className="ec-small ec-muted">No linked student record for this guardian.</p>}
          {childProfile && <p className="ec-small ec-muted">{childProfile.note}</p>}
        </div>
      </Panel>
      <Panel title="Guardian contacts" hint="Adults authorised on this student record">
        <div className="ec-stack">
          {coGuardians.length === 0 ? <p className="ec-small ec-muted">No guardian contacts are linked.</p> : coGuardians.map((item) => <div key={item.id} className="ec-row">
            <Avatar name={nameOf(item.id)} />
            <div className="ec-table__primary"><strong>{nameOf(item.id)}{item.id === user?.id ? ' (you)' : ''}</strong><span>{item.relationship} · {item.phone}</span></div>
            <span className="ec-spacer" />
            <Badge tone={item.id === user?.id ? 'info' : 'neutral'}>{item.relationship}</Badge>
          </div>)}
        </div>
      </Panel>
    </div>
    <Panel title="Notices" hint="Announcements shared with guardians" flush>
      <div className="ec-card__body ec-stack">
        {data.notices.map((notice) => <div key={notice.id} className="ec-row">
          <Badge tone={notice.channel === 'in_app' ? 'info' : 'neutral'}>{notice.channel.replace('_', '-')}</Badge>
          <div className="ec-table__primary"><strong>{notice.title}</strong><span>{notice.createdAt}</span></div>
        </div>)}
      </div>
    </Panel>
  </div>
}

