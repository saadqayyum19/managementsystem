import { useState } from 'react'
import { Bot, CheckCircle2, MessageSquare, Star } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, Badge, KeyValue, PageHeader, Panel } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { ChartCard, ChartTooltip, chartAxisProps, chartColors, chartGridProps } from '../../components/ui/ChartCard'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { Modal } from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import type { ChatbotConversation } from '../../mocks/types'

type Turn = { id: string; from: 'user' | 'bot'; body: string }
const roleTone = { student: 'info', parent: 'warning', teacher: 'success', principal: 'neutral', super_admin: 'neutral' } as const

export function AIChatbotPage() {
  const [focus, setFocus] = useState<ChatbotConversation | null>(null)
  const [threads, setThreads] = useState<Record<string, Turn[]>>({})
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['advanced', 'chatbot'], mockApi.aiChatbotBoard)
  const header = <PageHeader eyebrow="Advanced · AI assistant" title="AI chatbot" subtitle="Conversation analytics and transcripts for the always-on assistant. Ships behind the ai_chatbot feature toggle." actions={<button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Chatbot transcripts')}>Export transcripts</button>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={2} height={300} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const { conversations, summary } = data
  const resolvedRate = summary.total === 0 ? 0 : Math.round((summary.resolved / summary.total) * 100)
  const satisfaction = [1, 2, 3, 4, 5].map((score) => ({ score: `${score}★`, count: conversations.filter((conversation) => conversation.satisfaction === score).length }))
  const topics = Array.from(new Set(conversations.map((conversation) => conversation.topic))).map((topic) => ({
    topic: topic.length > 22 ? `${topic.slice(0, 20)}…` : topic,
    turns: conversations.filter((conversation) => conversation.topic === topic).reduce((sum, conversation) => sum + conversation.turns, 0),
  }))
  const columns: Array<DataTableColumn<ChatbotConversation>> = [
    { key: 'topic', header: 'Conversation', render: (row) => <div className="ec-table__primary"><strong>{row.topic}</strong><span>{row.startedAt}</span></div>, searchValue: (row) => `${row.topic} ${row.lastPrompt}` },
    { key: 'user', header: 'User', render: (row) => <div className="ec-row"><Avatar name={nameOf(row.userId)} /><span className="ec-small">{nameOf(row.userId)}</span></div>, searchValue: (row) => `${nameOf(row.userId)} ${row.userRole}` },
    { key: 'role', header: 'Role', render: (row) => <Badge tone={roleTone[row.userRole] ?? 'neutral'}>{row.userRole}</Badge>, searchValue: (row) => row.userRole },
    { key: 'turns', header: 'Turns', align: 'right', render: (row) => row.turns, sortValue: (row) => row.turns },
    { key: 'satisfaction', header: 'CSAT', align: 'right', render: (row) => <span style={{ color: '#d97706' }}>{'★'.repeat(row.satisfaction)}{'☆'.repeat(5 - row.satisfaction)}</span>, sortValue: (row) => row.satisfaction },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={row.resolved ? 'success' : 'warning'} dot>{row.resolved ? 'Resolved' : 'Escalated'}</Badge> },
  ]

  const openThread = (row: ChatbotConversation) => {
    setThreads((prev) => prev[row.id] ? prev : { ...prev, [row.id]: [{ id: 'seed-1', from: 'user', body: row.lastPrompt }, { id: 'seed-2', from: 'bot', body: `Mock assistant reply on "${row.topic}". The production model will be wired through the backend AI gateway.` }] })
    setFocus(row)
  }
  const send = () => {
    if (!focus) return
    const text = (drafts[focus.id] ?? '').trim()
    if (!text) return
    const thread = threads[focus.id] ?? []
    setThreads((prev) => ({ ...prev, [focus.id]: [...thread, { id: `t-${thread.length + 1}`, from: 'user' as const, body: text }, { id: `t-${thread.length + 2}`, from: 'bot' as const, body: `Seeded response about "${focus.topic}" — live answers arrive with the AI service.` }] }))
    setDrafts((prev) => ({ ...prev, [focus.id]: '' }))
    toast.info({ title: 'Mock reply added', message: 'AI responses are stubbed in the mock-only phase.' })
  }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Conversations" value={summary.total} icon={MessageSquare} hint="All channels" />
      <StatCard label="Resolved" value={`${resolvedRate}%`} icon={CheckCircle2} tone={resolvedRate >= 70 ? 'success' : 'warning'} hint={`${summary.resolved} handled end-to-end`} />
      <StatCard label="Average turns" value={summary.averageTurns} icon={Bot} tone="info" hint="Per conversation" />
      <StatCard label="Satisfaction" value={`${summary.averageSatisfaction} / 5`} icon={Star} tone={summary.averageSatisfaction >= 4 ? 'success' : 'warning'} hint="User rated" />
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="Satisfaction ratings" hint="User-rated CSAT across conversations" isEmpty={conversations.length === 0} legend={[{ label: 'Conversations', color: chartColors.primary }]}>
        <BarChart data={satisfaction}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="score" {...chartAxisProps} />
          <YAxis {...chartAxisProps} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="count" name="Conversations" radius={[4, 4, 0, 0]}>{satisfaction.map((entry) => <Cell key={entry.score} fill={entry.score === '1★' || entry.score === '2★' ? chartColors.danger : entry.score === '3★' ? chartColors.warning : chartColors.success} />)}</Bar>
        </BarChart>
      </ChartCard>
      <ChartCard title="Turn volume by topic" hint="Total assistant turns per topic" isEmpty={topics.length === 0} legend={[{ label: 'Turns', color: chartColors.violet }]}>
        <BarChart data={topics} layout="vertical" margin={{ left: 12, right: 12 }}>
          <CartesianGrid {...chartGridProps} />
          <XAxis type="number" {...chartAxisProps} allowDecimals={false} />
          <YAxis type="category" dataKey="topic" width={150} {...chartAxisProps} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="turns" name="Turns" radius={[0, 4, 4, 0]} fill={chartColors.violet} />
        </BarChart>
      </ChartCard>
    </div>
    <Panel title="Escalations to review" hint="Conversations the assistant could not resolve" flush>
      <div className="ec-card__body ec-stack">
        {conversations.filter((conversation) => !conversation.resolved).length === 0 ? <p className="ec-small ec-muted">Every conversation was resolved — no escalations queued.</p> : conversations.filter((conversation) => !conversation.resolved).map((conversation) => <div key={conversation.id} className="ec-row">
          <Avatar name={nameOf(conversation.userId)} />
          <div className="ec-table__primary"><strong>{conversation.topic}</strong><span>{nameOf(conversation.userId)} · {conversation.startedAt}</span></div>
          <span className="ec-spacer" />
          <Badge tone="warning" dot>{conversation.turns} turns</Badge>
          <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => openThread(conversation)}>Open transcript</button>
        </div>)}
      </div>
    </Panel>
    <div style={{ marginBottom: 'var(--ec-space-4)' }}>
      <DataTable columns={columns} rows={conversations} rowKey={(row) => row.id} searchPlaceholder="Search topics, prompts, users…" filters={[{ key: 'resolved', label: 'All conversations', options: [{ value: 'yes', label: 'Resolved' }, { value: 'no', label: 'Escalated' }], match: (row, value) => value === 'yes' ? row.resolved : !row.resolved }, { key: 'role', label: 'All roles', options: (['student', 'parent', 'teacher', 'principal'] as const).map((role) => ({ value: role, label: role })), match: (row, value) => row.userRole === value }]} actions={(row) => <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => openThread(row)}>Transcript</button>} emptyTitle="No conversations" emptyMessage="No chatbot conversations match the current filters." />
    </div>
    <Modal open={focus !== null} title={`Transcript · ${focus?.topic ?? ''}`} description="Mock assistant replies stand in for the AI gateway." onClose={() => setFocus(null)} size="wide" footer={<button type="button" className="ec-btn" onClick={() => setFocus(null)}>Close</button>}>
      {focus && <div className="ec-stack">
        <KeyValue items={[{ label: 'User', value: `${nameOf(focus.userId)} · ${focus.userRole}` }, { label: 'Started', value: focus.startedAt }, { label: 'Turns', value: focus.turns }, { label: 'Satisfaction', value: `${focus.satisfaction} / 5` }, { label: 'Status', value: <Badge tone={focus.resolved ? 'success' : 'warning'} dot>{focus.resolved ? 'Resolved' : 'Escalated'}</Badge> }]} />
        <div className="ec-stack" style={{ maxHeight: 280, overflowY: 'auto' }}>
          {(threads[focus.id] ?? []).map((turn) => <div key={turn.id} className="ec-row" style={{ justifyContent: turn.from === 'user' ? 'flex-start' : 'flex-end' }}>
            <div style={{ background: turn.from === 'user' ? 'var(--ec-primary-soft)' : '#f1f5f9', padding: '8px 12px', borderRadius: 8, maxWidth: '80%', fontSize: 13 }}>
              <strong style={{ display: 'block', fontSize: 11, color: '#64748b' }}>{turn.from === 'user' ? nameOf(focus.userId) : 'AI assistant'}</strong>{turn.body}
            </div>
          </div>)}
        </div>
        <div className="ec-row">
          <input className="ec-input" placeholder="Send a mock follow-up…" value={drafts[focus.id] ?? ''} onChange={(event) => setDrafts((prev) => ({ ...prev, [focus.id]: event.target.value }))} />
          <button type="button" className="ec-btn" onClick={send}>Send</button>
        </div>
      </div>}
    </Modal>
  </div>
}

