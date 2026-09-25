import { CalendarDays, GraduationCap, Percent, Wallet } from 'lucide-react'
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, KeyValue, PageHeader, Panel, ProgressBar } from '../../components/ui/primitives'
import { StatCard } from '../../components/ui/StatCard'
import { ChartCard, ChartTooltip, chartAxisProps, chartColors, chartGridProps } from '../../components/ui/ChartCard'
import { useMockQuery } from '../../hooks/useMockQuery'
import { mockApi } from '../../services/mockApi'
import { useAppSelector } from '../../store'
import { nameOf } from '../../mocks'
import type { DashboardData } from './types'

export function StudentDashboard({ data }: { data: DashboardData }) {
  const user = useAppSelector((state) => state.auth.user)
  const profileQuery = useMockQuery(['system', 'profiles'], mockApi.userProfileBoard)
  const student = profileQuery.data?.students.find((item) => item.id === user?.id)
  const myPerformance = data.performance.find((row) => row.studentId === user?.id)
  const myFee = data.feeStatus.find((row) => row.studentId === user?.id)
  const myProfile = data.riskProfile.find((row) => row.studentId === user?.id)
  const mySlots = data.todaySlots.filter((slot) => slot.classId === student?.classId)
  const classPeers = data.performance.filter((row) => row.classId === student?.classId).sort((left, right) => right.average - left.average)
  const rank = classPeers.findIndex((row) => row.studentId === user?.id) + 1
  return <div className="ec-page">
    <PageHeader eyebrow="Dashboard · student" title={`Hello, ${nameOf(user?.id ?? null)}`} subtitle={student ? `${student.rollNo} · ${student.house} house · ${mySlots.length} periods today` : 'Student workspace'} actions={myProfile ? <Badge tone={myProfile.engagement >= 75 ? 'success' : 'warning'} dot>{myProfile.engagement}% engagement</Badge> : undefined} />
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="My average" value={myPerformance ? `${myPerformance.average}%` : '—'} icon={GraduationCap} tone={(myPerformance?.average ?? 0) >= 75 ? 'success' : 'warning'} hint={myPerformance ? `Grade ${myPerformance.grade}` : 'No marks yet'} />
      <StatCard label="My attendance" value={myPerformance ? `${myPerformance.attendance}%` : '—'} icon={Percent} tone={(myPerformance?.attendance ?? 0) >= 90 ? 'success' : 'warning'} hint="Credited attendance" />
      <StatCard label="Class rank" value={rank > 0 ? `#${rank}` : '—'} icon={CalendarDays} tone="info" hint={`of ${classPeers.length} learners`} />
      <StatCard label="Fee status" value={myFee?.status ?? '—'} icon={Wallet} tone={myFee?.status === 'overdue' ? 'danger' : myFee?.status === 'partial' ? 'warning' : 'success'} hint="Current term" />
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="My progress trend" hint="Seeded assessment checkpoints" isEmpty={(myPerformance?.trend.length ?? 0) === 0} legend={[{ label: 'Score %', color: chartColors.primary }]}>
        <LineChart data={myPerformance?.trend ?? []}>
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
      <Panel title="Subject focus" hint="Where to invest revision time next">
        <div className="ec-stack">
          <KeyValue items={[{ label: 'Strongest subject', value: myPerformance?.bestSubject ?? '—' }, { label: 'Needs work', value: myPerformance?.weakSubject ?? '—' }, { label: 'Current grade', value: myPerformance?.grade ?? '—' }]} />
          {myPerformance && <div className="ec-stack" style={{ gap: 4 }}>
            <div className="ec-row"><span className="ec-small ec-muted">Average score</span><span className="ec-spacer" /><strong>{myPerformance.average}%</strong></div>
            <ProgressBar value={myPerformance.average} tone={myPerformance.average >= 75 ? 'success' : 'warning'} />
          </div>}
          {myProfile && <p className="ec-small ec-muted">{myProfile.note}</p>}
        </div>
      </Panel>
      <Panel title="Today's timetable" hint="Periods for my class" flush>
        <div className="ec-card__body ec-stack">
          {mySlots.length === 0 ? <p className="ec-small ec-muted">No periods scheduled for today.</p> : mySlots.map((slot) => <div key={slot.id} className="ec-row">
            <Badge tone="info">{slot.startTime}</Badge>
            <div className="ec-table__primary"><strong>{slot.subjectId}</strong><span>{slot.room} · {slot.teacherId}</span></div>
            <span className="ec-spacer" />
            <span className="ec-small ec-muted">P{slot.period}</span>
          </div>)}
        </div>
      </Panel>
    </div>
    <Panel title="Notices" hint="Announcements for students" flush>
      <div className="ec-card__body ec-stack">
        {data.notices.map((notice) => <div key={notice.id} className="ec-row">
          <Badge tone={notice.channel === 'in_app' ? 'info' : 'neutral'}>{notice.channel.replace('_', '-')}</Badge>
          <div className="ec-table__primary"><strong>{notice.title}</strong><span>{notice.createdAt}</span></div>
        </div>)}
      </div>
    </Panel>
  </div>
}

