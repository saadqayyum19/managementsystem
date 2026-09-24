import { useMemo, useState } from 'react'
import { CalendarDays, Clock3, Plus } from 'lucide-react'
import { Badge, ChipRow, PageHeader, Panel } from '../../components/ui/primitives'


import { FormGrid, SelectField } from '../../components/ui/FormField'
import { Modal } from '../../components/ui/Modal'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { RoleGate } from '../../components/ui/RoleGate'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import { periodTimesOrder, weekdaysOrder } from '../../mocks/academics'
import type { TimetableSlot } from '../../mocks/types'
import type { UserRole } from '../../store/authSlice'

const staffRoles: UserRole[] = ['super_admin', 'principal', 'teacher']

export function TimetableBoardPage() {
  const [activeClass, setActiveClass] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ day: 'Mon', period: '1', subjectId: '', teacherId: '', room: '' })
  const [extraSlots, setExtraSlots] = useState<TimetableSlot[]>([])
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['timetable', activeClass], () => mockApi.timetableBoard(activeClass === 'all' ? undefined : activeClass))

  const header = <PageHeader eyebrow="Academics · timetable" title="Weekly timetable" subtitle="Period-by-period schedule with live teacher and room allocation." actions={<>
    <RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Timetable')}>Export</button></RoleGate>
    <RoleGate roles={staffRoles}><button type="button" className="ec-btn" onClick={() => { setForm({ day: 'Mon', period: '1', subjectId: '', teacherId: '', room: '' }); setModalOpen(true) }}><Plus size={14} /> Add slot</button></RoleGate>
  </>} />

  const data = query.data
  const visibleExtras = useMemo(() => extraSlots.filter((slot) => activeClass === 'all' || slot.classId === activeClass), [extraSlots, activeClass])

  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={3} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={360} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const slots = [...data.slots, ...visibleExtras]
  const subjectOf = (id: string) => data.subjects.find((item) => item.id === id)
  const classOf = (id: string) => data.classes.find((item) => item.id === id)?.name ?? id
  const nameForSlot = (slot: TimetableSlot) => activeClass === 'all' ? `${classOf(slot.classId)} · ${subjectOf(slot.subjectId)?.code ?? ''}` : subjectOf(slot.subjectId)?.code ?? '—'
  const todayCount = slots.filter((slot) => slot.day === data.todayName).length
  const subjectCount = new Set(slots.map((slot) => slot.subjectId)).size
  const conflictPairs = new Set(slots.map((slot) => `${slot.teacherId}-${slot.day}-${slot.period}`)).size

  const saveSlot = () => {
    if (!form.subjectId) { toast.error({ title: 'Subject required', message: 'Pick the subject this period teaches.' }); return }
    const subject = subjectOf(form.subjectId)
    const teacherId = form.teacherId || subject?.teacherIds[0] || 'tch-01'
    const clash = slots.some((slot) => slot.day === form.day && slot.period === Number(form.period) && slot.teacherId === teacherId)
    if (clash) { toast.error({ title: 'Conflict detected', message: 'That teacher is already teaching in this period.' }); return }
    const classId = activeClass === 'all' ? data.classes[0].id : activeClass
    const time = periodTimesOrder[Number(form.period) - 1]
    setExtraSlots((rows) => [...rows, { id: `tt-x${rows.length + 1}`, classId, subjectId: form.subjectId, teacherId, day: form.day as TimetableSlot['day'], period: Number(form.period), startTime: time.start, endTime: time.end, room: form.room || classOf(classId) }])
    setModalOpen(false)
    toast.success({ title: 'Slot added', message: 'The new period now appears in the grid (mock).' })
  }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--3" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Weekly periods" value={slots.length} icon={CalendarDays} hint={activeClass === 'all' ? 'All classes combined' : classOf(activeClass)} />
      <StatCard label="Subjects scheduled" value={subjectCount} icon={Clock3} tone="success" hint="Distinct subjects this week" />
      <StatCard label={`Periods on ${data.todayName}`} value={todayCount} icon={Clock3} tone="warning" hint={`${conflictPairs} unique teacher slots`} />
    </div>
    <Panel flush>
      <div className="ec-card__body">
        <div className="ec-row" style={{ marginBottom: 'var(--ec-space-3)', flexWrap: 'wrap', gap: 12 }}>
          <ChipRow options={[{ value: 'all', label: 'All classes' }, ...data.classes.map((item) => ({ value: item.id, label: item.name }))]} value={activeClass} onChange={setActiveClass} />
          <span className="ec-spacer" />
          <Badge tone="info" dot>Today is {data.todayName}</Badge>
        </div>
        <div className="ec-table-wrap">
          <table className="ec-table">
            <thead><tr><th style={{ width: 130 }}>Period</th>{weekdaysOrder.map((day) => <th key={day} style={day === data.todayName ? { background: '#eff6ff' } : undefined}>{day}{day === data.todayName ? ' · today' : ''}</th>)}</tr></thead>
            <tbody>{periodTimesOrder.map((time, index) => {
              const period = index + 1
              return <tr key={time.start}>
                <td><div className="ec-table__primary"><strong>P{period}</strong><span>{time.start} – {time.end}</span></div></td>
                {weekdaysOrder.map((day) => {
                  const cell = slots.filter((slot) => slot.day === day && slot.period === period)
                  return <td key={day} style={day === data.todayName ? { background: '#f8faff' } : undefined}>
                    {cell.length === 0
                      ? <span className="ec-small ec-muted">—</span>
                      : cell.map((slot) => <div key={slot.id} className="ec-stack" style={{ gap: 3 }}>
                          <strong style={{ fontSize: 12 }}>{nameForSlot(slot)}</strong>
                          <span className="ec-small ec-muted">{slot.startTime}–{slot.endTime} · {slot.room}</span>
                          <span className="ec-small ec-muted">{activeClass === 'all' ? `${classOf(slot.classId)} · ` : ''}{nameOf(slot.teacherId)}</span>
                        </div>)}
                  </td>
                })}
              </tr>
            })}</tbody>
          </table>
        </div>
      </div>
    </Panel>
    <Modal open={modalOpen} title="Add timetable slot" description="Conflicts are validated against teacher availability before the slot is placed." onClose={() => setModalOpen(false)}
      footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setModalOpen(false)}>Cancel</button><button type="button" className="ec-btn" onClick={saveSlot}>Add slot</button></>}>
      <FormGrid columns={2}>
        <SelectField label="Day" name="day" value={form.day} onChange={(value) => setForm((prev) => ({ ...prev, day: value }))} options={weekdaysOrder.map((day) => ({ value: day, label: day }))} />
        <SelectField label="Period" name="period" value={form.period} onChange={(value) => setForm((prev) => ({ ...prev, period: value }))} options={periodTimesOrder.map((_, index) => ({ value: String(index + 1), label: `Period ${index + 1}` }))} />
        <SelectField label="Subject" name="subjectId" value={form.subjectId} onChange={(value) => setForm((prev) => ({ ...prev, subjectId: value }))} options={data.subjects.map((subject) => ({ value: subject.id, label: `${subject.name} (${subject.code})` }))} placeholder="Choose…" required />
        <SelectField label="Teacher" name="teacherId" value={form.teacherId} onChange={(value) => setForm((prev) => ({ ...prev, teacherId: value }))} options={data.teachers.map((teacher) => ({ value: teacher.id, label: `${teacher.firstName} ${teacher.lastName}` }))} placeholder="From subject" />
      </FormGrid>
    </Modal>
  </div>
}

