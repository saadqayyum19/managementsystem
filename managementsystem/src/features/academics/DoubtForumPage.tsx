import { useState } from 'react'
import { CheckCircle2, HelpCircle, MessageCircle, Send } from 'lucide-react'
import { Badge, PageHeader, Panel } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { Modal } from '../../components/ui/Modal'
import { FormGrid, TextAreaField } from '../../components/ui/FormField'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { RoleGate } from '../../components/ui/RoleGate'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import { isoDate, TODAY } from '../../mocks/seed'
import type { DoubtReply, DoubtThread, Role } from '../../mocks/types'
import { useAppSelector } from '../../store'
import type { UserRole } from '../../store/authSlice'

const staffRoles: UserRole[] = ['super_admin', 'principal', 'teacher']
const statusTone = { open: 'warning', answered: 'success', closed: 'neutral' } as const

export function DoubtForumPage() {
  const user = useAppSelector((state) => state.auth.user)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [extraReplies, setExtraReplies] = useState<Record<string, DoubtReply[]>>({})
  const [statusOverrides, setStatusOverrides] = useState<Record<string, DoubtThread['status']>>({})
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['doubt-forum'], mockApi.doubtForumBoard)

  const header = <PageHeader eyebrow="Academics · doubts" title="Doubt forum" subtitle="Ask, answer and upvote — every thread traced to a subject and mentor." actions={<RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Forum threads')}>Export</button></RoleGate>} />

  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={320} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const statusOf = (thread: DoubtThread): DoubtThread['status'] => statusOverrides[thread.id] ?? thread.status
  const repliesOf = (thread: DoubtThread): DoubtReply[] => [...thread.replies, ...(extraReplies[thread.id] ?? [])]
  const threads = data.threads
  const subjectName = (id: string) => data.subjects.find((item) => item.id === id)?.name ?? id
  const selected = threads.find((thread) => thread.id === selectedId) ?? null
  const openCount = threads.filter((thread) => statusOf(thread) === 'open').length
  const answeredCount = threads.filter((thread) => statusOf(thread) === 'answered').length
  const replyCount = threads.reduce((sum, thread) => sum + repliesOf(thread).length, 0)

  const columns: Array<DataTableColumn<(typeof threads)[number]>> = [
    { key: 'title', header: 'Thread', render: (row) => <div className="ec-table__primary"><strong>{row.title}</strong><span>{subjectName(row.subjectId)}</span></div>, searchValue: (row) => `${row.title} ${subjectName(row.subjectId)} ${row.body}` },
    { key: 'askedBy', header: 'Asked by', render: (row) => nameOf(row.studentId), searchValue: (row) => nameOf(row.studentId) },
    { key: 'mentor', header: 'Mentor', render: (row) => (row.teacherId ? nameOf(row.teacherId) : <span className="ec-small ec-muted">Unassigned</span>), searchValue: (row) => (row.teacherId ? nameOf(row.teacherId) : 'unassigned') },
    { key: 'replies', header: 'Replies', align: 'right', render: (row) => repliesOf(row).length, sortValue: (row) => repliesOf(row).length },
    { key: 'created', header: 'Asked', render: (row) => row.createdAt, sortValue: (row) => row.createdAt },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={statusTone[statusOf(row)]} dot>{statusOf(row)}</Badge> },
  ]

  const sendReply = () => {
    if (!selected) return
    if (!reply.trim()) { toast.error({ title: 'Reply is empty', message: 'Write something before posting.' }); return }
    const entry: DoubtReply = { id: `reply-${Date.now()}`, authorId: user?.id ?? 'usr-student', authorRole: (user?.role ?? 'student') as Role, body: reply.trim(), createdAt: isoDate(TODAY), upvotes: 0 }
    setExtraReplies((prev) => ({ ...prev, [selected.id]: [...(prev[selected.id] ?? []), entry] }))
    setReply('')
    toast.success({ title: 'Reply posted', message: 'Your answer is now visible in the thread.' })
  }

  const markAnswered = (thread: DoubtThread) => {
    setStatusOverrides((prev) => ({ ...prev, [thread.id]: 'answered' }))
    toast.success({ title: 'Thread resolved', message: `${thread.title} marked as answered.` })
  }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Threads" value={threads.length} icon={MessageCircle} hint="All subjects" />
      <StatCard label="Open" value={openCount} icon={HelpCircle} tone={openCount > 0 ? 'warning' : 'success'} hint="Needs an answer" />
      <StatCard label="Answered" value={answeredCount} icon={CheckCircle2} tone="success" hint="Resolved by mentors" />
      <StatCard label="Replies" value={replyCount} icon={Send} tone="info" hint="Community contributions" />
    </div>
    <Panel flush>
      <div className="ec-card__body">
        <DataTable columns={columns} rows={threads} rowKey={(row) => row.id} searchPlaceholder="Search threads…"
          filters={[{ key: 'status', label: 'All statuses', options: [{ value: 'open', label: 'Open' }, { value: 'answered', label: 'Answered' }, { value: 'closed', label: 'Closed' }], match: (row, value) => statusOf(row) === value }]}
          emptyTitle="No doubts posted" emptyMessage="The forum is quiet — post the first question to get help moving."
          onRowClick={(row) => setSelectedId(row.id)}
          actions={(row) => <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => setSelectedId(row.id)}>Open</button>} />
      </div>
    </Panel>

    <Modal open={Boolean(selected)} title={selected?.title ?? 'Thread'} description={selected ? `${subjectName(selected.subjectId)} · asked by ${nameOf(selected.studentId)} on ${selected.createdAt}` : ''} onClose={() => { setSelectedId(null); setReply('') }}
      footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => { setSelectedId(null); setReply('') }}>Close</button>{selected && statusOf(selected) !== 'answered' && <RoleGate roles={staffRoles}><button type="button" className="ec-btn" onClick={() => { markAnswered(selected); setSelectedId(null) }}>Mark answered</button></RoleGate>}</>}>
      {selected && <>
        <p style={{ marginBottom: 12, fontSize: 13, color: '#334155' }}>{selected.body}</p>
        <div className="ec-stack" style={{ marginBottom: 12 }}>
          {repliesOf(selected).length === 0
            ? <p className="ec-small ec-muted">No replies yet — be the first to help.</p>
            : repliesOf(selected).map((item) => <div key={item.id} style={{ borderBottom: '1px solid #eef2f7', paddingBottom: 6, marginBottom: 6 }}>
                <div className="ec-row"><strong style={{ fontSize: 13 }}>{nameOf(item.authorId)}</strong><Badge tone={item.authorRole === 'teacher' ? 'info' : 'neutral'}>{item.authorRole}</Badge><span className="ec-spacer" /><span className="ec-small ec-muted">{item.createdAt} · ▲ {item.upvotes}</span></div>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#334155' }}>{item.body}</p>
              </div>)}
        </div>
        <FormGrid columns={1}>
          <TextAreaField label="Your reply" name="reply" value={reply} onChange={setReply} placeholder="Explain the concept or share a resource…" />
        </FormGrid>
        <button type="button" className="ec-btn" onClick={sendReply} style={{ marginTop: 8 }}><Send size={14} /> Post reply</button>
      </>}
    </Modal>
  </div>
}

