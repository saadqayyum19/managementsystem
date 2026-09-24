import { useState } from 'react'
import { Award, CircleDollarSign, Percent, Trophy } from 'lucide-react'
import { Badge, PageHeader, Panel, ProgressBar } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { Modal } from '../../components/ui/Modal'
import { FormGrid, SelectField, TextAreaField, TextField } from '../../components/ui/FormField'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { RoleGate } from '../../components/ui/RoleGate'
import { useToast } from '../../components/ui/Toast'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import type { Scholarship } from '../../mocks/types'
import type { UserRole } from '../../store/authSlice'

const financeRoles: UserRole[] = ['super_admin', 'principal']
const scholarshipTypes: Scholarship['type'][] = ['merit', 'need', 'sports', 'arts']
const typeTone = { merit: 'info', need: 'success', sports: 'warning', arts: 'danger' } as const
const statusTone = { applied: 'neutral', shortlisted: 'warning', awarded: 'success', rejected: 'danger' } as const

type ApplicationRow = {
  id: string
  scholarshipId: string
  scholarshipName: string
  scholarshipType: Scholarship['type']
  coveragePercent: number
  amount: number
  studentId: string
  studentName: string
  status: 'applied' | 'shortlisted' | 'awarded' | 'rejected'
  score: number
}

const initialForm = { name: '', type: 'merit', coverage: '40', amount: '2000', criteria: '' }

