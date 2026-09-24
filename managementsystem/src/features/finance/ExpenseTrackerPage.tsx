import { useState } from 'react'
import { CircleDollarSign, PieChart as PieChartIcon, Receipt, TriangleAlert } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, PageHeader, Panel } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { Modal } from '../../components/ui/Modal'
import { FormGrid, SelectField, TextAreaField, TextField } from '../../components/ui/FormField'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { ChartCard, ChartTooltip, chartAxisProps, chartColors, chartGridProps } from '../../components/ui/ChartCard'
import { RoleGate } from '../../components/ui/RoleGate'
import { useToast } from '../../components/ui/Toast'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import { isoDate, TODAY } from '../../mocks/seed'
import type { Expense } from '../../mocks/types'
import type { UserRole } from '../../store/authSlice'

const leadership: UserRole[] = ['super_admin', 'principal']
const categories: Expense['category'][] = ['maintenance', 'utilities', 'supplies', 'events', 'transport', 'it']

export function ExpenseTrackerPage() {
  const [open, setOpen] = useState(false)
  const [extra, setExtra] = useState<Expense[]>([])
  const [form, setForm] = useState({ description: '', amount: '', vendor: '', category: 'supplies' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const toast = useToast(); const { exportStub } = useExportStub()
  const query = useMockQuery(['expenses'], mockApi.expenseBoard)
  const header = <PageHeader eyebrow="Finance · expenses" title="Expense tracker" subtitle="Institutional spend, approvals and category analysis." actions={<RoleGate roles={leadership}><button className="ec-btn ec-btn--ghost" onClick={() => exportStub('Expense report')}>Export</button><button className="ec-btn" onClick={() => setOpen(true)}>Add expense</button></RoleGate>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={320} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>
  const rows = [...extra, ...data.expenses]
  const columns: Array<DataTableColumn<Expense>> = [
    { key: 'description', header: 'Expense', render: (row) => <div className="ec-table__primary"><strong>{row.description}</strong><span>{row.vendor} · {row.spentOn}</span></div>, searchValue: (row) => `${row.description} ${row.vendor}` },
    { key: 'category', header: 'Category', render: (row) => <Badge tone="info">{row.category}</Badge> },
    { key: 'amount', header: 'Amount', align: 'right', render: (row) => <strong>${row.amount.toLocaleString()}</strong>, sortValue: (row) => row.amount },
    { key: 'approver', header: 'Approver', render: (row) => nameOf(row.approvedBy), searchValue: (row) => nameOf(row.approvedBy) },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'approved' ? 'success' : row.status === 'pending' ? 'warning' : 'danger'} dot>{row.status}</Badge> },
  ]
  const save = () => {
    const amount = Number(form.amount)
    const next = { description: form.description.trim() ? '' : 'Description is required.', amount: amount > 0 ? '' : 'Amount must be positive.', vendor: form.vendor.trim() ? '' : 'Vendor is required.' }
    setErrors(next); if (Object.values(next).some(Boolean)) return
    setExtra((list) => [{ id: `exp-x${list.length + 1}`, category: form.category as Expense['category'], description: form.description.trim(), amount, spentOn: isoDate(TODAY), vendor: form.vendor.trim(), approvedBy: null, status: 'pending' }, ...list])
    setOpen(false); toast.success({ title: 'Expense submitted', message: `${form.description.trim()} is pending approval.` })
  }

  return <div className="ec-page">{header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}><StatCard label="Total spend" value={`$${rows.reduce((sum, row) => sum + row.amount, 0).toLocaleString()}`} icon={CircleDollarSign} /><StatCard label="Approved" value={`$${data.totals.approved.toLocaleString()}`} icon={Receipt} tone="success" /><StatCard label="Pending" value={rows.filter((row) => row.status === 'pending').length} icon={TriangleAlert} tone="warning" /><StatCard label="Categories" value={categories.length} icon={PieChartIcon} tone="info" /></div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}><ChartCard title="Spend by category" height={260} isEmpty={data.breakdown.length === 0}><BarChart data={data.breakdown}><CartesianGrid {...chartGridProps} /><XAxis dataKey="category" {...chartAxisProps} /><YAxis {...chartAxisProps} tickFormatter={(value) => `$${value / 1000}k`} /><Tooltip content={<ChartTooltip valueSuffix=" USD" />} /><Bar dataKey="amount" radius={[4, 4, 0, 0]}>{data.breakdown.map((_, index) => <Cell key={index} fill={Object.values(chartColors)[index % 6]} />)}</Bar></BarChart></ChartCard><ChartCard title="Category share" height={260} isEmpty={data.breakdown.length === 0}><PieChart><Pie data={data.breakdown} dataKey="amount" nameKey="category" innerRadius={55} outerRadius={90}>{data.breakdown.map((_, index) => <Cell key={index} fill={Object.values(chartColors)[index % 6]} />)}</Pie><Tooltip content={<ChartTooltip valueSuffix=" USD" />} /></PieChart></ChartCard></div>
    <Panel flush><div className="ec-card__body"><DataTable columns={columns} rows={rows} rowKey={(row) => row.id} searchPlaceholder="Search expenses, vendors…" filters={[{ key: 'category', label: 'All categories', options: categories.map((value) => ({ value, label: value })), match: (row, value) => row.category === value }, { key: 'status', label: 'All statuses', options: [{ value: 'approved', label: 'Approved' }, { value: 'pending', label: 'Pending' }, { value: 'rejected', label: 'Rejected' }], match: (row, value) => row.status === value }]} emptyTitle="No expenses" emptyMessage="No expense records match the current filters." /></div></Panel>
    <Modal open={open} title="Add expense" description="Submit a mock expense for approval." onClose={() => setOpen(false)} footer={<><button className="ec-btn ec-btn--ghost" onClick={() => setOpen(false)}>Cancel</button><button className="ec-btn" onClick={save}>Submit expense</button></>}><FormGrid><TextAreaField label="Description" name="expense-description" value={form.description} onChange={(description) => setForm((prev) => ({ ...prev, description }))} error={errors.description} required /><SelectField label="Category" name="expense-category" value={form.category} onChange={(category) => setForm((prev) => ({ ...prev, category }))} options={categories.map((value) => ({ value, label: value }))} /><TextField label="Amount" name="expense-amount" type="number" value={form.amount} onChange={(amount) => setForm((prev) => ({ ...prev, amount }))} error={errors.amount} required /><TextField label="Vendor" name="expense-vendor" value={form.vendor} onChange={(vendor) => setForm((prev) => ({ ...prev, vendor }))} error={errors.vendor} required /></FormGrid></Modal>
  </div>
}