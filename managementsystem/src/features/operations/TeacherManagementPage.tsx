import { useState } from 'react'
import { Briefcase, Clock3, Gauge, Users } from 'lucide-react'
import { Badge, KeyValue, PageHeader, Panel, ProgressBar } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { Modal } from '../../components/ui/Modal'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { RoleGate } from '../../components/ui/RoleGate'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import type { UserRole } from '../../store/authSlice'

const leadershipRoles: UserRole[] = ['super_admin', 'principal']

export function TeacherManagementPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['teacher-directory'], mockApi.teacherDirectory)

  const header = <PageHeader eyebrow="Operations · people" title="Teacher management" subtitle="Directory, workload balance and effectiveness scoring in one board." actions={<RoleGate roles={leadershipRoles}><button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Teacher directory')}>Export</button></RoleGate>} />

  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={320} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const effectivenessOf = (id: string) => data.effectiveness.find((row) => row.teacherId === id)
  const workloadOf = (id: string) => data.workloads.find((row) => row.teacherId === id)
  const selected = data.teachers.find((teacher) => teacher.id === selectedId) ?? null
  const departments = new Set(data.teachers.map((teacher) => teacher.department))
  const avgPeriods = Math.round(data.teachers.reduce((sum, teacher) => sum + teacher.weeklyPeriods, 0) / (data.teachers.length || 1))
  const avgEffectiveness = Math.round(data.effectiveness.reduce((sum, row) => sum + row.effectiveness, 0) / (data.effectiveness.length || 1))

  const columns: Array<DataTableColumn<(typeof data.teachers)[number]>> = [
    { key: 'name', header: 'Teacher', render: (row) => <div className="ec-table__primary"><strong>{row.firstName} {row.lastName}</strong><span>{row.employeeCode} · {row.designation}</span></div>, searchValue: (row) => `${row.firstName} ${row.lastName} ${row.employeeCode} ${row.designation}` },
    { key: 'department', header: 'Department', render: (row) => <Badge tone="info">{row.department}</Badge> },
    { key: 'subjects', header: 'Subjects', render: (row) => data.subjects.filter((subject) => row.subjectIds.includes(subject.id)).map((subject) => subject.code).join(' · ') || '—', searchValue: (row) => data.subjects.filter((subject) => row.subjectIds.includes(subject.id)).map((subject) => subject.name).join(' ') },
    { key: 'classes', header: 'Classes', align: 'right', render: (row) => row.classIds.length, sortValue: (row) => row.classIds.length },
    { key: 'periods', header: 'Periods / week', align: 'right', render: (row) => row.weeklyPeriods, sortValue: (row) => row.weeklyPeriods },
    { key: 'score', header: 'Performance', align: 'right', render: (row) => `${row.performanceScore}%`, sortValue: (row) => row.performanceScore },
    { key: 'effectiveness', header: 'Effectiveness', render: (row) => { const value = effectivenessOf(row.id)?.effectiveness ?? 0; return <div style={{ minWidth: 120 }}><span className="ec-small">{value}%</span><ProgressBar value={value} tone={value >= 75 ? 'success' : value >= 60 ? 'primary' : 'warning'} /></div> }, sortValue: (row) => effectivenessOf(row.id)?.effectiveness ?? 0 },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'active' ? 'success' : 'neutral'} dot>{row.status}</Badge> },
  ]

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Teachers" value={data.teachers.length} icon={Users} hint={`${departments.size} departments`} />
      <StatCard label="Weekly periods" value={avgPeriods} icon={Clock3} tone="warning" hint="Average workload" />
      <StatCard label="Effectiveness" value={`${avgEffectiveness}%`} icon={Gauge} tone="info" hint="Mock composite score" />
      <StatCard label="Active faculty" value={data.teachers.filter((teacher) => teacher.status === 'active').length} icon={Briefcase} tone="success" hint="Currently teaching" />
    </div>
    <Panel flush>
      <div className="ec-card__body">
        <DataTable columns={columns} rows={data.teachers} rowKey={(row) => row.id} searchPlaceholder="Search teachers, subjects, departments…"
          filters={[
            { key: 'department', label: 'All departments', options: [...departments].sort().map((department) => ({ value: department, label: department })), match: (row, value) => row.department === value },
            { key: 'status', label: 'All statuses', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }], match: (row, value) => row.status === value },
          ]}
          emptyTitle="No teachers found"
          emptyMessage="No faculty records match the current filters."
          onRowClick={(row) => setSelectedId(row.id)}
          actions={(row) => <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => setSelectedId(row.id)}>View profile</button>} />
      </div>
    </Panel>

    <Modal open={Boolean(selected)} title={selected ? `${selected.firstName} ${selected.lastName}` : 'Teacher profile'} description={selected ? `${selected.employeeCode} · ${selected.designation}` : ''} onClose={() => setSelectedId(null)}
      footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setSelectedId(null)}>Close</button><RoleGate roles={leadershipRoles}><button type="button" className="ec-btn" onClick={() => { setSelectedId(null); toast.success({ title: 'Workload reviewed', message: 'The teacher workload was acknowledged (mock).' }) }}>Review workload</button></RoleGate></>}>
      {selected && <div className="ec-stack">
        <KeyValue items={[
          { label: 'Department', value: selected.department },
          { label: 'Email', value: selected.email },
          { label: 'Phone', value: selected.phone },
          { label: 'Joined', value: selected.joinedOn },
          { label: 'Classes', value: selected.classIds.join(', ') || '—' },
          { label: 'Periods / week', value: selected.weeklyPeriods },
        ]} />
        {workloadOf(selected.id) && <div className="ec-stack" style={{ gap: 'var(--ec-space-2)' }}>
          <span className="ec-small ec-muted">Student reach</span>
          <ProgressBar value={workloadOf(selected.id)!.students} max={Math.max(100, workloadOf(selected.id)!.students)} tone="primary" />
          <span className="ec-small">{workloadOf(selected.id)!.students} students across {workloadOf(selected.id)!.classes} classes</span>
        </div>}
        {effectivenessOf(selected.id) && <p className="ec-small ec-muted">Effectiveness score: {effectivenessOf(selected.id)!.effectiveness}%. Attendance {effectivenessOf(selected.id)!.averageAttendance}%, results {effectivenessOf(selected.id)!.averagePerformance}%.</p>}
      </div>}
    </Modal>
  </div>
}

