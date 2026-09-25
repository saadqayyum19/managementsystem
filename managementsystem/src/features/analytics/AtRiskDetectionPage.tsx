import { useState } from 'react'
import { AlertTriangle, PhoneCall, ShieldCheck, UserRoundX } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, Badge, KeyValue, PageHeader, Panel, ProgressBar } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { ChartCard, ChartTooltip, chartAxisProps, chartColors, chartGridProps, chartTooltipStyle } from '../../components/ui/ChartCard'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { Modal } from '../../components/ui/Modal'
import { RoleGate } from '../../components/ui/RoleGate'
import { useToast } from '../../components/ui/Toast'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import type { UserRole } from '../../store/authSlice'

const staffRoles: UserRole[] = ['super_admin', 'principal', 'teacher']
const levels = ['high', 'medium', 'low']
const levelTone = { high: 'danger', medium: 'warning', low: 'success' } as const
type RiskRow = { studentId: string; name: string; className: string; attendance: number; average: number; feeStatus: string; riskScore: number; riskLevel: string; reasons: string[]; note: string }

export function AtRiskDetectionPage() {
  const [focus, setFocus] = useState<RiskRow | null>(null)
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['analytics', 'at-risk'], mockApi.atRiskBoard)
  const header = <PageHeader eyebrow="Analytics · early warning" title="At-risk detection" subtitle="Composite risk scoring across attendance, performance, fees and platform engagement." actions={<RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Risk register')}>Export risk register</button></RoleGate>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={2} height={300} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const rows: RiskRow[] = data.rows
  const counts = levels.map((level) => ({ level, count: rows.filter((row) => row.riskLevel === level).length }))
  const classNames = Array.from(new Set(rows.map((row) => row.className)))
  const classRisk = classNames.map((className) => ({
    className,
    high: rows.filter((row) => row.className === className && row.riskLevel === 'high').length,
    medium: rows.filter((row) => row.className === className && row.riskLevel === 'medium').length,
    low: rows.filter((row) => row.className === className && row.riskLevel === 'low').length,
  }))
  const interventionQueue = rows.filter((row) => row.riskLevel === 'high').slice(0, 5)
  const columns: Array<DataTableColumn<RiskRow>> = [
    { key: 'student', header: 'Student', render: (row) => <div className="ec-row"><Avatar name={row.name} /><div className="ec-table__primary"><strong>{row.name}</strong><span>{row.className}</span></div></div>, searchValue: (row) => `${row.name} ${row.className}` },
    { key: 'attendance', header: 'Attendance', align: 'right', render: (row) => `${row.attendance}%`, sortValue: (row) => row.attendance },
    { key: 'average', header: 'Average', align: 'right', render: (row) => `${row.average}%`, sortValue: (row) => row.average },
    { key: 'fees', header: 'Fees', render: (row) => <Badge tone={row.feeStatus === 'overdue' ? 'danger' : row.feeStatus === 'partial' ? 'warning' : 'success'}>{row.feeStatus}</Badge> },
    { key: 'risk', header: 'Risk score', align: 'right', render: (row) => <div style={{ minWidth: 120 }}><strong>{row.riskScore}</strong><ProgressBar value={row.riskScore} tone={row.riskLevel === 'high' ? 'danger' : row.riskLevel === 'medium' ? 'warning' : 'success'} /></div>, sortValue: (row) => row.riskScore },
    { key: 'level', header: 'Level', render: (row) => <Badge tone={levelTone[row.riskLevel as keyof typeof levelTone] ?? 'neutral'} dot>{row.riskLevel}</Badge>, sortValue: (row) => row.riskScore },
    { key: 'reasons', header: 'Signals', render: (row) => <span className="ec-small">{row.reasons.slice(0, 2).join(' · ')}</span>, searchValue: (row) => row.reasons.join(' ') },
  ]

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="High risk" value={data.headline.highRisk} icon={AlertTriangle} tone={data.headline.highRisk > 0 ? 'danger' : 'success'} hint="Immediate outreach" />
      <StatCard label="Medium risk" value={counts[1]?.count ?? 0} icon={UserRoundX} tone="warning" hint="Monitor weekly" />
      <StatCard label="Stable" value={counts[2]?.count ?? 0} icon={ShieldCheck} tone="success" hint="No active signals" />
      <StatCard label="Cohort attendance" value={`${data.headline.attendanceRate}%`} icon={PhoneCall} tone={data.headline.attendanceRate >= 90 ? 'success' : 'warning'} hint={`${data.headline.students} students scored`} />
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="Risk distribution" hint="Students by composite risk band" isEmpty={rows.length === 0} legend={[{ label: 'High', color: chartColors.danger }, { label: 'Medium', color: chartColors.warning }, { label: 'Low', color: chartColors.success }]}>
        <BarChart data={counts}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="level" {...chartAxisProps} />
          <YAxis {...chartAxisProps} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>{counts.map((entry) => <Cell key={entry.level} fill={entry.level === 'high' ? chartColors.danger : entry.level === 'medium' ? chartColors.warning : chartColors.success} />)}</Bar>
        </BarChart>
      </ChartCard>
      <ChartCard title="Attendance vs average" hint="Risk bands plotted by outcome" isEmpty={rows.length === 0} legend={[{ label: 'High', color: chartColors.danger }, { label: 'Medium', color: chartColors.warning }, { label: 'Low', color: chartColors.success }]}>
        <ScatterChart margin={{ left: 4, right: 12, top: 8 }}>
          <CartesianGrid {...chartGridProps} />
          <XAxis type="number" dataKey="average" name="Average %" domain={[30, 100]} {...chartAxisProps} />
          <YAxis type="number" dataKey="attendance" name="Attendance %" domain={[50, 100]} {...chartAxisProps} />
          <Tooltip {...chartTooltipStyle} />
          <Scatter name="High" data={rows.filter((row) => row.riskLevel === 'high')} fill={chartColors.danger} />
          <Scatter name="Medium" data={rows.filter((row) => row.riskLevel === 'medium')} fill={chartColors.warning} />
          <Scatter name="Low" data={rows.filter((row) => row.riskLevel === 'low')} fill={chartColors.success} />
        </ScatterChart>
      </ChartCard>
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="Risk by class" hint="High and medium flags per class" isEmpty={classRisk.length === 0} legend={[{ label: 'High', color: chartColors.danger }, { label: 'Medium', color: chartColors.warning }, { label: 'Stable', color: chartColors.success }]}>
        <BarChart data={classRisk}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="className" {...chartAxisProps} />
          <YAxis {...chartAxisProps} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="high" stackId="risk" name="High" fill={chartColors.danger} />
          <Bar dataKey="medium" stackId="risk" name="Medium" fill={chartColors.warning} />
          <Bar dataKey="low" stackId="risk" name="Stable" fill={chartColors.success} />
        </BarChart>
      </ChartCard>
      <Panel title="Intervention queue" hint="Highest risk scores awaiting outreach">
        <div className="ec-stack">
          {interventionQueue.length === 0 ? <p className="ec-small ec-muted">No high-risk students — the cohort is stable.</p> : interventionQueue.map((row) => <div key={row.studentId} className="ec-row">
            <Badge tone="danger">{row.riskScore}</Badge>
            <Avatar name={row.name} />
            <div className="ec-table__primary"><strong>{row.name}</strong><span>{row.reasons[0]}</span></div>
            <span className="ec-spacer" />
            <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => setFocus(row)}>Review</button>
          </div>)}
        </div>
      </Panel>
    </div>
    <div style={{ marginBottom: 'var(--ec-space-4)' }}>
      <DataTable columns={columns} rows={rows} rowKey={(row) => row.studentId} searchPlaceholder="Search students, signals…" filters={[{ key: 'level', label: 'All risk levels', options: levels.map((level) => ({ value: level, label: level })), match: (row, value) => row.riskLevel === value }, { key: 'class', label: 'All classes', options: classNames.map((className) => ({ value: className, label: className })), match: (row, value) => row.className === value }]} actions={(row) => <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => setFocus(row)}>Open</button>} emptyTitle="No students flagged" emptyMessage="No risk records match the current filters." />
    </div>
    <Modal open={focus !== null} title={`Intervention plan · ${focus?.name ?? ''}`} description="Mock risk signals from the analytics dataset." onClose={() => setFocus(null)} footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setFocus(null)}>Cancel</button><button type="button" className="ec-btn" onClick={() => { toast.success({ title: 'Intervention logged', message: `Follow-up queued for ${focus?.name ?? 'the student'}.` }); setFocus(null) }}>Log intervention</button></>}>
      {focus && <div className="ec-stack">
        <KeyValue items={[{ label: 'Class', value: focus.className }, { label: 'Attendance', value: `${focus.attendance}%` }, { label: 'Average', value: `${focus.average}%` }, { label: 'Fees', value: focus.feeStatus }, { label: 'Risk score', value: `${focus.riskScore} / 100` }, { label: 'Risk level', value: <Badge tone={levelTone[focus.riskLevel as keyof typeof levelTone] ?? 'neutral'} dot>{focus.riskLevel}</Badge> }]} />
        <Panel title="Detected signals" hint="Auto-generated from mock metrics">
          <div className="ec-stack">
            {focus.reasons.map((reason) => <div key={reason} className="ec-row"><Badge tone="danger" dot>signal</Badge><span>{reason}</span></div>)}
          </div>
        </Panel>
        <p className="ec-small ec-muted">{focus.note === '' ? 'No advisor note recorded for this student.' : focus.note}</p>
      </div>}
    </Modal>
  </div>
}


