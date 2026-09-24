import { useState } from 'react'
import { CalendarRange, CheckCircle2, Hourglass, XCircle } from 'lucide-react'
import { Badge, PageHeader, Panel } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { Modal } from '../../components/ui/Modal'
import { FormGrid, SelectField, TextAreaField } from '../../components/ui/FormField'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { RoleGate } from '../../components/ui/RoleGate'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import { daysAhead, isoDate, TODAY } from '../../mocks/seed'
import type { LeaveRequest } from '../../mocks/types'
import { useAppSelector } from '../../store'
import type { UserRole } from '../../store/authSlice'

const staffRoles: UserRole[] = ['super_admin', 'principal', 'teacher']
const approverRoles: UserRole[] = ['super_admin', 'principal']
const typeTone = { sick: 'danger', casual: 'info', annual: 'warning', maternity: 'neutral' } as const
const statusTone = { pending: 'warning', approved: 'success', rejected: 'danger' } as const

export function LeaveManagementPage() {
  const user = useAppSelector((state) => state.auth.user)
  const [overrides, setOverrides] = useState<Record<string, LeaveRequest['status']>>({})
  const [extra, setExtra] = useState<LeaveRequest[]>([])
  const [applyOpen, setApplyOpen] = useState(false)
  const [form, setForm] = useState({ type: 'casual', days: '3', reason: '' })
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['leave'], mockApi.leaveBoard)

  const header = <PageHeader eyebrow="Operations · leave" title="Leave management" subtitle="Apply, approve and audit staff and student leave in one queue." actions={<>
    <RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Leave register')}>Export</button></RoleGate>
    <RoleGate roles={staffRoles}><button type="button" className="ec-btn" onClick={() => { setForm({ type: 'casual', days: '3', reason: '' }); setApplyOpen(true) }}>Apply leave</button></RoleGate>
  </>} />

  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={320} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const rows = [...extra, ...data.requests]
  const statusOf = (request: LeaveRequest) => overrides[request.id] ?? request.status
  const pending = rows.filter((request) => statusOf(request) === 'pending')
  const approved = rows.filter((request) => statusOf(request) === 'approved')
  const rejected = rows.filter((request) => statusOf(request) === 'rejected')
  const pendingDays = pending.reduce((sum, request) => sum + request.days, 0)

  const decide = (request: LeaveRequest, decision: 'approved' | 'rejected') => {
    setOverrides((prev) => ({ ...prev, [request.id]: decision }))
    toast.success({ title: `Leave ${decision}`, message: `${nameOf(request.applicantId)}'s ${request.type} leave was ${decision}.` })
  }

  const columns: Array<DataTableColumn<(typeof rows)[number]>> = [
    { key: 'applicant', header: 'Applicant', render: (row) => <div className="ec-table__primary"><strong>{nameOf(row.applicantId)}</strong><span>{row.applicantRole}</span></div>, searchValue: (row) => `${nameOf(row.applicantId)} ${row.applicantRole}` },
    { key: 'type', header: 'Type', render: (row) => <Badge tone={typeTone[row.type]}>{row.type}</Badge> },
    { key: 'range', header: 'From – To', render: (row) => `${row.from} → ${row.to}`, searchValue: (row) => `${row.from} ${row.to}` },
    { key: 'days', header: 'Days', align: 'right', render: (row) => row.days, sortValue: (row) => row.days },
    { key: 'reason', header: 'Reason', render: (row) => <span className="ec-small">{row.reason}</span>, searchValue: (row) => row.reason },
    { key: 'applied', header: 'Applied', render: (row) => row.appliedOn, sortValue: (row) => row.appliedOn },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={statusTone[statusOf(row)]} dot>{statusOf(row)}</Badge> },
  ]

  const applyLeave = () => {
    const days = Number(form.days) || 1
    if (!form.reason.trim()) { toast.error({ title: 'Reason required', message: 'Leave requests need a short reason.' }); return }
    const request: LeaveRequest = {
      id: `leave-x${extra.length + 1}`, applicantId: user?.id ?? 'usr-student',
      applicantRole: user?.role === 'student' ? 'student' : 'teacher',
      type: form.type as LeaveRequest['type'], from: isoDate(TODAY), to: daysAhead(days - 1), days,
      reason: form.reason.trim(), status: 'pending', approverId: null, appliedOn: isoDate(TODAY),
    }
    setExtra((list) => [request, ...list])
    setApplyOpen(false)
    toast.success({ title: 'Leave requested', message: 'Your request is queued for the approver (mock).' })
  }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Pending" value={pending.length} icon={Hourglass} tone={pending.length > 0 ? 'warning' : 'success'} hint={`${pendingDays} days awaiting decision`} />
      <StatCard label="Approved" value={approved.length} icon={CheckCircle2} tone="success" hint="This term" />
      <StatCard label="Rejected" value={rejected.length} icon={XCircle} tone="danger" hint="Declined requests" />
      <StatCard label="Requests" value={rows.length} icon={CalendarRange} tone="info" hint="All time in demo data" />
    </div>
    <Panel flush>
      <div className="ec-card__body">
        <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} searchPlaceholder="Search applicants, reasons…"
          filters={[
            { key: 'status', label: 'All statuses', options: [{ value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }], match: (row, value) => statusOf(row) === value },
            { key: 'type', label: 'All types', options: [{ value: 'sick', label: 'Sick' }, { value: 'casual', label: 'Casual' }, { value: 'annual', label: 'Annual' }, { value: 'maternity', label: 'Maternity' }], match: (row, value) => row.type === value },
          ]}
          emptyTitle="No leave requests" emptyMessage="The leave queue is empty for this demo state."
          actions={(row) => statusOf(row) === 'pending'
            ? <RoleGate roles={approverRoles}>
                <button type="button" className="ec-btn ec-btn--sm" onClick={() => decide(row, 'approved')}>Approve</button>
                <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => decide(row, 'rejected')}>Reject</button>
              </RoleGate>
            : <span className="ec-small ec-muted">Decided</span>} />
      </div>
    </Panel>

    <Modal open={applyOpen} title="Apply for leave" description="Filed against your account and routed to the approver queue." onClose={() => setApplyOpen(false)}
      footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setApplyOpen(false)}>Cancel</button><button type="button" className="ec-btn" onClick={applyLeave}>Submit request</button></>}>
      <FormGrid columns={2}>
        <SelectField label="Leave type" name="type" value={form.type} onChange={(value) => setForm((prev) => ({ ...prev, type: value }))} options={[{ value: 'casual', label: 'Casual' }, { value: 'sick', label: 'Sick' }, { value: 'annual', label: 'Annual' }, { value: 'maternity', label: 'Maternity' }]} />
        <SelectField label="Duration" name="days" value={form.days} onChange={(value) => setForm((prev) => ({ ...prev, days: value }))} options={[1, 2, 3, 5, 7, 10].map((days) => ({ value: String(days), label: `${days} day${days > 1 ? 's' : ''}` }))} />
        <TextAreaField label="Reason" name="reason" value={form.reason} onChange={(value) => setForm((prev) => ({ ...prev, reason: value }))} hint="Visible to approvers only" />
      </FormGrid>
    </Modal>
  </div>
}

