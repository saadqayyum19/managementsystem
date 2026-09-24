import { useState } from 'react'
import { CalendarClock, Film, Radio, Video } from 'lucide-react'
import { Badge, PageHeader, Panel } from '../../components/ui/primitives'
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
import type { LiveClass } from '../../mocks/types'
import type { UserRole } from '../../store/authSlice'

const staffRoles: UserRole[] = ['super_admin', 'principal', 'teacher']
const statusTone = { scheduled: 'info', live: 'danger', completed: 'success' } as const

export function LiveClassesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ title: '', classId: 'cls-05', subjectId: 'sub-01', platform: 'educore-meet', duration: '45' })
  const [extra, setExtra] = useState<LiveClass[]>([])
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['live-classes'], mockApi.liveClassBoard)

  const header = <PageHeader eyebrow="Academics · live classes" title="Live classes" subtitle="Scheduled sessions, join links and recordings across platforms." actions={<>
    <RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Session schedule')}>Export</button></RoleGate>
    <RoleGate roles={staffRoles}><button type="button" className="ec-btn" onClick={() => { setForm({ title: '', classId: 'cls-05', subjectId: 'sub-01', platform: 'educore-meet', duration: '45' }); setCreateOpen(true) }}>Schedule session</button></RoleGate>
  </>} />

  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={3} /><div style={{ height: 16 }} /><SkeletonCards count={2} height={200} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const sessions = [...data.classes, ...extra]
  const subjectName = (id: string) => data.subjects.find((item) => item.id === id)?.name ?? id
  const className = (id: string) => data.schoolClasses.find((item) => item.id === id)?.name ?? id
  const upcoming = sessions.filter((item) => item.status === 'scheduled')
  const live = sessions.filter((item) => item.status === 'live')
  const recordings = sessions.filter((item) => item.recordingUrl !== null)

  const join = (session: LiveClass) => toast.success({ title: `Joining ${session.title}`, message: `${session.platform} opens in a new tab (stubbed in the mock phase).` })
  const watch = (session: LiveClass) => toast.info({ title: 'Recording playback', message: `${session.title} recording would stream from ${session.recordingUrl}.` })

  const saveSession = () => {
    if (!form.title.trim()) { toast.error({ title: 'Title required', message: 'Name the live session first.' }); return }
    const session: LiveClass = {
      id: `lc-x${extra.length + 1}`, title: form.title.trim(), subjectId: form.subjectId, classId: form.classId,
      teacherId: data.subjects.find((item) => item.id === form.subjectId)?.teacherIds[0] ?? 'tch-01',
      startsAt: `${daysAhead(3)} 09:30`, durationMinutes: Number(form.duration) || 45,
      platform: form.platform as LiveClass['platform'], status: 'scheduled',
      attendeeIds: data.students.filter((student) => student.classId === form.classId).map((student) => student.id),
      recordingUrl: null,
    }
    setExtra((list) => [...list, session])
    setCreateOpen(false)
    toast.success({ title: 'Session scheduled', message: `${session.title} starts ${session.startsAt} (mock).` })
  }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Upcoming" value={upcoming.length} icon={CalendarClock} hint="Scheduled sessions" />
      <StatCard label="Live now" value={live.length} icon={Radio} tone={live.length > 0 ? 'danger' : 'info'} hint="Join anytime" />
      <StatCard label="Completed" value={sessions.filter((item) => item.status === 'completed').length} icon={Film} tone="success" hint="This term" />
      <StatCard label="Recordings" value={recordings.length} icon={Video} tone="warning" hint="Available to replay" />
    </div>
    <div className="ec-grid ec-grid--3">
      {sessions.length === 0 && <Panel title="No live sessions"><p className="ec-small ec-muted">Schedule the first session to open the virtual classroom.</p><div style={{ height: 10 }} /><RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--sm" onClick={() => setCreateOpen(true)}>Schedule session</button></RoleGate></Panel>}
      {sessions.map((session) => <Panel key={session.id} title={session.title} hint={`${subjectName(session.subjectId)} · ${className(session.classId)}`} actions={<Badge tone={statusTone[session.status]} dot>{session.status}</Badge>}>
        <div className="ec-stack" style={{ gap: 6 }}>
          <div className="ec-row"><span className="ec-small ec-muted">Starts</span><span className="ec-spacer" /><strong style={{ fontSize: 13 }}>{session.startsAt}</strong></div>
          <div className="ec-row"><span className="ec-small ec-muted">Teacher</span><span className="ec-spacer" /><span className="ec-small">{nameOf(session.teacherId)}</span></div>
          <div className="ec-row"><span className="ec-small ec-muted">Platform</span><span className="ec-spacer" /><Badge>{session.platform}</Badge></div>
          <div className="ec-row"><span className="ec-small ec-muted">Attendees</span><span className="ec-spacer" /><span className="ec-small">{session.attendeeIds.length} students · {session.durationMinutes} min</span></div>
          <div className="ec-row" style={{ marginTop: 6 }}>
            {session.status !== 'completed' && <button type="button" className="ec-btn ec-btn--sm" onClick={() => join(session)}><Video size={13} /> Join</button>}
            {session.recordingUrl && <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => watch(session)}><Film size={13} /> Recording</button>}
            {session.status === 'completed' && !session.recordingUrl && <span className="ec-small ec-muted">No recording yet</span>}
          </div>
        </div>
      </Panel>)}
    </div>

    <Modal open={createOpen} title="Schedule live session" description="Seeds attendees from the class roster and books the session three days out." onClose={() => setCreateOpen(false)}
      footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setCreateOpen(false)}>Cancel</button><button type="button" className="ec-btn" onClick={saveSession}>Schedule</button></>}>
      <FormGrid columns={2}>
        <TextField label="Session title" name="title" value={form.title} onChange={(value) => setForm((prev) => ({ ...prev, title: value }))} placeholder="Photosynthesis deep dive" required />
        <SelectField label="Class" name="classId" value={form.classId} onChange={(value) => setForm((prev) => ({ ...prev, classId: value }))} options={data.schoolClasses.map((item) => ({ value: item.id, label: item.name }))} />
        <SelectField label="Subject" name="subjectId" value={form.subjectId} onChange={(value) => setForm((prev) => ({ ...prev, subjectId: value }))} options={data.subjects.map((item) => ({ value: item.id, label: `${item.name} (${item.code})` }))} />
        <SelectField label="Platform" name="platform" value={form.platform} onChange={(value) => setForm((prev) => ({ ...prev, platform: value }))} options={[{ value: 'educore-meet', label: 'EduCore Meet' }, { value: 'zoom', label: 'Zoom' }, { value: 'youtube', label: 'YouTube Live' }]} />
        <TextField label="Duration (minutes)" name="duration" value={form.duration} onChange={(value) => setForm((prev) => ({ ...prev, duration: value }))} />
      </FormGrid>
    </Modal>
  </div>
}

