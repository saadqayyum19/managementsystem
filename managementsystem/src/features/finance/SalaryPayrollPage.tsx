import { useState } from 'react'
import { Banknote, CircleDollarSign, Clock3, Users } from 'lucide-react'
import { Badge, PageHeader, Panel } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { Modal } from '../../components/ui/Modal'
import { KeyValue } from '../../components/ui/primitives'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { RoleGate } from '../../components/ui/RoleGate'
import { useToast } from '../../components/ui/Toast'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import type { SalarySlip } from '../../mocks/types'
import type { UserRole } from '../../store/authSlice'

const payrollRoles: UserRole[] = ['super_admin', 'principal']

export function SalaryPayrollPage() {
  const [selected, setSelected] = useState<SalarySlip | null>(null)
  const [statuses, setStatuses] = useState<Record<string, SalarySlip['status']>>({})
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['payroll'], mockApi.payrollBoard)
  const header = <PageHeader eyebrow="Finance · payroll" title="Salary & payroll" subtitle="Monthly salary slips, deductions and processing status." actions={<RoleGate roles={payrollRoles}><button className="ec-btn ec-btn--ghost" onClick={() => exportStub('Payroll register')}>Export</button></RoleGate>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={320} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>
  const statusOf = (row: SalarySlip) => statuses[row.id] ?? row.status
  const columns: Array<DataTableColumn<SalarySlip>> = [
    { key: 'staff', header: 'Employee', render: (row) => <div className="ec-table__primary"><strong>{nameOf(row.staffId)}</strong><span>{row.bankAccount}</span></div>, searchValue: (row) => nameOf(row.staffId) },
    { key: 'month', header: 'Month', render: (row) => row.month, sortValue: (row) => row.month },
    { key: 'basic', header: 'Basic', align: 'right', render: (row) => `$${row.basic.toLocaleString()}`, sortValue: (row) => row.basic },
    { key: 'allowance', header: 'Allowances', align: 'right', render: (row) => `$${row.allowances.toLocaleString()}`, sortValue: (row) => row.allowances },
    { key: 'deduction', header: 'Deductions', align: 'right', render: (row) => `$${row.deductions.toLocaleString()}`, sortValue: (row) => row.deductions },
    { key: 'net', header: 'Net pay', align: 'right', render: (row) => <strong>${row.netPay.toLocaleString()}</strong>, sortValue: (row) => row.netPay },
    { key: 'status', header: 'Status', render: (row) => { const value = statusOf(row); return <Badge tone={value === 'processed' ? 'success' : value === 'pending' ? 'warning' : 'danger'} dot>{value.replace('_', ' ')}</Badge> } },
  ]
  const process = (row: SalarySlip) => { setStatuses((current) => ({ ...current, [row.id]: 'processed' })); toast.success({ title: 'Salary processed', message: `${nameOf(row.staffId)}'s ${row.month} slip is ready.` }) }
  return <div className="ec-page">{header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Gross payroll" value={`$${data.totals.gross.toLocaleString()}`} icon={CircleDollarSign} />
      <StatCard label="Net payroll" value={`$${data.totals.net.toLocaleString()}`} icon={Banknote} tone="success" />
      <StatCard label="Deductions" value={`$${data.totals.deductions.toLocaleString()}`} icon={Clock3} tone="warning" />
      <StatCard label="Headcount" value={data.totals.headcount} icon={Users} tone="info" hint={`${data.totals.pending} pending`} />
    </div>
    <Panel flush><div className="ec-card__body"><DataTable columns={columns} rows={data.slips} rowKey={(row) => row.id} searchPlaceholder="Search employee, month, account…" filters={[{ key: 'month', label: 'All months', options: [...new Set(data.slips.map((row) => row.month))].map((value) => ({ value, label: value })), match: (row, value) => row.month === value }, { key: 'status', label: 'All statuses', options: [{ value: 'processed', label: 'Processed' }, { value: 'pending', label: 'Pending' }, { value: 'on_hold', label: 'On hold' }], match: (row, value) => statusOf(row) === value }]} emptyTitle="No salary slips" emptyMessage="No payroll records match this view." onRowClick={setSelected} actions={(row) => <><button className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => setSelected(row)}>View</button>{statusOf(row) !== 'processed' && <RoleGate roles={payrollRoles}><button className="ec-btn ec-btn--sm" onClick={() => process(row)}>Process</button></RoleGate>}</>} /></div></Panel>
    <Modal open={Boolean(selected)} title={selected ? `${nameOf(selected.staffId)} · ${selected.month}` : 'Salary slip'} onClose={() => setSelected(null)} footer={<button className="ec-btn" onClick={() => setSelected(null)}>Close</button>}>
      {selected && <KeyValue items={[{ label: 'Basic', value: `$${selected.basic.toLocaleString()}` }, { label: 'Allowances', value: `$${selected.allowances.toLocaleString()}` }, { label: 'Deductions', value: `$${selected.deductions.toLocaleString()}` }, { label: 'Net pay', value: `$${selected.netPay.toLocaleString()}` }, { label: 'Bank account', value: selected.bankAccount }, { label: 'Status', value: statusOf(selected).replace('_', ' ') }]} />}
    </Modal>
  </div>
}