import { useState } from 'react'
import { CreditCard, IdCard, RefreshCw, ShieldOff } from 'lucide-react'
import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import { Avatar, Badge, PageHeader, Panel } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { ChartCard, ChartTooltip, chartColors } from '../../components/ui/ChartCard'
import { Modal } from '../../components/ui/Modal'
import { FormGrid, SelectField } from '../../components/ui/FormField'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import type { IdCardRecord } from '../../mocks/types'

const statusTone = { issued: 'success', pending: 'warning', revoked: 'danger' } as const

export function IdCardGeneratorPage() {
  const [overrides, setOverrides] = useState<Record<string, IdCardRecord['status']>>({})
  const [extra, setExtra] = useState<IdCardRecord[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ personId: '', template: 'student' })
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['system', 'id-cards'], mockApi.idCardBoard)
  const header = <PageHeader eyebrow="System · credentials" title="ID card generator" subtitle="Issue, preview and revoke student, staff and visitor credentials." actions={<button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('ID card batch')}>Export batch</button>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={340} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const records = [...extra, ...data.records].map((record) => ({ ...record, status: overrides[record.id] ?? record.status }))
  const issued = records.filter((record) => record.status === 'issued').length
  const pending = records.filter((record) => record.status === 'pending').length
  const revoked = records.filter((record) => record.status === 'revoked').length
  const statusSplit = (['issued', 'pending', 'revoked'] as const).map((status) => ({ status, count: records.filter((record) => record.status === status).length }))
  const columns: Array<DataTableColumn<IdCardRecord>> = [
    { key: 'serial', header: 'Serial', render: (row) => <strong>{row.serial}</strong>, searchValue: (row) => row.serial },
    { key: 'person', header: 'Cardholder', render: (row) => <div className="ec-row"><Avatar name={nameOf(row.personId)} /><div className="ec-table__primary"><strong>{nameOf(row.personId)}</strong><span>{row.personRole.replace('_', ' ')}</span></div></div>, searchValue: (row) => `${nameOf(row.personId)} ${row.personRole}` },
    { key: 'template', header: 'Template', render: (row) => <Badge tone={row.template === 'student' ? 'info' : row.template === 'staff' ? 'success' : 'neutral'}>{row.template}</Badge>, sortValue: (row) => row.template },
    { key: 'issued', header: 'Issued', render: (row) => row.issuedOn, sortValue: (row) => row.issuedOn },
    { key: 'valid', header: 'Valid till', render: (row) => row.validTill, sortValue: (row) => row.validTill },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={statusTone[row.status]} dot>{row.status}</Badge> },
  ]
  const previewPerson = form.personId || records[0]?.personId || ''
  const generate = () => {
    if (!form.personId) { toast.warning({ title: 'Pick a cardholder', message: 'Select the person this credential is issued to.' }); return }
    setExtra((list) => [{ id: `idc-x${list.length + 1}`, personId: form.personId, personRole: data.people.find((person) => person.id === form.personId)?.role ?? 'student', serial: `WBA-N-${900 + list.length}`, template: form.template as IdCardRecord['template'], issuedOn: '2026-02-24', validTill: '2027-02-24', status: 'pending' }, ...list])
    setOpen(false)
    toast.success({ title: 'Card queued', message: `${nameOf(form.personId)} is queued for printing.` })
  }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Issued" value={issued} icon={IdCard} tone="success" hint={`${records.length} total credentials`} />
      <StatCard label="Pending print" value={pending} icon={CreditCard} tone={pending > 0 ? 'warning' : 'success'} hint="Awaiting batch run" />
      <StatCard label="Revoked" value={revoked} icon={ShieldOff} tone={revoked > 0 ? 'danger' : 'success'} hint="Access disabled" />
      <StatCard label="Templates" value={3} icon={RefreshCw} tone="info" hint="Student · staff · visitor" />
    </div>
    <div className="ec-grid ec-grid--sidebar" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <div>
        <DataTable columns={columns} rows={records} rowKey={(row) => row.id} searchPlaceholder="Search serials, cardholders…" filters={[{ key: 'template', label: 'All templates', options: [{ value: 'student', label: 'Student' }, { value: 'staff', label: 'Staff' }, { value: 'visitor', label: 'Visitor' }], match: (row, value) => row.template === value }, { key: 'status', label: 'All statuses', options: (['issued', 'pending', 'revoked'] as const).map((status) => ({ value: status, label: status })), match: (row, value) => row.status === value }]} actions={(row) => <div className="ec-row" style={{ justifyContent: 'flex-end' }}><button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" disabled={row.status === 'issued'} onClick={() => { setOverrides((prev) => ({ ...prev, [row.id]: 'issued' })); toast.success({ title: 'Card issued', message: `${row.serial} is active for ${nameOf(row.personId)}.` }) }}>Issue</button><button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" disabled={row.status === 'revoked'} onClick={() => { setOverrides((prev) => ({ ...prev, [row.id]: 'revoked' })); toast.warning({ title: 'Card revoked', message: `${row.serial} can no longer be used at gates.` }) }}>Revoke</button></div>} emptyTitle="No credentials" emptyMessage="No ID cards match the current filters." />
      </div>
      <div className="ec-stack">
        <Panel title="Card preview" hint={`Template issued by ${data.institution.name}`}>
          <div className="ec-card" style={{ padding: 'var(--ec-space-4)' }}>
            <div className="ec-row"><span className="ec-avatar ec-avatar--md" aria-hidden>{data.institution.logoInitials}</span><div className="ec-table__primary"><strong>{data.institution.name}</strong><span>{data.institution.code} · {data.institution.academicYear}</span></div></div>
            <div style={{ height: 12 }} />
            <div className="ec-row"><Avatar name={nameOf(previewPerson)} /><div className="ec-table__primary"><strong>{nameOf(previewPerson)}</strong><span>{form.template} template</span></div></div>
            <div style={{ height: 12 }} />
            <div className="ec-row"><Badge tone="info">{data.institution.principalName}</Badge><Badge tone="neutral">Valid 1 year</Badge></div>
          </div>
        </Panel>
        <ChartCard title="Credential status" hint="All issued, pending and revoked cards" isEmpty={records.length === 0} legend={[{ label: 'Issued', color: chartColors.success }, { label: 'Pending', color: chartColors.warning }, { label: 'Revoked', color: chartColors.danger }]}>
          <PieChart>
            <Pie data={statusSplit} dataKey="count" nameKey="status" innerRadius={45} outerRadius={80}>{statusSplit.map((entry) => <Cell key={entry.status} fill={entry.status === 'issued' ? chartColors.success : entry.status === 'pending' ? chartColors.warning : chartColors.danger} />)}</Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ChartCard>
        <div className="ec-row"><span className="ec-spacer" /><button type="button" className="ec-btn" onClick={() => setOpen(true)}>Generate card</button></div>
      </div>
    </div>
    <Modal open={open} title="Generate ID card" description="Queues a credential for the mock print batch." onClose={() => setOpen(false)} footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="ec-btn" onClick={generate}>Queue card</button></>}>
      <FormGrid>
        <SelectField label="Cardholder" name="idcard-person" value={form.personId} onChange={(personId) => setForm((prev) => ({ ...prev, personId }))} options={data.people.map((person) => ({ value: person.id, label: `${person.name} · ${person.role.replace('_', ' ')}` }))} placeholder="Select a person" required />
        <SelectField label="Template" name="idcard-template" value={form.template} onChange={(template) => setForm((prev) => ({ ...prev, template }))} options={[{ value: 'student', label: 'Student' }, { value: 'staff', label: 'Staff' }, { value: 'visitor', label: 'Visitor' }]} />
      </FormGrid>
    </Modal>
  </div>
}

