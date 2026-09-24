import { useState } from 'react'
import { CalendarDays, Flag, Palmtree, Sparkles } from 'lucide-react'
import { Badge, PageHeader, Panel } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { FormGrid, SelectField, TextAreaField, TextField } from '../../components/ui/FormField'
import { isoDate, TODAY } from '../../mocks/seed'
import { Modal } from '../../components/ui/Modal'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { RoleGate } from '../../components/ui/RoleGate'
import { useMockQuery } from '../../hooks/useMockQuery'
import { mockApi } from '../../services/mockApi'
import type { Holiday } from '../../mocks/types'
import type { UserRole } from '../../store/authSlice'

const staff: UserRole[] = ['super_admin', 'principal']
const tone = { national: 'info', festival: 'warning', institutional: 'success', vacation: 'neutral' } as const

export function HolidayCalendarPage() {
  const [open, setOpen] = useState(false)
  const [extra, setExtra] = useState<Holiday[]>([])
  const [form, setForm] = useState({ name: '', date: isoDate(TODAY), type: 'institutional', description: '' })
  const [error, setError] = useState<Record<string, string>>({})
  const toast = useToast()
  const query = useMockQuery(['holidays'], mockApi.holidayBoard)
  const header = <PageHeader eyebrow="Operations · calendar" title="Holiday calendar" subtitle="Institution closures, festivals and planning days." actions={<RoleGate roles={staff}><button type="button" className="ec-btn" onClick={() => setOpen(true)}>Add holiday</button></RoleGate>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>
  const rows = [...extra, ...data.holidays]
  const save = () => {
    const next = { name: form.name.trim() ? '' : 'Holiday name is required.', date: form.date ? '' : 'Choose a date.', description: form.description.trim() ? '' : 'Add a short description.' }
    setError(next)
    if (Object.values(next).some(Boolean)) return
    setExtra((list) => [{ id: `hol-x${list.length + 1}`, name: form.name.trim(), date: form.date, type: form.type as Holiday['type'], description: form.description.trim() }, ...list])
    setOpen(false); toast.success({ title: 'Holiday added', message: `${form.name.trim()} is on the shared calendar.` })
  }
  const columns: Array<DataTableColumn<Holiday>> = [
    { key: 'name', header: 'Holiday', render: (row) => <div className="ec-table__primary"><strong>{row.name}</strong><span>{row.description}</span></div>, searchValue: (row) => `${row.name} ${row.description}` },
    { key: 'date', header: 'Date', render: (row) => row.date, sortValue: (row) => row.date },
    { key: 'type', header: 'Type', render: (row) => <Badge tone={tone[row.type]}>{row.type}</Badge> },
  ]
  return <div className="ec-page">{header}<div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}><StatCard label="Dates" value={rows.length} icon={CalendarDays} /><StatCard label="Vacations" value={rows.filter((row) => row.type === 'vacation').length} icon={Palmtree} tone="info" /><StatCard label="Festivals" value={rows.filter((row) => row.type === 'festival').length} icon={Sparkles} tone="warning" /><StatCard label="National days" value={rows.filter((row) => row.type === 'national').length} icon={Flag} tone="success" /></div><Panel flush><div className="ec-card__body"><DataTable columns={columns} rows={rows} rowKey={(row) => row.id} searchPlaceholder="Search holidays…" filters={[{ key: 'type', label: 'All types', options: Object.keys(tone).map((value) => ({ value, label: value })), match: (row, value) => row.type === value }]} emptyTitle="No holidays" emptyMessage="Add the first closure to the calendar." /></div></Panel>
    <Modal open={open} title="Add holiday" description="Publish a closure to all role calendars." onClose={() => setOpen(false)} footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="ec-btn" onClick={save}>Add holiday</button></>}><FormGrid><TextField label="Name" name="holiday-name" value={form.name} onChange={(name) => setForm((prev) => ({ ...prev, name }))} error={error.name} required /><TextField label="Date" name="holiday-date" type="date" value={form.date} onChange={(date) => setForm((prev) => ({ ...prev, date }))} error={error.date} required /><SelectField label="Type" name="holiday-type" value={form.type} onChange={(type) => setForm((prev) => ({ ...prev, type }))} options={Object.keys(tone).map((value) => ({ value, label: value }))} /><TextAreaField label="Description" name="holiday-description" value={form.description} onChange={(description) => setForm((prev) => ({ ...prev, description }))} error={error.description} required /></FormGrid></Modal>
  </div>
}
