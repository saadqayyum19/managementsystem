import { useState } from 'react'
import { BookMarked, CalendarCheck, CheckCircle2, MessageCircleQuestion } from 'lucide-react'
import { Badge, PageHeader, Panel } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useToast } from '../../components/ui/Toast'
import { mockApi } from '../../services/mockApi'
import { useAppSelector } from '../../store'
import type { WorkspaceTask } from '../../mocks/types'

export function TeacherWorkspacePage() {
  const user = useAppSelector((state) => state.auth.user)
  const teacherId = user?.id.startsWith('tch-') ? user.id : 'tch-01'
  const [done, setDone] = useState<Record<string, boolean>>({})
  const toast = useToast()
  const query = useMockQuery(['workspace', teacherId], () => mockApi.teacherWorkspace(teacherId))
  const header = <PageHeader eyebrow="Operations · workspace" title="Teacher workspace" subtitle="Your teaching schedule, grading queue, assignments and student questions." />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={320} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>
  const isDone = (task: WorkspaceTask) => done[task.id] ?? task.done
  const tasks = data.tasks
  const columns: Array<DataTableColumn<WorkspaceTask>> = [
    { key: 'task', header: 'Task', render: (row) => <div className="ec-table__primary"><strong>{row.title}</strong><span>{row.module}</span></div>, searchValue: (row) => `${row.title} ${row.module}` },
    { key: 'priority', header: 'Priority', render: (row) => <Badge tone={row.priority === 'high' ? 'danger' : row.priority === 'normal' ? 'info' : 'neutral'}>{row.priority}</Badge> },
    { key: 'due', header: 'Due', render: (row) => row.dueDate, sortValue: (row) => row.dueDate },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={isDone(row) ? 'success' : 'warning'} dot>{isDone(row) ? 'done' : 'pending'}</Badge> },
  ]
  return <div className="ec-page">{header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Periods" value={data.slots.length} icon={CalendarCheck} hint="This week" />
      <StatCard label="Open tasks" value={data.tasks.filter((task) => !isDone(task)).length} icon={CheckCircle2} tone="warning" />
      <StatCard label="Assignments" value={data.assignments.length} icon={BookMarked} tone="info" />
      <StatCard label="Doubt threads" value={data.doubts.length} icon={MessageCircleQuestion} tone="success" />
    </div>
    <div className="ec-grid ec-grid--2">
      <Panel flush><div className="ec-card__body"><DataTable columns={columns} rows={tasks} rowKey={(row) => row.id} searchPlaceholder="Search tasks…" filters={[{ key: 'priority', label: 'All priorities', options: ['low', 'normal', 'high'].map((value) => ({ value, label: value })), match: (row, value) => row.priority === value }]} emptyTitle="No tasks" actions={(row) => <button type="button" className="ec-btn ec-btn--sm" onClick={() => { const value = !isDone(row); setDone((prev) => ({ ...prev, [row.id]: value })); toast.success({ title: value ? 'Task completed' : 'Task reopened', message: row.title }) }}>{isDone(row) ? 'Reopen' : 'Complete'}</button>} /></div></Panel>
      <Panel title="Teaching this week" hint="Your first timetable slots"><div className="ec-stack">{data.slots.slice(0, 6).map((slot) => <div className="ec-row" key={slot.id}><Badge tone="info">Period {slot.period}</Badge><span className="ec-spacer" /><strong>{slot.startTime}–{slot.endTime}</strong><span className="ec-small ec-muted">{slot.room}</span></div>)}</div></Panel>
    </div>
  </div>
}
