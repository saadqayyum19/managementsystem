import { useState } from 'react'
import { BookOpen, CheckCircle2, FileText, PenLine } from 'lucide-react'
import { Badge, PageHeader, Panel, ProgressBar } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { Modal } from '../../components/ui/Modal'
import { FormGrid, SelectField, TextAreaField, TextField } from '../../components/ui/FormField'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { RoleGate } from '../../components/ui/RoleGate'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import { daysAhead, isoDate, TODAY } from '../../mocks/seed'
import type { Assignment } from '../../mocks/types'
import type { UserRole } from '../../store/authSlice'

const staffRoles: UserRole[] = ['super_admin', 'principal', 'teacher']
const statusTone = { draft: 'neutral', published: 'success', closed: 'warning' } as const

export function AssignmentsModulePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ title: '', classId: 'cls-05', subjectId: 'sub-01', dueDays: '5', maxMarks: '20', description: '' })
  const [extra, setExtra] = useState<Assignment[]>([])
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['assignments'], mockApi.assignmentsBoard)

  const header = <PageHeader eyebrow="Academics · assignments" title="Learning & assignments" subtitle="Create work, track submissions, clear the grading queue." actions={<>
    <RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Assignments')}>Export</button></RoleGate>
    <RoleGate roles={staffRoles}><button type="button" className="ec-btn" onClick={() => { setForm({ title: '', classId: 'cls-05', subjectId: 'sub-01', dueDays: '5', maxMarks: '20', description: '' }); setCreateOpen(true) }}>New assignment</button></RoleGate>
  </>} />

  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={320} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const rows = [...data.assignments, ...extra]
  const allSubs = rows.flatMap((row) => row.submissions)
  const submittedCount = allSubs.filter((item) => item.submittedAt !== null).length
  const pendingGrading = allSubs.filter((item) => item.submittedAt !== null && item.status !== 'graded').length
  const selected = rows.find((row) => row.id === selectedId) ?? null
  const nameOfClass = (classId: string) => data.classes.find((item) => item.id === classId)?.name ?? classId
  const nameOfSubject = (subjectId: string) => data.subjects.find((item) => item.id === subjectId)?.name ?? subjectId

  const columns: Array<DataTableColumn<(typeof rows)[number]>> = [
    { key: 'title', header: 'Assignment', render: (row) => <div className="ec-table__primary"><strong>{row.title}</strong><span>{nameOfClass(row.classId)} · {nameOfSubject(row.subjectId)}</span></div>, searchValue: (row) => `${row.title} ${nameOfClass(row.classId)} ${nameOfSubject(row.subjectId)}` },
    { key: 'due', header: 'Due date', render: (row) => row.dueDate, sortValue: (row) => row.dueDate },
    { key: 'marks', header: 'Marks', align: 'right', render: (row) => row.maxMarks, sortValue: (row) => row.maxMarks },
    { key: 'progress', header: 'Submissions', render: (row) => { const done = row.submissions.filter((item) => item.submittedAt !== null).length; return <div style={{ minWidth: 140 }}><div className="ec-row"><span className="ec-small">{done} / {row.submissions.length}</span><span className="ec-spacer" /><span className="ec-small ec-muted">{row.submissions.length === 0 ? 0 : Math.round((done / row.submissions.length) * 100)}%</span></div><ProgressBar value={done} max={row.submissions.length || 1} tone={row.submissions.length > 0 && done === row.submissions.length ? 'success' : 'primary'} /></div> }, sortValue: (row) => row.submissions.filter((item) => item.submittedAt !== null).length },
    { key: 'teacher', header: 'Teacher', render: (row) => nameOf(row.teacherId) },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={statusTone[row.status]} dot>{row.status}</Badge> },
  ]

  const saveAssignment = () => {
    if (!form.title.trim()) { toast.error({ title: 'Title required', message: 'Name the assignment before publishing.' }); return }
    const id = `asg-x${extra.length + 1}`
    const teacherId = data.subjects.find((item) => item.id === form.subjectId)?.teacherIds[0] ?? 'tch-01'
    const assignment: Assignment = {
      id, title: form.title.trim(), description: form.description || 'No description.',
      subjectId: form.subjectId, classId: form.classId, teacherId, createdAt: isoDate(TODAY), dueDate: daysAhead(Number(form.dueDays) || 5),
      maxMarks: Number(form.maxMarks) || 20, status: 'published', attachmentName: null,
      submissions: data.students.filter((student) => student.classId === form.classId).map((student, index) => ({ id: `sub-${id}-${index}`, assignmentId: id, studentId: student.id, submittedAt: null, status: 'pending' as const, marks: null, feedback: null })),
    }
    setExtra((list) => [...list, assignment])
    setCreateOpen(false)
    toast.success({ title: 'Assignment published', message: `${assignment.title} is live for ${nameOfClass(form.classId)}.` })
  }

  const subTone = { pending: 'neutral', submitted: 'info', late: 'warning', graded: 'success' } as const

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Assignments" value={rows.length} icon={FileText} hint="All subjects" />
      <StatCard label="Published" value={rows.filter((row) => row.status === 'published').length} icon={CheckCircle2} tone="success" hint="Live for students" />
      <StatCard label="Submissions" value={submittedCount} icon={BookOpen} tone="info" hint={`of ${allSubs.length} expected`} />
      <StatCard label="Awaiting grading" value={pendingGrading} icon={PenLine} tone={pendingGrading > 0 ? 'warning' : 'success'} hint="Teachers' queue" />
    </div>
    <Panel flush>
      <div className="ec-card__body">
        <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} searchPlaceholder="Search assignments…"
          filters={[{ key: 'status', label: 'All statuses', options: [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'closed', label: 'Closed' }], match: (row, value) => row.status === value }]}
          emptyTitle="No assignments yet" emptyMessage="Create the first assignment to start the submission tracker."
          emptyAction={<RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--sm" onClick={() => setCreateOpen(true)}>New assignment</button></RoleGate>}
          onRowClick={(row) => setSelectedId(row.id)}
          actions={(row) => <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => setSelectedId(row.id)}>Submissions</button>} />
      </div>
    </Panel>

    <Modal open={Boolean(selected)} title={selected?.title ?? 'Assignment'} description={selected ? `${nameOfClass(selected.classId)} · ${nameOfSubject(selected.subjectId)} · due ${selected.dueDate} · ${selected.maxMarks} marks` : ''} onClose={() => setSelectedId(null)}
      footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setSelectedId(null)}>Close</button><RoleGate roles={staffRoles}><button type="button" className="ec-btn" onClick={() => { setSelectedId(null); toast.success({ title: 'Grading queue updated', message: 'Submitted work was routed to the teacher (mock).' }) }}>Send pending to grading</button></RoleGate></>}>
      {selected && <>
        <p className="ec-small ec-muted" style={{ marginBottom: 12 }}>{selected.description}</p>
        <div className="ec-stack">{selected.submissions.length === 0
          ? <p className="ec-small ec-muted">No roster attached to this assignment yet.</p>
          : selected.submissions.map((submission) => {
              const student = data.students.find((item) => item.id === submission.studentId)
              return <div key={submission.id} className="ec-row" style={{ borderBottom: '1px solid #eef2f7', paddingBottom: 6 }}>
                <strong style={{ fontSize: 13 }}>{student ? `${student.firstName} ${student.lastName}` : submission.studentId}</strong>
                <span className="ec-spacer" />
                <span className="ec-small ec-muted">{submission.submittedAt ?? 'not submitted'}</span>
                <Badge tone={subTone[submission.status]}>{submission.status}</Badge>
                <Badge tone="info">{submission.marks === null ? '—' : `${submission.marks}/${selected.maxMarks}`}</Badge>
              </div>
            })}</div>
      </>}
    </Modal>

    <Modal open={createOpen} title="New assignment" description="Publishes immediately and seeds pending submissions for every student in the class." onClose={() => setCreateOpen(false)}
      footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setCreateOpen(false)}>Cancel</button><button type="button" className="ec-btn" onClick={saveAssignment}>Publish</button></>}>
      <FormGrid columns={2}>
        <TextField label="Title" name="title" value={form.title} onChange={(setvalue) => setForm((prev) => ({ ...prev, title: setvalue }))} placeholder="Chapter 5 problem set" required />
        <SelectField label="Class" name="classId" value={form.classId} onChange={(value) => setForm((prev) => ({ ...prev, classId: value }))} options={data.classes.map((item) => ({ value: item.id, label: item.name }))} />
        <SelectField label="Subject" name="subjectId" value={form.subjectId} onChange={(value) => setForm((prev) => ({ ...prev, subjectId: value }))} options={data.subjects.map((item) => ({ value: item.id, label: `${item.name} (${item.code})` }))} />
        <SelectField label="Due in" name="dueDays" value={form.dueDays} onChange={(value) => setForm((prev) => ({ ...prev, dueDays: value }))} options={[3, 5, 7, 10, 14].map((days) => ({ value: String(days), label: `${days} days` }))} />
        <TextField label="Max marks" name="maxMarks" value={form.maxMarks} onChange={(value) => setForm((prev) => ({ ...prev, maxMarks: value }))} />
        <TextAreaField label="Instructions" name="description" value={form.description} onChange={(value) => setForm((prev) => ({ ...prev, description: value }))} hint="Shown to students on the assignment card" />
      </FormGrid>
    </Modal>
  </div>
}

