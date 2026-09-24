import { useState } from 'react'
import { CalendarClock, CheckCircle2, Sparkles, Wallet } from 'lucide-react'
import { Badge, PageHeader, Panel } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { Modal } from '../../components/ui/Modal'
import { FormGrid, SelectField, TextField } from '../../components/ui/FormField'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { RoleGate } from '../../components/ui/RoleGate'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import { daysAhead } from '../../mocks/seed'
import type { SchoolEvent } from '../../mocks/types'
import type { UserRole } from '../../store/authSlice'

const staffRoles: UserRole[] = ['super_admin', 'principal', 'teacher']
const catTone = { sports: 'success', cultural: 'warning', academic: 'info', meeting: 'neutral' } as const
const statusTone = { upcoming: 'info', ongoing: 'warning', completed: 'success' } as const

export function EventManagementPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'academic', venue: '', budget: '500' })
  const [extra, setExtra] = useState<SchoolEvent[]>([])
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['events'], mockApi.eventBoard)

  const header = <PageHeader eyebrow="Operations · events" title="Event management" subtitle="Plan, budget and publish every campus event from a single calendar board." actions={<>
    <RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Event calendar')}>Export</button></RoleGate>
    <RoleGate roles={staffRoles}><button type="button" className="ec-btn" onClick={() => { setForm({ title: '', category: 'academic', venue: '', budget: '500' }); setCreateOpen(true) }}>New event</button></RoleGate>
  </>} />

  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={320} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const rows = [...extra, ...data.events]
  const upcoming = rows.filter((event) => event.status === 'upcoming')
  const ongoing = rows.filter((event) => event.status === 'ongoing')
  const budgetTotal = rows.reduce((sum, event) => sum + event.budget, 0)
  const participants = rows.reduce((sum, event) => sum + event.expectedParticipants, 0)

  const columns: Array<DataTableColumn<(typeof rows)[number]>> = [
    { key: 'title', header: 'Event', render: (row) => <div className="ec-table__primary"><strong>{row.title}</strong><span>{row.venue}</span></div>, searchValue: (row) => `${row.title} ${row.venue}` },
    { key: 'category', header: 'Category', render: (row) => <Badge tone={catTone[row.category]}>{row.category}</Badge> },
    { key: 'starts', header: 'Starts', render: (row) => row.startsAt, sortValue: (row) => row.startsAt },
    { key: 'ends', header: 'Ends', render: (row) => row.endsAt, sortValue: (row) => row.endsAt },
    { key: 'organizer', header: 'Organizer', render: (row) => nameOf(row.organizerId), searchValue: (row) => nameOf(row.organizerId) },
    { key: 'expected', header: 'Participants', align: 'right', render: (row) => row.expectedParticipants, sortValue: (row) => row.expectedParticipants },
    { key: 'budget', header: 'Budget', align: 'right', render: (row) => `$${row.budget.toLocaleString()}`, sortValue: (row) => row.budget },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={statusTone[row.status]} dot>{row.status}</Badge> },
  ]

  const saveEvent = () => {
    if (!form.title.trim()) { toast.error({ title: 'Title required', message: 'Name the event before publishing.' }); return }
    const event: SchoolEvent = {
      id: `evt-x${extra.length + 1}`, title: form.title.trim(), category: form.category as SchoolEvent['category'],
      startsAt: `${daysAhead(7)} 10:00`, endsAt: `${daysAhead(7)} 15:00`, venue: form.venue.trim() || 'Main hall',
      organizerId: 'tch-01', expectedParticipants: 60, status: 'upcoming', budget: Number(form.budget) || 500,
    }
    setExtra((list) => [...list, event])
    setCreateOpen(false)
    toast.success({ title: 'Event created', message: `${event.title} is on the calendar for ${event.startsAt}.` })
  }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Events" value={rows.length} icon={CalendarClock} hint={`${upcoming.length} upcoming`} />
      <StatCard label="Ongoing" value={ongoing.length} icon={Sparkles} tone="warning" hint="Happening now" />
      <StatCard label="Participants" value={participants} icon={CheckCircle2} tone="info" hint="Expected attendance" />
      <StatCard label="Budget" value={`$${budgetTotal.toLocaleString()}`} icon={Wallet} tone="success" hint="Planned spend" />
    </div>
    <Panel flush>
      <div className="ec-card__body">
        <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} searchPlaceholder="Search events, venues, organizers…"
          filters={[
            { key: 'category', label: 'All categories', options: [{ value: 'sports', label: 'Sports' }, { value: 'cultural', label: 'Cultural' }, { value: 'academic', label: 'Academic' }, { value: 'meeting', label: 'Meeting' }], match: (row, value) => row.category === value },
            { key: 'status', label: 'All statuses', options: [{ value: 'upcoming', label: 'Upcoming' }, { value: 'ongoing', label: 'Ongoing' }, { value: 'completed', label: 'Completed' }], match: (row, value) => row.status === value },
          ]}
          emptyTitle="No events scheduled"
          emptyMessage="Create the first campus event to populate the calendar."
          emptyAction={<RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--sm" onClick={() => setCreateOpen(true)}>New event</button></RoleGate>} />
      </div>
    </Panel>

    <Modal open={createOpen} title="Create campus event" description="Adds a five-hour event to the operations calendar with a default 60-person audience." onClose={() => setCreateOpen(false)}
      footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setCreateOpen(false)}>Cancel</button><button type="button" className="ec-btn" onClick={saveEvent}>Create event</button></>}>
      <FormGrid columns={2}>
        <TextField label="Event title" name="title" value={form.title} onChange={(value) => setForm((prev) => ({ ...prev, title: value }))} placeholder="Science fair 2026" required />
        <SelectField label="Category" name="category" value={form.category} onChange={(value) => setForm((prev) => ({ ...prev, category: value }))} options={[{ value: 'academic', label: 'Academic' }, { value: 'sports', label: 'Sports' }, { value: 'cultural', label: 'Cultural' }, { value: 'meeting', label: 'Meeting' }]} />
        <TextField label="Venue" name="venue" value={form.venue} onChange={(value) => setForm((prev) => ({ ...prev, venue: value }))} placeholder="Main hall" required />
        <TextField label="Budget" name="budget" value={form.budget} onChange={(value) => setForm((prev) => ({ ...prev, budget: value }))} hint="Whole dollars" />
      </FormGrid>
    </Modal>
  </div>
}

