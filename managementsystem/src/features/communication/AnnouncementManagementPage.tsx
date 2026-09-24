import { useState } from 'react'
import { BellRing, CheckCircle2, Clock3, Pin, Send } from 'lucide-react'
import { Badge, PageHeader, Panel, Tabs } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { Modal } from '../../components/ui/Modal'
import { CheckboxField, FormField, FormGrid, SelectField, TextAreaField, TextField } from '../../components/ui/FormField'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { RoleGate } from '../../components/ui/RoleGate'
import { useToast } from '../../components/ui/Toast'
import { useMockQuery } from '../../hooks/useMockQuery'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import { isoDateTime, TODAY } from '../../mocks/seed'
import type { Announcement } from '../../mocks/types'
import type { UserRole } from '../../store/authSlice'

const editorRoles: UserRole[] = ['super_admin', 'principal']
const audiences = [{ value: 'all', label: 'Everyone' }, { value: 'students', label: 'Students' }, { value: 'parents', label: 'Parents' }, { value: 'teachers', label: 'Teachers' }, { value: 'staff', label: 'Staff' }]
const priorities = [{ value: 'low', label: 'Low' }, { value: 'normal', label: 'Normal' }, { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' }]
const statusTone = (status: Announcement['status']) => status === 'published' ? 'success' : status === 'scheduled' ? 'info' : 'neutral' as const

export function AnnouncementManagementPage() {
  const [tab, setTab] = useState('all')
  const [open, setOpen] = useState(false)
  const [local, setLocal] = useState<Announcement[]>([])
  const [form, setForm] = useState({ title: '', body: '', audience: 'all', priority: 'normal', channels: ['app'], status: 'draft' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const toast = useToast()
  const query = useMockQuery(['announcements'], mockApi.announcementBoard)
  const header = <PageHeader eyebrow="Communication · announcements" title="Announcement center" subtitle="Create, schedule and publish school-wide communications." actions={<RoleGate roles={editorRoles}><button className="ec-btn" onClick={() => setOpen(true)}><Send size={14} /> New announcement</button></RoleGate>} />
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /></div>
  if (query.isError || !query.data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>
  const rows = [...local, ...query.data.announcements]
  const counts = { published: rows.filter((row) => row.status === 'published').length, scheduled: rows.filter((row) => row.status === 'scheduled').length, pinned: rows.filter((row) => row.pinned).length }
  const visible = tab === 'all' ? rows : rows.filter((row) => row.status === tab)
  const columns: Array<DataTableColumn<Announcement>> = [
    { key: 'title', header: 'Announcement', render: (row) => <div className="ec-table__primary"><strong>{row.pinned && <Pin size={12} />} {row.title}</strong><span>{row.body}</span></div>, searchValue: (row) => `${row.title} ${row.body}` },
    { key: 'audience', header: 'Audience', render: (row) => <Badge>{row.audience}</Badge> },
    { key: 'author', header: 'Author', render: (row) => nameOf(row.authorId), searchValue: (row) => nameOf(row.authorId) },
    { key: 'channels', header: 'Channels', render: (row) => row.channels.join(', ') },
    { key: 'priority', header: 'Priority', render: (row) => <Badge tone={row.priority === 'urgent' ? 'danger' : row.priority === 'high' ? 'warning' : 'neutral'}>{row.priority}</Badge> },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
    { key: 'published', header: 'Publish time', render: (row) => row.publishedAt, sortValue: (row) => row.publishedAt },
  ]
  const save = (publish: boolean) => {
    const next = { ...form, title: form.title.trim(), body: form.body.trim() }
    const nextErrors = { title: next.title.length >= 5 ? '' : 'Use at least 5 characters.', body: next.body.length >= 20 ? '' : 'Use at least 20 characters.', channels: next.channels.length ? '' : 'Select at least one channel.' }
    setErrors(nextErrors); if (Object.values(nextErrors).some(Boolean)) return
    const item: Announcement = { id: `ann-local-${Date.now()}`, title: next.title, body: next.body, audience: next.audience as Announcement['audience'], authorId: 'usr-principal', publishedAt: isoDateTime(TODAY), priority: next.priority as Announcement['priority'], channels: next.channels as Announcement['channels'], status: publish ? 'published' : form.status === 'scheduled' ? 'scheduled' : 'draft', pinned: false }
    setLocal((current) => [item, ...current]); setOpen(false); setForm({ title: '', body: '', audience: 'all', priority: 'normal', channels: ['app'], status: 'draft' })
    toast.success({ title: publish ? 'Announcement published' : 'Announcement saved', message: 'The change is local to this mock session.' })
  }
  return <div className="ec-page">{header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}><StatCard label="Published" value={counts.published} icon={CheckCircle2} tone="success" /><StatCard label="Scheduled" value={counts.scheduled} icon={Clock3} tone="info" /><StatCard label="Pinned" value={counts.pinned} icon={Pin} tone="warning" /><StatCard label="Total" value={rows.length} icon={BellRing} /></div>
    <Panel flush><div className="ec-card__body">
      <Tabs tabs={[{ id: 'all', label: `All (${rows.length})` }, { id: 'published', label: `Published (${counts.published})` }, { id: 'scheduled', label: `Scheduled (${counts.scheduled})` }, { id: 'draft', label: `Drafts (${rows.filter((row) => row.status === 'draft').length})` }]} active={tab} onChange={setTab} />
      <DataTable columns={columns} rows={visible} rowKey={(row) => row.id} pageSize={8} emptyTitle="No announcements" emptyMessage="No announcements match this status." />
    </div></Panel>
    <Modal open={open} title="New announcement" description="Content is delivered only to mock recipients in this prototype." onClose={() => setOpen(false)} size="wide" footer={<><button className="ec-btn ec-btn--ghost" onClick={() => setOpen(false)}>Cancel</button><button className="ec-btn" onClick={() => save(false)}>Save draft</button><button className="ec-btn" onClick={() => save(true)}>Publish now</button></>}>
      <div className="ec-stack">
        <FormGrid>
          <TextField label="Title" name="announcement-title" value={form.title} onChange={(title) => setForm((current) => ({ ...current, title }))} error={errors.title} required />
          <SelectField label="Audience" name="announcement-audience" value={form.audience} onChange={(audience) => setForm((current) => ({ ...current, audience }))} options={audiences} />
          <SelectField label="Priority" name="announcement-priority" value={form.priority} onChange={(priority) => setForm((current) => ({ ...current, priority }))} options={priorities} />
          <SelectField label="Initial state" name="announcement-state" value={form.status} onChange={(status) => setForm((current) => ({ ...current, status }))} options={[{ value: 'draft', label: 'Draft' }, { value: 'scheduled', label: 'Scheduled' }]} />
        </FormGrid>
        <TextAreaField label="Message" name="announcement-body" value={form.body} onChange={(body) => setForm((current) => ({ ...current, body }))} rows={7} error={errors.body} required />
        <FormField label="Delivery channels" error={errors.channels}><div className="ec-row">
          {(['app', 'email', 'sms'] as const).map((channel) => <CheckboxField key={channel} label={channel.toUpperCase()} checked={form.channels.includes(channel)} onChange={(checked) => setForm((current) => ({ ...current, channels: checked ? [...current.channels, channel] : current.channels.filter((item) => item !== channel) }))} />)}
        </div></FormField>
      </div>
    </Modal>
  </div>
}
