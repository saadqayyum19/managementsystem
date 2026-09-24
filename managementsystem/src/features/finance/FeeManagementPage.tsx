import { useState } from 'react'
import { Banknote, CreditCard, ReceiptText, TrendingUp } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Line, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, PageHeader, Panel, ProgressBar } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { Modal } from '../../components/ui/Modal'
import { FormGrid, SelectField, TextField } from '../../components/ui/FormField'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { ChartCard, ChartTooltip, chartAxisProps, chartColors, chartGridProps } from '../../components/ui/ChartCard'
import { RoleGate } from '../../components/ui/RoleGate'
import { useToast } from '../../components/ui/Toast'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import type { UserRole } from '../../store/authSlice'

const financeRoles: UserRole[] = ['super_admin', 'principal']

export function FeeManagementPage() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ invoiceId: '', amount: '', method: 'upi' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [paid, setPaid] = useState<Record<string, number>>({})
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['fees'], mockApi.feeBoard)
  const header = <PageHeader eyebrow="Finance · fees" title="Fee management" subtitle="Invoices, collections, outstanding balances and payment history." actions={<><RoleGate roles={financeRoles}><button className="ec-btn ec-btn--ghost" onClick={() => exportStub('Fee ledger')}>Export</button></RoleGate><RoleGate roles={financeRoles}><button className="ec-btn" onClick={() => setOpen(true)}>Record payment</button></RoleGate></>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={320} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>
  const extraPaid = (invoiceId: string) => paid[invoiceId] ?? 0
  const due = (invoiceId: string) => Math.max(0, (data.ledger.find((row) => row.invoice.id === invoiceId)?.due ?? 0) - extraPaid(invoiceId))
  const columns: Array<DataTableColumn<(typeof data.ledger)[number]>> = [
    { key: 'invoice', header: 'Invoice', render: (row) => <div className="ec-table__primary"><strong>{row.invoice.invoiceNo}</strong><span>{row.invoice.term} · {row.invoice.issuedOn}</span></div> },
    { key: 'student', header: 'Student', render: (row) => <div className="ec-table__primary"><strong>{row.studentName}</strong><span>{row.className}</span></div>, searchValue: (row) => `${row.studentName} ${row.className}` },
    { key: 'billed', header: 'Billed', align: 'right', render: (row) => `$${row.billed.toLocaleString()}`, sortValue: (row) => row.billed },
    { key: 'paid', header: 'Paid', align: 'right', render: (row) => `$${Math.max(0, row.paid - extraPaid(row.invoice.id)).toLocaleString()}`, sortValue: (row) => row.paid - extraPaid(row.invoice.id) },
    { key: 'balance', header: 'Balance', render: (row) => <div><span className="ec-small">${due(row.invoice.id).toLocaleString()}</span><ProgressBar value={row.billed - due(row.invoice.id)} max={row.billed} tone={due(row.invoice.id) === 0 ? 'success' : 'warning'} /></div> },
    { key: 'status', header: 'Status', render: (row) => { const value = due(row.invoice.id) === 0 ? 'paid' : row.invoice.status; return <Badge tone={value === 'paid' ? 'success' : value === 'overdue' ? 'danger' : 'warning'} dot>{value}</Badge> } },
  ]
  const save = () => {
    const invoice = data.invoices.find((item) => item.id === form.invoiceId)
    const amount = Number(form.amount)
    const next = { invoiceId: invoice ? '' : 'Choose an outstanding invoice.', amount: amount > 0 && amount <= due(form.invoiceId) ? '' : 'Enter a valid amount within the balance.' }
    setErrors(next)
    if (Object.values(next).some(Boolean) || !invoice) return
    setPaid((current) => ({ ...current, [invoice.id]: extraPaid(invoice.id) + amount }))
    setOpen(false)
    toast.success({ title: 'Payment recorded', message: `$${amount.toLocaleString()} was applied to ${invoice.invoiceNo}.` })
  }

  return <div className="ec-page">{header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Billed" value={`$${data.totals.billed.toLocaleString()}`} icon={ReceiptText} />
      <StatCard label="Collected" value={`$${data.totals.collected.toLocaleString()}`} icon={Banknote} tone="success" hint={`${data.totals.collectionRate}% collection rate`} />
      <StatCard label="Outstanding" value={`$${data.totals.outstanding.toLocaleString()}`} icon={CreditCard} tone="warning" />
      <StatCard label="Collection rate" value={`${data.totals.collectionRate}%`} icon={TrendingUp} tone={data.totals.collectionRate >= 80 ? 'success' : 'danger'} />
    </div>
    <div style={{ marginBottom: 'var(--ec-space-4)' }}><ChartCard title="Collection performance" hint="Collected amount against monthly target" height={260} isEmpty={data.trend.length === 0} legend={[{ label: 'Collected', color: chartColors.primary }, { label: 'Target', color: chartColors.slate }]}>
      <AreaChart data={data.trend}><defs><linearGradient id="feeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.2} /><stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} /></linearGradient></defs><CartesianGrid {...chartGridProps} /><XAxis dataKey="month" {...chartAxisProps} /><YAxis {...chartAxisProps} tickFormatter={(value) => `$${value / 1000}k`} /><Tooltip content={<ChartTooltip valueSuffix=" USD" />} /><Area type="monotone" dataKey="collected" stroke={chartColors.primary} fill="url(#feeFill)" strokeWidth={2} /><Line type="monotone" dataKey="target" stroke={chartColors.slate} strokeDasharray="4 4" /></AreaChart>
    </ChartCard></div>
    <Panel flush><div className="ec-card__body"><DataTable columns={columns} rows={data.ledger} rowKey={(row) => row.invoice.id} searchPlaceholder="Search invoice, student, class…" filters={[{ key: 'status', label: 'All statuses', options: [{ value: 'paid', label: 'Paid' }, { value: 'partial', label: 'Partial' }, { value: 'overdue', label: 'Overdue' }, { value: 'waived', label: 'Waived' }], match: (row, value) => row.invoice.status === value }]} emptyTitle="No invoices" emptyMessage="No fee records match the selected filters." /></div></Panel>
    <Modal open={open} title="Record fee payment" description="Apply a payment to an existing mock invoice." onClose={() => setOpen(false)} footer={<><button className="ec-btn ec-btn--ghost" onClick={() => setOpen(false)}>Cancel</button><button className="ec-btn" onClick={save}>Record payment</button></>}>
      <FormGrid><SelectField label="Invoice" name="fee-invoice" value={form.invoiceId} onChange={(invoiceId) => setForm((prev) => ({ ...prev, invoiceId }))} options={data.defaulters.map((row) => ({ value: row.invoiceId, label: `${row.invoiceNo} · ${row.studentName}` }))} placeholder="Choose an invoice" error={errors.invoiceId} required /><TextField label="Amount" name="fee-amount" type="number" value={form.amount} onChange={(amount) => setForm((prev) => ({ ...prev, amount }))} error={errors.amount} hint={form.invoiceId ? `Balance: $${due(form.invoiceId).toLocaleString()}` : undefined} required /><SelectField label="Method" name="fee-method" value={form.method} onChange={(method) => setForm((prev) => ({ ...prev, method }))} options={[{ value: 'upi', label: 'UPI' }, { value: 'card', label: 'Card' }, { value: 'bank', label: 'Bank transfer' }, { value: 'cash', label: 'Cash' }]} /></FormGrid>
    </Modal>
  </div>
}