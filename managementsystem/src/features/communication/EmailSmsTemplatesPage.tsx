import { useState } from 'react'
import { Copy, Eye, Mail, MessageSquareText, Plus, Send, Tags } from 'lucide-react'
import { Badge, PageHeader, Panel } from '../../components/ui/primitives'
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
import type { MessageTemplate } from '../../mocks/types'
import type { UserRole } from '../../store/authSlice'

const adminRoles: UserRole[] = ['super_admin', 'principal']

export function EmailSmsTemplatesPage() {
  const [rows, setRows] = useState<MessageTemplate[]>([])
  const [editing, setEditing] = useState<MessageTemplate | null>(null)
  const [sending, setSending] = useState<MessageTemplate | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const toast = useToast()
  const query = useMockQuery(['message-templates'], mockApi.templateBoard)
  const newTemplate = (): MessageTemplate => ({ id: `tpl-local-${Date.now()}`, name: '', channel: 'email', category: 'General', subject: '', body: '', updatedAt: '', usageCount: 0 })
  const header = <PageHeader eyebrow="Communication · templates" title="Email & SMS templates" subtitle="Reusable channel-safe messages with variable placeholders." actions={<RoleGate roles={adminRoles}><button className="ec-btn" onClick={() => setEditing(newTemplate())}><Plus size={14} /> New template</button></RoleGate>} />
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={3} /></div>
  if (query.isError || !query.data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>
  const editedIds = new Set(rows.map((row) => row.id))
  const all = [...rows, ...query.data.templates.filter((row) => !editedIds.has(row.id))]
  const columns: Array<DataTableColumn<MessageTemplate>> = [
    { key: 'name', header: 'Template', render: (row) => <div className="ec-table__primary"><strong>{row.name}</strong><span>{row.subject}</span></div>, searchValue: (row) => `${row.name} ${row.subject} ${row.body}` },
    { key: 'channel', header: 'Channel', render: (row) => <Badge tone={row.channel === 'email' ? 'info' : 'success'}>{row.channel.toUpperCase()}</Badge> },
    { key: 'category', header: 'Category', render: (row) => <Badge>{row.category}</Badge> },
    { key: 'usage', header: 'Usage', align: 'right', render: (row) => row.usageCount.toLocaleString(), sortValue: (row) => row.usageCount },
    { key: 'updated', header: 'Updated', render: (row) => row.updatedAt || 'Not saved', sortValue: (row) => row.updatedAt },
  ]
  const save = () => {
    if (!editing) return
    const next = { ...editing, name: editing.name.trim(), subject: editing.subject.trim(), body: editing.body.trim() }
    const nextErrors = { name: next.name ? '' : 'Template name is required.', subject: next.channel === 'email' && !next.subject ? 'Email subject is required.' : '', body: next.body.length >= 10 ? '' : 'Body must contain at least 10 characters.' }
    setErrors(nextErrors); if (Object.values(nextErrors).some(Boolean)) return
    const saved = { ...next, updatedAt: new Date().toISOString().slice(0, 10) }
    setRows((current) => current.some((row) => row.id === saved.id) ? current.map((row) => row.id === saved.id ? saved : row) : [saved, ...current]); setEditing(null)
    toast.success({ title: 'Template saved', message: 'The reusable message is ready in this mock session.' })
  }
  const variables = (template: MessageTemplate) => [...new Set([...template.subject.matchAll(/{{\s*([\w]+)\s*}}/g), ...template.body.matchAll(/{{\s*([\w]+)\s*}}/g)].map((match) => match[1]))]
  return <div className="ec-page">{header}
    <div className="ec-grid ec-grid--3" style={{ marginBottom: 'var(--ec-space-4)' }}><StatCard label="Total templates" value={all.length} icon={Copy} /><StatCard label="Email" value={all.filter((row) => row.channel === 'email').length} icon={Mail} tone="info" /><StatCard label="SMS" value={all.filter((row) => row.channel === 'sms').length} icon={MessageSquareText} tone="success" /></div>
    <Panel flush><div className="ec-card__body">
      <DataTable columns={columns} rows={all} rowKey={(row) => row.id} pageSize={8} actionsHeader="Actions" actions={(row) => <RoleGate roles={adminRoles}><button className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => setEditing(row)}>Edit</button><button className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => setSending(row)}><Eye size={12} /> Preview</button></RoleGate>} />
    </div></Panel>
    <Modal open={editing !== null} title={editing?.id.startsWith('tpl-local-') ? 'Create template' : 'Edit template'} description="Use double braces for personalization variables." onClose={() => setEditing(null)} size="wide" footer={<><button className="ec-btn ec-btn--ghost" onClick={() => setEditing(null)}>Cancel</button><button className="ec-btn" onClick={save}>Save template</button></>}>
      {editing && <div className="ec-stack">
        <FormGrid>
          <TextField label="Name" name="template-name" value={editing.name} onChange={(name) => setEditing({ ...editing, name })} error={errors.name} required />
          <SelectField label="Channel" name="template-channel" value={editing.channel} onChange={(channel) => setEditing({ ...editing, channel: channel as MessageTemplate['channel'] })} options={[{ value: 'email', label: 'Email' }, { value: 'sms', label: 'SMS' }]} />
          <TextField label="Category" name="template-category" value={editing.category} onChange={(category) => setEditing({ ...editing, category })} required />
          <TextField label="Subject" name="template-subject" value={editing.subject} onChange={(subject) => setEditing({ ...editing, subject })} error={errors.subject} required={editing.channel === 'email'} hint={editing.channel === 'sms' ? 'SMS uses the body as the complete message.' : undefined} />
        </FormGrid>
        <TextAreaField label="Body" name="template-body" value={editing.body} onChange={(body) => setEditing({ ...editing, body })} rows={10} error={errors.body} required />
      </div>}
    </Modal>
    <Modal open={sending !== null} title="Template preview" description="No external message is sent in mock mode." onClose={() => setSending(null)} footer={<><button className="ec-btn ec-btn--ghost" onClick={() => setSending(null)}>Cancel</button><button className="ec-btn" onClick={() => { toast.success({ title: 'Mock send complete', message: `${sending?.name} was processed for a sample audience.` }); setSending(null) }}><Send size={13} /> Send mock message</button></>}>
      {sending && <div className="ec-stack">
        <div><Badge tone={sending.channel === 'email' ? 'info' : 'success'}>{sending.channel.toUpperCase()}</Badge><h3 style={{ marginBottom: 0 }}>{sending.subject}</h3></div>
        <div className="ec-card"><div className="ec-card__body"><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{sending.body}</pre></div></div>
        <div><strong className="ec-small"><Tags size={13} /> Variables</strong><p className="ec-muted ec-small">{variables(sending).join(', ') || 'No variables in this template'}</p></div>
      </div>}
    </Modal>
  </div>
}
