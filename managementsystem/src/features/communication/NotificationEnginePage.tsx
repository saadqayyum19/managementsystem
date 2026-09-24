import { useState } from 'react'
import { BellRing, CheckCircle2, Clock3, RefreshCw, Send, TriangleAlert } from 'lucide-react'
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
import { mockApi } from '../../services/mockApi'
import { isoDateTime, TODAY } from '../../mocks/seed'
import type { NotificationItem } from '../../mocks/types'
import type { UserRole } from '../../store/authSlice'

const adminRoles: UserRole[] = ['super_admin', 'principal']
const statusTone = (status: NotificationItem['status']) => status === 'sent' ? 'success' : status === 'failed' ? 'danger' : status === 'scheduled' ? 'info' : 'warning' as const

export function NotificationEnginePage() {
  const [rows, setRows] = useState<NotificationItem[]>([])
  const [retried, setRetried] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', audience: 'all', channel: 'in_app', recipients: '1', templateId: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const toast = useToast()
  const query = useMockQuery(['notifications'], mockApi.notificationBoard)
  const header = <PageHeader eyebrow="Communication · notification engine" title="Notification engine" subtitle="Monitor mock campaigns, delivery channels and audience engagement." actions={<RoleGate roles={adminRoles}><button className="ec-btn" onClick={() => setOpen(true)}><Send size={14} /> New notification</button></RoleGate>} />
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /></div>
  if (query.isError || !query.data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>
  const all = [...rows, ...query.data.notifications.map((row) => retried.includes(row.id) ? { ...row, status: 'sent' as const } : row)]
  const sent = all.filter((row) => row.status === 'sent')
  const delivered = sent.reduce((sum, row) => sum + row.recipients, 0)
  const opened = sent.reduce((sum, row) => sum + row.opened, 0)
  const columns: Array<DataTableColumn<NotificationItem>> = [
    { key: 'title', header: 'Notification', render: (row) => <div className="ec-table__primary"><strong>{row.title}</strong><span>{row.body}</span></div>, searchValue: (row) => `${row.title} ${row.body}` },
    { key: 'audience', header: 'Audience', render: (row) => <Badge>{row.audience}</Badge> },
    { key: 'channel', header: 'Channel', render: (row) => <Badge tone={row.channel === 'email' ? 'info' : row.channel === 'sms' ? 'success' : 'neutral'}>{row.channel.replace('_', ' ').toUpperCase()}</Badge> },
    { key: 'recipients', header: 'Recipients', align: 'right', render: (row) => row.recipients.toLocaleString(), sortValue: (row) => row.recipients },
    { key: 'engagement', header: 'Opened', render: (row) => <div style={{ minWidth: 110 }}><span className="ec-small">{row.recipients ? Math.round(row.opened / row.recipients * 100) : 0}%</span><ProgressBar value={row.opened} max={row.recipients || 1} tone="success" /></div> },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
    { key: 'created', header: 'Created', render: (row) => row.createdAt, sortValue: (row) => row.createdAt },
  ]
  const create = () => {
    const recipients = Number(form.recipients)
    const nextErrors = { title: form.title.trim() ? '' : 'Title is required.', body: form.body.trim().length >= 10 ? '' : 'Body must contain at least 10 characters.', recipients: Number.isInteger(recipients) && recipients > 0 && recipients <= 10000 ? '' : 'Enter 1–10,000 mock recipients.' }
    setErrors(nextErrors); if (Object.values(nextErrors).some(Boolean)) return
    const item: NotificationItem = { id: `ntf-local-${Date.now()}`, title: form.title.trim(), body: form.body.trim(), audience: form.audience, channel: form.channel as NotificationItem['channel'], createdAt: isoDateTime(TODAY), status: 'sent', recipients, opened: 0, templateId: form.templateId || null }
    setRows((current) => [item, ...current]); setOpen(false); setForm({ title: '', body: '', audience: 'all', channel: 'in_app', recipients: '1', templateId: '' })
    toast.success({ title: 'Notification dispatched', message: `${recipients} mock recipients queued through ${form.channel}.` })
  }
  const retry = (row: NotificationItem) => {
    setRetried((current) => current.includes(row.id) ? current : [...current, row.id])
    toast.success({ title: 'Retry simulated', message: 'The failed campaign was marked sent for this session.' })
  }
  return <div className="ec-page">{header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}><StatCard label="Campaigns" value={all.length} icon={BellRing} /><StatCard label="Delivered" value={delivered.toLocaleString()} icon={CheckCircle2} tone="success" /><StatCard label="Open rate" value={`${delivered ? Math.round(opened / delivered * 100) : 0}%`} icon={Clock3} tone="info" /><StatCard label="Failed" value={all.filter((row) => row.status === 'failed').length} icon={TriangleAlert} tone="danger" /></div>
    <Panel flush><div className="ec-card__body">
      <DataTable columns={columns} rows={all} rowKey={(row) => row.id} pageSize={8} filters={[{ key: 'status', label: 'All statuses', options: [{ value: 'sent', label: 'Sent' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'queued', label: 'Queued' }, { value: 'failed', label: 'Failed' }], match: (row, value) => row.status === value }]} actionsHeader="Actions" actions={(row) => row.status === 'failed' ? <RoleGate roles={adminRoles}><button className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => retry(row)}><RefreshCw size={12} /> Retry</button></RoleGate> : undefined} />
    </div></Panel>
    <Modal open={open} title="Dispatch notification" description="This action updates mock campaign state only." onClose={() => setOpen(false)} size="wide" footer={<><button className="ec-btn ec-btn--ghost" onClick={() => setOpen(false)}>Cancel</button><button className="ec-btn" onClick={create}>Dispatch mock</button></>}>
      <div className="ec-stack">
        <FormGrid>
          <TextField label="Title" name="notification-title" value={form.title} onChange={(title) => setForm((current) => ({ ...current, title }))} error={errors.title} required />
          <SelectField label="Audience" name="notification-audience" value={form.audience} onChange={(audience) => setForm((current) => ({ ...current, audience }))} options={[{ value: 'all', label: 'Everyone' }, { value: 'students', label: 'Students' }, { value: 'parents', label: 'Parents' }, { value: 'staff', label: 'Staff' }]} />
          <SelectField label="Channel" name="notification-channel" value={form.channel} onChange={(channel) => setForm((current) => ({ ...current, channel }))} options={[{ value: 'in_app', label: 'In-app' }, { value: 'email', label: 'Email' }, { value: 'sms', label: 'SMS' }, { value: 'push', label: 'Push' }]} />
          <TextField label="Mock recipients" name="notification-recipients" type="number" value={form.recipients} onChange={(recipients) => setForm((current) => ({ ...current, recipients }))} error={errors.recipients} required />
          <SelectField label="Template (optional)" name="notification-template" value={form.templateId} onChange={(templateId) => setForm((current) => ({ ...current, templateId }))} placeholder="No template" options={query.data.templates.map((row) => ({ value: row.id, label: row.name }))} />
        </FormGrid>
        <TextAreaField label="Message" name="notification-body" value={form.body} onChange={(body) => setForm((current) => ({ ...current, body }))} rows={7} error={errors.body} required />
      </div>
    </Modal>
  </div>
}
