import { useState } from 'react'
import { CalendarDays, ClipboardCheck, FileText, TrendingUp } from 'lucide-react'
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
import { nameOf } from '../../mocks'
import { daysAhead } from '../../mocks/seed'
import type { Exam } from '../../mocks/types'
import type { UserRole } from '../../store/authSlice'

const staffRoles: UserRole[] = ['super_admin', 'principal', 'teacher']
const typeTone = { unit: 'info', midterm: 'warning', final: 'danger', quiz: 'neutral' } as const
const statusTone = { scheduled: 'info', ongoing: 'warning', completed: 'success' } as const

export function ExaminationsModulePage() {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ name: '', classId: 'cls-05', subjectId: 'sub-01', maxMarks: '100', passMarks: '35' })
  const [extraExams, setExtraExams] = useState<Exam[]>([])
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['examinations'], mockApi.examinationsBoard)

  const header = <PageHeader eyebrow="Academics · examinations" title="Examinations & grade book" subtitle="Schedule exams, review graded papers and publish results." actions={<>
    <RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Grade book')}>Export</button></RoleGate>
    <RoleGate roles={staffRoles}><button type="button" className="ec-btn" onClick={() => { setForm({ name: '', classId: 'cls-05', subjectId: 'sub-01', maxMarks: '100', passMarks: '35' }); setCreateOpen(true) }}>Schedule exam</button></RoleGate>
  </>} />

  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={320} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const exams = [...data.exams, ...extraExams]
  const marksFor = (examId: string) => data.marks.filter((mark) => mark.examId === examId)
  const graded = data.marks.length
  const average = graded === 0 ? 0 : Math.round((data.marks.reduce((sum, mark) => sum + (mark.marksObtained / mark.maxMarks) * 100, 0) / graded) * 10) / 10
  const passRate = graded === 0 ? 0 : Math.round((data.marks.filter((mark) => mark.marksObtained / mark.maxMarks >= 0.5).length / graded) * 100)
  const selectedExam = exams.find((exam) => exam.id === selectedExamId) ?? null

  const nameOfClass = (classId: string) => data.classes.find((item) => item.id === classId)?.name ?? classId
  const nameOfSubject = (subjectId: string) => data.subjects.find((item) => item.id === subjectId)?.name ?? subjectId

  const examColumns: Array<DataTableColumn<(typeof exams)[number]>> = [
    { key: 'name', header: 'Exam', render: (row) => <div className="ec-table__primary"><strong>{row.name}</strong><span>{nameOfClass(row.classId)} · {nameOfSubject(row.subjectId)}</span></div>, searchValue: (row) => `${row.name} ${nameOfClass(row.classId)} ${nameOfSubject(row.subjectId)}` },
    { key: 'type', header: 'Type', render: (row) => <Badge tone={typeTone[row.type]}>{row.type}</Badge> },
    { key: 'date', header: 'Date', render: (row) => row.date, sortValue: (row) => row.date },
    { key: 'marks', header: 'Marks', align: 'right', render: (row) => `${row.maxMarks} · pass ${row.passMarks}`, sortValue: (row) => row.maxMarks },
    { key: 'papers', header: 'Graded', align: 'right', render: (row) => marksFor(row.id).length, sortValue: (row) => marksFor(row.id).length },
    { key: 'invigilator', header: 'Invigilator', render: (row) => nameOf(row.invigilatorId), searchValue: (row) => nameOf(row.invigilatorId) },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={statusTone[row.status]} dot>{row.status}</Badge> },
  ]

  const saveExam = () => {
    if (!form.name.trim()) { toast.error({ title: 'Exam name required', message: 'Give the exam a recognisable title.' }); return }
    const subject = data.subjects.find((item) => item.id === form.subjectId)
    const exam: Exam = {
      id: `exam-x${extraExams.length + 1}`, name: form.name.trim(), type: 'unit', classId: form.classId, subjectId: form.subjectId,
      date: daysAhead(7), maxMarks: Number(form.maxMarks) || 100, passMarks: Number(form.passMarks) || 35,
      invigilatorId: subject?.teacherIds[0] ?? 'tch-01', status: 'scheduled',
    }
    setExtraExams((rows) => [...rows, exam])
    setCreateOpen(false)
    toast.success({ title: 'Exam scheduled', message: `${exam.name} lands on ${exam.date} (mock).` })
  }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Exams" value={exams.length} icon={FileText} hint="All assessments" />
      <StatCard label="Scheduled" value={exams.filter((exam) => exam.status === 'scheduled').length} icon={CalendarDays} tone="info" hint="Upcoming sittings" />
      <StatCard label="Papers graded" value={graded} icon={ClipboardCheck} tone="success" hint="Marks entries" />
      <StatCard label="Average score" value={`${average}%`} icon={TrendingUp} tone={average >= 60 ? 'success' : 'warning'} delta={average - 60} deltaLabel={`${passRate}% pass rate`} />
    </div>
    <Panel flush>
      <div className="ec-card__body">
        <DataTable columns={examColumns} rows={exams} rowKey={(row) => row.id} searchPlaceholder="Search exams…"
          filters={[
            { key: 'status', label: 'All statuses', options: [{ value: 'scheduled', label: 'Scheduled' }, { value: 'ongoing', label: 'Ongoing' }, { value: 'completed', label: 'Completed' }], match: (row, value) => row.status === value },
            { key: 'type', label: 'All types', options: [{ value: 'unit', label: 'Unit test' }, { value: 'midterm', label: 'Midterm' }, { value: 'final', label: 'Final' }, { value: 'quiz', label: 'Quiz' }], match: (row, value) => row.type === value },
          ]}
          emptyTitle="No exams scheduled" emptyMessage="Schedule the first assessment to open the grade book."
          emptyAction={<RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--sm" onClick={() => setCreateOpen(true)}>Schedule exam</button></RoleGate>}
          onRowClick={(row) => setSelectedExamId(row.id)}
          actions={(row) => <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => setSelectedExamId(row.id)}>View marks</button>} />
      </div>
    </Panel>

    <Modal open={Boolean(selectedExam)} title={selectedExam?.name ?? 'Exam'} description={selectedExam ? `${nameOfClass(selectedExam.classId)} · ${nameOfSubject(selectedExam.subjectId)} · ${selectedExam.date}` : ''} onClose={() => setSelectedExamId(null)}
      footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setSelectedExamId(null)}>Close</button><RoleGate roles={staffRoles}><button type="button" className="ec-btn" onClick={() => { setSelectedExamId(null); toast.success({ title: 'Results published', message: 'Parents and students can now view these marks (mock).' }) }}>Publish results</button></RoleGate></>}>
      {selectedExam && (marksFor(selectedExam.id).length === 0
        ? <p className="ec-small ec-muted">No papers graded yet — marks appear once teachers enter scores for this exam.</p>
        : <div className="ec-stack">{marksFor(selectedExam.id).map((mark) => {
            const student = data.students.find((item) => item.id === mark.studentId)
            const percent = Math.round((mark.marksObtained / mark.maxMarks) * 100)
            return <div key={mark.id} className="ec-stack" style={{ gap: 4 }}>
              <div className="ec-row"><strong style={{ fontSize: 13 }}>{student ? `${student.firstName} ${student.lastName}` : mark.studentId}</strong><span className="ec-spacer" /><Badge tone={percent >= 50 ? 'success' : 'danger'}>{mark.marksObtained} / {mark.maxMarks} · {mark.grade}</Badge></div>
              <ProgressBar value={percent} tone={percent >= 50 ? 'success' : 'danger'} />
              <span className="ec-small ec-muted">{mark.remarks}</span>
            </div>
          })}</div>)}
    </Modal>

    <Modal open={createOpen} title="Schedule exam" description="Planned seven days out with the subject's lead teacher as invigilator." onClose={() => setCreateOpen(false)}
      footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setCreateOpen(false)}>Cancel</button><button type="button" className="ec-btn" onClick={saveExam}>Schedule exam</button></>}>
      <FormGrid columns={2}>
        <TextField label="Exam name" name="name" value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} placeholder="Grade 10 Unit Test III" required />
        <SelectField label="Class" name="classId" value={form.classId} onChange={(value) => setForm((prev) => ({ ...prev, classId: value }))} options={data.classes.map((item) => ({ value: item.id, label: item.name }))} />
        <SelectField label="Subject" name="subjectId" value={form.subjectId} onChange={(value) => setForm((prev) => ({ ...prev, subjectId: value }))} options={data.subjects.map((item) => ({ value: item.id, label: `${item.name} (${item.code})` }))} />
        <TextField label="Max marks" name="maxMarks" value={form.maxMarks} onChange={(value) => setForm((prev) => ({ ...prev, maxMarks: value }))} />
        <TextField label="Pass marks" name="passMarks" value={form.passMarks} onChange={(value) => setForm((prev) => ({ ...prev, passMarks: value }))} />
      </FormGrid>
    </Modal>
  </div>
}

