import { useState } from 'react'
import { Brain, ListChecks, PlayCircle, Timer } from 'lucide-react'
import { Badge, PageHeader, Panel, ProgressBar } from '../../components/ui/primitives'
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



import { daysAhead } from '../../mocks/seed'
import type { Quiz } from '../../mocks/types'
import type { UserRole } from '../../store/authSlice'

const staffRoles: UserRole[] = ['super_admin', 'principal', 'teacher']

export function QuizExamsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ title: '', classId: 'cls-05', subjectId: 'sub-01', mode: 'mcq', duration: '30', totalMarks: '20' })
  const [extra, setExtra] = useState<Quiz[]>([])
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['quizzes'], mockApi.quizBoard)

  const header = <PageHeader eyebrow="Academics · online exams" title="Quiz & online exams" subtitle="Timed quizzes with attempt analytics and optional AI proctoring." actions={<>
    <RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Attempt log')}>Export</button></RoleGate>
    <RoleGate roles={staffRoles}><button type="button" className="ec-btn" onClick={() => { setForm({ title: '', classId: 'cls-05', subjectId: 'sub-01', mode: 'mcq', duration: '30', totalMarks: '20' }); setCreateOpen(true) }}>New quiz</button></RoleGate>
  </>} />

  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={320} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const rows = [...data.quizzes, ...extra]
  const allAttempts = rows.flatMap((row) => row.attempts)
  const completed = allAttempts.filter((attempt) => attempt.status === 'completed')
  const averageScore = completed.length === 0 ? 0 : Math.round((completed.reduce((sum, attempt) => sum + (attempt.score ?? 0), 0) / completed.length) * 10) / 10
  const violations = allAttempts.reduce((sum, attempt) => sum + attempt.violations, 0)
  const selected = rows.find((row) => row.id === selectedId) ?? null
  const nameOfClass = (classId: string) => data.classes.find((item) => item.id === classId)?.name ?? classId
  const nameOfSubject = (subjectId: string) => data.subjects.find((item) => item.id === subjectId)?.name ?? subjectId

  const columns: Array<DataTableColumn<(typeof rows)[number]>> = [
    { key: 'title', header: 'Quiz', render: (row) => <div className="ec-table__primary"><strong>{row.title}</strong><span>{nameOfClass(row.classId)} · {nameOfSubject(row.subjectId)}</span></div>, searchValue: (row) => `${row.title} ${nameOfClass(row.classId)} ${nameOfSubject(row.subjectId)}` },
    { key: 'mode', header: 'Mode', render: (row) => <Badge tone={row.mode === 'mcq' ? 'info' : 'warning'}>{row.mode}</Badge> },
    { key: 'when', header: 'Scheduled', render: (row) => row.scheduledAt, sortValue: (row) => row.scheduledAt },
    { key: 'duration', header: 'Duration', align: 'right', render: (row) => `${row.durationMinutes} min`, sortValue: (row) => row.durationMinutes },
    { key: 'marks', header: 'Marks', align: 'right', render: (row) => row.totalMarks, sortValue: (row) => row.totalMarks },
    { key: 'attempts', header: 'Attempts', render: (row) => { const done = row.attempts.filter((attempt) => attempt.status === 'completed').length; return <div style={{ minWidth: 130 }}><div className="ec-row"><span className="ec-small">{done} / {row.attempts.length}</span><span className="ec-spacer" /><span className="ec-small ec-muted">completed</span></div><ProgressBar value={done} max={row.attempts.length || 1} tone={done === row.attempts.length ? 'success' : 'primary'} /></div> }, sortValue: (row) => row.attempts.filter((attempt) => attempt.status === 'completed').length },
    { key: 'ai', header: 'Proctoring', render: (row) => row.aiProctored ? <Badge tone="success" dot>AI proctored</Badge> : <Badge>off</Badge> },
  ]

  const saveQuiz = () => {
    if (!form.title.trim()) { toast.error({ title: 'Title required', message: 'Name the quiz before scheduling.' }); return }
    const quiz: Quiz = {
      id: `quiz-x${extra.length + 1}`, title: form.title.trim(), subjectId: form.subjectId, classId: form.classId,
      teacherId: data.subjects.find((item) => item.id === form.subjectId)?.teacherIds[0] ?? 'tch-01',
      scheduledAt: `${daysAhead(5)} 10:00`, durationMinutes: Number(form.duration) || 30,
      mode: form.mode as Quiz['mode'], totalMarks: Number(form.totalMarks) || 20, aiProctored: true,
      attempts: data.students.filter((student) => student.classId === form.classId).map((student) => ({ studentId: student.id, score: null, status: 'not_started', violations: 0 })),
    }
    setExtra((list) => [...list, quiz])
    setCreateOpen(false)
    toast.success({ title: 'Quiz scheduled', message: `${quiz.title} opens on ${quiz.scheduledAt} (mock).` })
  }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Quizzes" value={rows.length} icon={ListChecks} hint="Online exams" />
      <StatCard label="Attempts completed" value={completed.length} icon={PlayCircle} tone="success" hint={`of ${allAttempts.length} assigned`} />
      <StatCard label="Average score" value={`${averageScore}%`} icon={Timer} tone={averageScore >= 60 ? 'success' : 'warning'} delta={averageScore - 60} deltaLabel="vs 60% target" />
      <StatCard label="Proctor flags" value={violations} icon={Brain} tone={violations > 0 ? 'danger' : 'success'} hint="Violations detected" />
    </div>
    <Panel flush>
      <div className="ec-card__body">
        <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} searchPlaceholder="Search quizzes…"
          emptyTitle="No quizzes scheduled" emptyMessage="Create the first online exam to start collecting attempts."
          emptyAction={<RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--sm" onClick={() => setCreateOpen(true)}>New quiz</button></RoleGate>}
          onRowClick={(row) => setSelectedId(row.id)}
          actions={(row) => <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => setSelectedId(row.id)}>View attempts</button>} />
      </div>
    </Panel>

    <Modal open={Boolean(selected)} title={selected?.title ?? 'Quiz'} description={selected ? `${nameOfClass(selected.classId)} · ${nameOfSubject(selected.subjectId)} · ${selected.durationMinutes} min · ${selected.totalMarks} marks` : ''} onClose={() => setSelectedId(null)}
      footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setSelectedId(null)}>Close</button><RoleGate roles={staffRoles}><button type="button" className="ec-btn" onClick={() => { setSelectedId(null); toast.success({ title: 'Quiz opened', message: 'Students can now attempt this quiz (mock).' }) }}>Open attempt window</button></RoleGate></>}>
      {selected && <div className="ec-stack">{selected.attempts.length === 0
        ? <p className="ec-small ec-muted">No students are assigned to this quiz yet.</p>
        : selected.attempts.map((attempt) => {
            const student = data.students.find((item) => item.id === attempt.studentId)
            return <div key={attempt.studentId} className="ec-row" style={{ borderBottom: '1px solid #eef2f7', paddingBottom: 6 }}>
              <strong style={{ fontSize: 13 }}>{student ? `${student.firstName} ${student.lastName}` : attempt.studentId}</strong>
              <span className="ec-spacer" />
              {attempt.violations > 0 && <Badge tone="danger">{attempt.violations} flags</Badge>}
              <Badge tone={attempt.status === 'completed' ? 'success' : attempt.status === 'in_progress' ? 'warning' : 'neutral'}>{attempt.status.replace('_', ' ')}</Badge>
              <Badge tone="info">{attempt.score === null ? '—' : `${attempt.score}%`}</Badge>
            </div>
          })}</div>}
    </Modal>

    <Modal open={createOpen} title="Schedule quiz" description="Auto-proctored and scheduled five days out with attempts seeded for the class." onClose={() => setCreateOpen(false)}
      footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setCreateOpen(false)}>Cancel</button><button type="button" className="ec-btn" onClick={saveQuiz}>Schedule quiz</button></>}>
      <FormGrid columns={2}>
        <TextField label="Quiz title" name="title" value={form.title} onChange={(value) => setForm((prev) => ({ ...prev, title: value }))} placeholder="Algebra checkpoint" required />
        <SelectField label="Class" name="classId" value={form.classId} onChange={(value) => setForm((prev) => ({ ...prev, classId: value }))} options={data.classes.map((item) => ({ value: item.id, label: item.name }))} />
        <SelectField label="Subject" name="subjectId" value={form.subjectId} onChange={(value) => setForm((prev) => ({ ...prev, subjectId: value }))} options={data.subjects.map((item) => ({ value: item.id, label: `${item.name} (${item.code})` }))} />
        <SelectField label="Mode" name="mode" value={form.mode} onChange={(value) => setForm((prev) => ({ ...prev, mode: value }))} options={[{ value: 'mcq', label: 'MCQ' }, { value: 'descriptive', label: 'Descriptive' }]} />
        <TextField label="Duration (minutes)" name="duration" value={form.duration} onChange={(value) => setForm((prev) => ({ ...prev, duration: value }))} />
        <TextField label="Total marks" name="totalMarks" value={form.totalMarks} onChange={(value) => setForm((prev) => ({ ...prev, totalMarks: value }))} />
      </FormGrid>
    </Modal>
  </div>
}

