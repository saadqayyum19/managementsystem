import { AlertTriangle, BookOpen, CalendarDays, ClipboardList, Users } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, Badge, PageHeader, Panel, ProgressBar } from '../../components/ui/primitives'
import { StatCard } from '../../components/ui/StatCard'
import { ChartCard, ChartTooltip, chartAxisProps, chartColors, chartGridProps } from '../../components/ui/ChartCard'
import { useMockQuery } from '../../hooks/useMockQuery'
import { mockApi } from '../../services/mockApi'
import { useAppSelector } from '../../store'
import { nameOf } from '../../mocks'
import type { DashboardData } from './types'

export function TeacherDashboard({ data }: { data: DashboardData }) {
  const user = useAppSelector((state) => state.auth.user)
  const profileQuery = useMockQuery(['system', 'profiles'], mockApi.userProfileBoard)
  const teacher = profileQuery.data?.teachers.find((item) => item.id === user?.id)
  const myClassIds = teacher?.classIds ?? []
  const mySlots = data.todaySlots.filter((slot) => slot.teacherId === user?.id)
  const myClassRows = data.classes.filter((row) => myClassIds.includes(row.classId))
  const myStudents = myClassRows.reduce((sum, row) => sum + row.students, 0)
  const myEffectiveness = data.teacherEffectiveness.find((row) => row.teacherId === user?.id)
  const myLeaves = data.pendingLeaves.filter((request) => request.applicantId === user?.id)
  const myClassNames = myClassRows.map((row) => row.className)
  const myRisk = data.atRisk.filter((row) => myClassNames.includes(row.className) && row.riskLevel !== 'low').slice(0, 4)
  return <div className="ec-page">
    <PageHeader eyebrow="Dashboard · teacher" title={`Good day, ${nameOf(user?.id ?? null)}`} subtitle={`${myClassIds.length} assigned classes · ${mySlots.length} periods scheduled today`} actions={<Badge tone={myLeaves.length > 0 ? 'warning' : 'success'} dot>{myLeaves.length} leave request{myLeaves.length === 1 ? '' : 's'}</Badge>} />
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="My classes" value={myClassIds.length} icon={BookOpen} hint={teacher?.department ?? 'Faculty'} />
      <StatCard label="Students taught" value={myStudents} icon={Users} tone="info" hint={`${mySlots.length} periods today`} />
      <StatCard label="Effectiveness" value={myEffectiveness ? `${myEffectiveness.effectiveness}%` : '—'} icon={CalendarDays} tone={(myEffectiveness?.effectiveness ?? 0) >= 75 ? 'success' : 'warning'} hint="Weighted review score" />
      <StatCard label="At-risk students" value={myRisk.length} icon={AlertTriangle} tone={myRisk.length > 0 ? 'danger' : 'success'} hint="In my classes" />
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <Panel title="Today's timetable" hint="Periods assigned to me" flush>
        <div className="ec-card__body ec-stack">
          <div className="ec-row"><ClipboardList size={15} className="ec-muted" /><span className="ec-small ec-muted">{mySlots.length} period{mySlots.length === 1 ? '' : 's'} scheduled</span></div>
          {mySlots.length === 0 ? <p className="ec-small ec-muted">No periods scheduled for today in the mock timetable.</p> : mySlots.map((slot) => <div key={slot.id} className="ec-row">
            <Badge tone="info">{slot.startTime}</Badge>
            <div className="ec-table__primary"><strong>{slot.subjectId}</strong><span>{slot.room} · until {slot.endTime}</span></div>
            <span className="ec-spacer" />
            <span className="ec-small ec-muted">Period {slot.period}</span>
          </div>)}
        </div>
      </Panel>
      <Panel title="My classes" hint="Attendance and average performance">
        <div className="ec-stack">
          {myClassRows.length === 0 ? <p className="ec-small ec-muted">No classes are assigned to this teacher.</p> : myClassRows.map((row) => <div key={row.classId} className="ec-stack" style={{ gap: 4 }}>
            <div className="ec-row"><strong style={{ fontSize: 13 }}>{row.className}</strong><span className="ec-spacer" /><span className="ec-small ec-muted">{row.students} students</span><Badge tone={row.average >= 80 ? 'success' : 'warning'}>{row.average}%</Badge></div>
            <ProgressBar value={row.average} tone={row.average >= 80 ? 'success' : row.average >= 70 ? 'warning' : 'danger'} />
            <span className="ec-small ec-muted">{row.belowThreshold} students below the 85% attendance threshold</span>
          </div>)}
        </div>
      </Panel>
    </div>
    <div className="ec-grid ec-grid--2">
      <ChartCard title="Class averages" hint="Performance in my assigned classes" isEmpty={myClassRows.length === 0} legend={[{ label: 'Average %', color: chartColors.primary }]}>
        <BarChart data={myClassRows}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="className" {...chartAxisProps} />
          <YAxis {...chartAxisProps} domain={[0, 100]} />
          <Tooltip content={<ChartTooltip valueSuffix="%" />} />
          <Bar dataKey="average" name="Average %" radius={[4, 4, 0, 0]}>{myClassRows.map((entry) => <Cell key={entry.classId} fill={entry.average >= 80 ? chartColors.success : entry.average >= 70 ? chartColors.primary : chartColors.warning} />)}</Bar>
        </BarChart>
      </ChartCard>
      <Panel title="Students needing support" hint="Medium and high risk in my classes">
        <div className="ec-stack">
          {myRisk.length === 0 ? <p className="ec-small ec-muted">No flagged students in my classes — great work.</p> : myRisk.map((row) => <div key={row.studentId} className="ec-row">
            <Badge tone={row.riskLevel === 'high' ? 'danger' : 'warning'}>{row.riskScore}</Badge>
            <Avatar name={row.name} />
            <div className="ec-table__primary"><strong>{row.name}</strong><span>{row.className} · {row.reasons[0]}</span></div>
          </div>)}
        </div>
      </Panel>
    </div>
  </div>
}

