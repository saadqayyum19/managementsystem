import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type EmptyStateProps = { icon?: LucideIcon; title: string; message?: string; action?: ReactNode }

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return <div className="ec-state">
    <div className="ec-state__icon">{Icon ? <Icon size={20} /> : <span aria-hidden>∅</span>}</div>
    <strong>{title}</strong>
    {message && <span>{message}</span>}
    {action}
  </div>
}
