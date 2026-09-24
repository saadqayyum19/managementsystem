import type { ReactNode } from 'react'

type BaseLayoutProps = {
  children: ReactNode
}

export function BaseLayout({ children }: BaseLayoutProps) {
  return <div className="min-h-screen bg-slate-50 text-slate-900">{children}</div>
}
