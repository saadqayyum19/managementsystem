import { useMemo, useState } from 'react'
import { BookOpen, GraduationCap, Layers, Users } from 'lucide-react'
import { Badge, PageHeader, Panel, Tabs } from '../../components/ui/primitives'
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
import type { UserRole } from '../../store/authSlice'

const staffRoles: UserRole[] = ['super_admin', 'principal', 'teacher']
type ExtraClass = { id: string; name: string; grade: number; room: string; capacity: number; classTeacherId: string; sectionIds: string[]; subjectIds: string[]; studentCount: number }

export function AcademicStructurePage() {
  const [tab, setTab] = useState('classes')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', grade: '6', room: '', capacity: '30' })
  const [formError, setFormError] = useState('')
  const [extraClasses, setExtraClasses] = useState<ExtraClass[]>([])
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['academic-structure'], mockApi.academicStructure)

  const header = <PageHeader eyebrow="Academics · structure" title="Academic structure" subtitle="Classes, sections and subjects for the 2026 / 2027 session." actions={<>
    <RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Academic structure')}>Export</button></RoleGate>
    <RoleGate roles={staffRoles}><button type="button" className="ec-btn" onClick={() => { setForm({ name: '', grade: '6', room: '', capacity: '30' }); setFormError(''); setModalOpen(true) }}>New class</button></RoleGate>
  </>} />

  const data = query.data
  const classes = useMemo(() => (data ? [...data.classes, ...extraClasses] : extraClasses), [data, extraClasses])

  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={280} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const classCount = (classId: string) => extraClasses.some((row) => row.id === classId) ? 0 : data.students.filter((student) => student.classId === classId).length
  const nameOfClass = (classId: string) => data.classes.find((item) => item.id === classId)?.name ?? classId

  const classColumns: Array<DataTableColumn<(typeof classes)[number]>> = [
    { key: 'name', header: 'Class', render: (row) => <div className="ec-table__primary"><strong>{row.name}</strong><span>{row.room}</span></div>, sortValue: (row) => row.grade },
    { key: 'teacher', header: 'Class teacher', render: (row) => nameOf(row.classTeacherId), searchValue: (row) => nameOf(row.classTeacherId) },
    { key: 'sections', header: 'Sections', align: 'right', render: (row) => row.sectionIds.length, sortValue: (row) => row.sectionIds.length },
    { key: 'subjects', header: 'Subjects', align: 'right', render: (row) => row.subjectIds.length, sortValue: (row) => row.subjectIds.length },
    { key: 'students', header: 'Students', align: 'right', render: (row) => classCount(row.id), sortValue: (row) => classCount(row.id) },
    { key: 'capacity', header: 'Capacity', render: (row) => `${classCount(row.id)} / ${row.capacity}` },
  ]
  const subjectColumns: Array<DataTableColumn<(typeof data.subjects)[number]>> = [
    { key: 'code', header: 'Code', render: (row) => <Badge tone="info">{row.code}</Badge> },
    { key: 'name', header: 'Subject', render: (row) => <strong>{row.name}</strong>, sortValue: (row) => row.name },
    { key: 'type', header: 'Type', render: (row) => <Badge tone={row.type === 'core' ? 'success' : 'warning'}>{row.type}</Badge> },
    { key: 'periods', header: 'Periods / week', align: 'right', render: (row) => row.weeklyPeriods, sortValue: (row) => row.weeklyPeriods },
    { key: 'teacher', header: 'Lead teacher', render: (row) => nameOf(row.teacherIds[0] ?? null), searchValue: (row) => row.teacherIds.map(nameOf).join(' ') },
    { key: 'classes', header: 'Taught in', align: 'right', render: (row) => row.classIds.length, sortValue: (row) => row.classIds.length },
  ]
  const sectionColumns: Array<DataTableColumn<(typeof data.sections)[number]>> = [
    { key: 'name', header: 'Section', render: (row) => <strong>{nameOfClass(row.classId)} · {row.name}</strong>, searchValue: (row) => `${nameOfClass(row.classId)} ${row.name}` },
    { key: 'room', header: 'Room', render: (row) => row.room },
    { key: 'class', header: 'Class ID', render: (row) => <span className="ec-small ec-muted">{row.classId}</span> },
  ]

  const saveClass = () => {
    if (!form.name.trim()) { setFormError('Class name is required.'); return }
    setExtraClasses((rows) => [...rows, { id: `cls-x${rows.length + 1}`, name: form.name.trim(), grade: Number(form.grade) || 6, room: form.room.trim() || 'TBD', capacity: Number(form.capacity) || 30, classTeacherId: 'tch-01', sectionIds: ['sec-01'], subjectIds: [], studentCount: 0 }])
    setModalOpen(false)
    toast.success({ title: 'Class created', message: `${form.name.trim()} was added to the structure (mock).` })
  }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Classes" value={classes.length} icon={Layers} hint="Grade 6 – 10" />
      <StatCard label="Students" value={data.students.length} icon={Users} tone="success" delta={6.4} deltaLabel="vs last session" />
      <StatCard label="Subjects" value={data.subjects.length} icon={BookOpen} tone="warning" hint="Core + electives" />
      <StatCard label="Teachers" value={data.teachers.length} icon={GraduationCap} tone="info" hint="Active faculty" />
    </div>
    <Panel flush>
      <div className="ec-card__body">
        <Tabs tabs={[{ id: 'classes', label: `Classes (${classes.length})` }, { id: 'sections', label: `Sections (${data.sections.length})` }, { id: 'subjects', label: `Subjects (${data.subjects.length})` }]} active={tab} onChange={setTab} />
        <div style={{ paddingTop: 'var(--ec-space-4)' }}>
          {tab === 'classes' && <DataTable columns={classColumns} rows={classes} rowKey={(row) => row.id} searchPlaceholder="Search classes, rooms, teachers…" emptyTitle="No classes yet" emptyMessage="Create the first class to start building the academic structure." emptyAction={<RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--sm" onClick={() => setModalOpen(true)}>New class</button></RoleGate>} />}
          {tab === 'sections' && <DataTable columns={sectionColumns} rows={data.sections} rowKey={(row) => row.id} searchPlaceholder="Search sections…" emptyTitle="No sections configured" />}
          {tab === 'subjects' && <DataTable columns={subjectColumns} rows={data.subjects} rowKey={(row) => row.id} searchPlaceholder="Search subjects…" filters={[{ key: 'type', label: 'All types', options: [{ value: 'core', label: 'Core' }, { value: 'elective', label: 'Elective' }], match: (row, value) => row.type === value }]} emptyTitle="No subjects configured" />}
        </div>
      </div>
    </Panel>
    <Modal open={modalOpen} title="Create class" description="Adds a class to the structure for this demo session." onClose={() => setModalOpen(false)}
      footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setModalOpen(false)}>Cancel</button><button type="button" className="ec-btn" onClick={saveClass}>Create class</button></>}>
      <FormGrid columns={2}>
        <TextField label="Class name" name="name" value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} error={formError} placeholder="Grade 11A" required />
        <SelectField label="Grade" name="grade" value={form.grade} onChange={(value) => setForm((prev) => ({ ...prev, grade: value }))} options={[6, 7, 8, 9, 10, 11, 12].map((grade) => ({ value: String(grade), label: `Grade ${grade}` }))} />
        <TextField label="Room" name="room" value={form.room} onChange={(value) => setForm((prev) => ({ ...prev, room: value }))} placeholder="R-301" />
        <TextField label="Capacity" name="capacity" value={form.capacity} onChange={(value) => setForm((prev) => ({ ...prev, capacity: value }))} hint="Maximum students" />
      </FormGrid>
    </Modal>

  </div>
}