export function ScholarshipManagementPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<ApplicationRow | null>(null)
  const [extra, setExtra] = useState<Scholarship[]>([])
  const [overrides, setOverrides] = useState<Record<string, ApplicationRow['status']>>({})
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['scholarships'], mockApi.scholarshipBoard)
  const header = <PageHeader eyebrow="Finance · scholarships" title="Scholarship management" subtitle="Opportunities, applications, shortlists and award commitments." actions={<RoleGate roles={financeRoles}><button className="ec-btn ec-btn--ghost" onClick={() => exportStub('Scholarship register')}>Export</button><button className="ec-btn" onClick={() => { setForm(initialForm); setErrors({}); setCreateOpen(true) }}>New scholarship</button></RoleGate>} />

  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={320} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const scholarships = [...extra, ...data.scholarships]
  const applications: ApplicationRow[] = scholarships.flatMap((scholarship) => scholarship.applications.map((application) => ({
    id: `${scholarship.id}:${application.studentId}`,
    scholarshipId: scholarship.id,
    scholarshipName: scholarship.name,
    scholarshipType: scholarship.type,
    coveragePercent: scholarship.coveragePercent,
    amount: scholarship.amount,
    studentId: application.studentId,
    studentName: nameOf(application.studentId),
    status: application.status,
    score: application.score,
  })))
  const statusOf = (row: ApplicationRow) => overrides[row.id] ?? row.status
  const awarded = applications.filter((row) => statusOf(row) === 'awarded')

  const columns: Array<DataTableColumn<ApplicationRow>> = [
    { key: 'student', header: 'Student', render: (row) => <div className="ec-table__primary"><strong>{row.studentName}</strong><span>{row.studentId}</span></div>, searchValue: (row) => `${row.studentName} ${row.studentId}` },
    { key: 'scholarship', header: 'Scholarship', render: (row) => <div className="ec-table__primary"><strong>{row.scholarshipName}</strong><span>{row.coveragePercent}% fee coverage</span></div>, searchValue: (row) => row.scholarshipName },
    { key: 'type', header: 'Type', render: (row) => <Badge tone={typeTone[row.scholarshipType]}>{row.scholarshipType}</Badge> },
    { key: 'score', header: 'Score', align: 'right', render: (row) => `${row.score}%`, sortValue: (row) => row.score },
    { key: 'value', header: 'Award value', align: 'right', render: (row) => `$${row.amount.toLocaleString()}`, sortValue: (row) => row.amount },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={statusTone[statusOf(row)]} dot>{statusOf(row)}</Badge> },
  ]

  const save = () => {
    const next = {
      name: form.name.trim() ? '' : 'Scholarship name is required.',
      coverage: Number(form.coverage) > 0 && Number(form.coverage) <= 100 ? '' : 'Coverage must be between 1 and 100.',
      amount: Number(form.amount) > 0 ? '' : 'Award value must be positive.',
      criteria: form.criteria.trim() ? '' : 'Eligibility criteria are required.',
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    const scholarship: Scholarship = {
      id: `sch-x${extra.length + 1}`,
      name: form.name.trim(),
      type: form.type as Scholarship['type'],
      coveragePercent: Number(form.coverage),
      amount: Number(form.amount),
      criteria: form.criteria.trim(),
      status: 'active',
      applications: [],
    }
    setExtra((current) => [scholarship, ...current])
    setCreateOpen(false)
    toast.success({ title: 'Scholarship created', message: `${scholarship.name} is open for mock applications.` })
  }

  const decide = (row: ApplicationRow, status: ApplicationRow['status']) => {
    setOverrides((current) => ({ ...current, [row.id]: status }))
    toast.success({ title: `Application ${status}`, message: `${row.studentName}'s application was marked ${status}.` })
  }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Active programs" value={scholarships.filter((item) => item.status === 'active').length} icon={Award} />
      <StatCard label="Applications" value={applications.length} icon={Trophy} tone="info" />
      <StatCard label="Awards" value={awarded.length} icon={CircleDollarSign} tone="success" />
      <StatCard label="Committed" value={`$${data.totals.committed.toLocaleString()}`} icon={Percent} tone="warning" />
    </div>
    <Panel flush><div className="ec-card__body">
      <DataTable columns={columns} rows={applications} rowKey={(row) => row.id} searchPlaceholder="Search students, programs…"
        filters={[
          { key: 'type', label: 'All types', options: scholarshipTypes.map((value) => ({ value, label: value })), match: (row, value) => row.scholarshipType === value },
          { key: 'status', label: 'All statuses', options: [{ value: 'applied', label: 'Applied' }, { value: 'shortlisted', label: 'Shortlisted' }, { value: 'awarded', label: 'Awarded' }, { value: 'rejected', label: 'Rejected' }], match: (row, value) => statusOf(row) === value },
        ]}
        emptyTitle="No applications" emptyMessage="Applications matching these filters will appear here."
        onRowClick={setSelected}
        actions={(row) => <><button className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => setSelected(row)}>View</button>{statusOf(row) !== 'awarded' && <RoleGate roles={financeRoles}><button className="ec-btn ec-btn--sm" onClick={() => decide(row, 'awarded')}>Award</button></RoleGate>}</>} />
    </div></Panel>

    <Modal open={createOpen} title="Create scholarship" description="Opens a new mock scholarship program for eligible students." onClose={() => setCreateOpen(false)} footer={<><button className="ec-btn ec-btn--ghost" onClick={() => setCreateOpen(false)}>Cancel</button><button className="ec-btn" onClick={save}>Create scholarship</button></>}>
      <FormGrid>
        <TextField label="Program name" name="scholarship-name" value={form.name} onChange={(name) => setForm((prev) => ({ ...prev, name }))} error={errors.name} required />
        <SelectField label="Type" name="scholarship-type" value={form.type} onChange={(type) => setForm((prev) => ({ ...prev, type }))} options={scholarshipTypes.map((value) => ({ value, label: value }))} />
        <TextField label="Fee coverage %" name="scholarship-coverage" type="number" value={form.coverage} onChange={(coverage) => setForm((prev) => ({ ...prev, coverage }))} error={errors.coverage} required />
        <TextField label="Award value" name="scholarship-amount" type="number" value={form.amount} onChange={(amount) => setForm((prev) => ({ ...prev, amount }))} error={errors.amount} required />
        <TextAreaField label="Eligibility criteria" name="scholarship-criteria" value={form.criteria} onChange={(criteria) => setForm((prev) => ({ ...prev, criteria }))} error={errors.criteria} required />
      </FormGrid>
    </Modal>

    <Modal open={Boolean(selected)} title={selected?.studentName ?? 'Application'} description={selected?.scholarshipName} onClose={() => setSelected(null)} footer={<button className="ec-btn" onClick={() => setSelected(null)}>Close</button>}>
      {selected && <div className="ec-stack">
        <div className="ec-row"><Badge tone={typeTone[selected.scholarshipType]}>{selected.scholarshipType}</Badge><Badge tone={statusTone[statusOf(selected)]}>{statusOf(selected)}</Badge></div>
        <ProgressBar value={selected.score} tone={selected.score >= 80 ? 'success' : selected.score >= 65 ? 'primary' : 'warning'} />
        <p className="ec-small ec-muted">Eligibility score: {selected.score}%. Award coverage: {selected.coveragePercent}% (${selected.amount.toLocaleString()}).</p>
      </div>}
    </Modal>
  </div>
}

