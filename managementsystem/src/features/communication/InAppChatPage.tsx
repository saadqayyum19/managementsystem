import { useEffect, useMemo, useState } from 'react'
import { Bot, MessageCircle, Send, Users } from 'lucide-react'
import { Avatar, Badge, PageHeader, Panel } from '../../components/ui/primitives'
import { StatCard } from '../../components/ui/StatCard'
import { useToast } from '../../components/ui/Toast'
import { useMockQuery } from '../../hooks/useMockQuery'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import { isoDateTime, TODAY } from '../../mocks/seed'
import type { ChatMessage } from '../../mocks/types'
import { useAppSelector } from '../../store'

export function InAppChatPage() {
  const user = useAppSelector((state) => state.auth.user)
  const [activeId, setActiveId] = useState('')
  const [body, setBody] = useState('')
  const [typing, setTyping] = useState(false)
  const [localMessages, setLocalMessages] = useState<Record<string, ChatMessage[]>>({})
  const toast = useToast()
  const query = useMockQuery(['chat'], mockApi.chatBoard)
  const data = query.data
  const threads = data?.threads ?? []
  const active = threads.find((thread) => thread.id === activeId) ?? threads[0] ?? null
  const messages = active ? [...active.messages, ...(localMessages[active.id] ?? [])] : []
  const stats = useMemo(() => ({ groups: threads.filter((thread) => thread.type === 'group').length, unread: threads.reduce((sum, thread) => sum + thread.unreadCount, 0) }), [threads])
  const header = <PageHeader eyebrow="Communication · chat" title="In-app chat" subtitle="Direct and group conversations with simulated mock typing." />

  useEffect(() => {
    if (!active || !typing || !data || data.autoReplies.length === 0) return
    const timer = window.setTimeout(() => {
      const reply = data.autoReplies[messages.length % data.autoReplies.length]
      setLocalMessages((current) => ({ ...current, [active.id]: [...(current[active.id] ?? []), { id: `msg-x${Date.now()}`, threadId: active.id, senderId: active.participantIds.find((id) => id !== user?.id) ?? active.participantIds[0], body: reply, sentAt: isoDateTime(TODAY), read: true, attachmentName: null }] }))
      setTyping(false)
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [active, data, messages.length, typing, user?.id])

  const send = () => {
    if (!active || !body.trim()) return
    const message: ChatMessage = { id: `msg-x${Date.now()}`, threadId: active.id, senderId: user?.id ?? 'usr-principal', body: body.trim(), sentAt: isoDateTime(TODAY), read: true, attachmentName: null }
    setLocalMessages((current) => ({ ...current, [active.id]: [...(current[active.id] ?? []), message] })); setBody(''); setTyping(true)
    toast.success({ title: 'Message sent', message: `Delivered in ${active.name} (mock).` })
  }
  return <div className="ec-page">{header}
    <div className="ec-grid ec-grid--3" style={{ marginBottom: 'var(--ec-space-4)' }}><StatCard label="Conversations" value={threads.length} icon={MessageCircle} tone="info" /><StatCard label="Group chats" value={stats.groups} icon={Users} tone="success" /><StatCard label="Unread" value={stats.unread} icon={Bot} tone="warning" /></div>
    <Panel><div className="ec-chat-layout">
      <aside className="ec-chat-list">{threads.map((thread) => <button type="button" key={thread.id} className="ec-chat-thread" data-active={thread.id === active?.id} onClick={() => { setActiveId(thread.id); setTyping(false) }}><Avatar name={thread.name} /><span><strong>{thread.name}</strong><small>{thread.messages[thread.messages.length - 1]?.body}</small></span>{thread.unreadCount > 0 && <i>{thread.unreadCount}</i>}</button>)}</aside>
      <section className="ec-chat-window">{active ? <><header className="ec-chat-window__head"><div><h2>{active.name}</h2><span>{active.participantIds.map(nameOf).join(', ')}</span></div><Badge tone={active.type === 'group' ? 'info' : 'success'}>{active.type}</Badge></header><div className="ec-chat-messages">{messages.length === 0 ? <div className="ec-chat-empty">Start the conversation.</div> : messages.map((message) => { const own = message.senderId === user?.id; return <div className="ec-chat-bubble" data-own={own} key={message.id}><small>{own ? 'You' : nameOf(message.senderId)} · {message.sentAt.slice(11)}</small><p>{message.body}</p></div> })}{typing && <div className="ec-typing">Simulated reply typing…</div>}</div><div className="ec-chat-composer"><input className="ec-input" value={body} onChange={(event) => setBody(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') send() }} placeholder={`Message ${active.name}`} maxLength={500} /><button type="button" className="ec-btn" onClick={send} disabled={!body.trim()}><Send size={14} /> Send</button></div></> : <div className="ec-chat-empty">No conversations available.</div>}</section>
    </div></Panel>
  </div>
}
