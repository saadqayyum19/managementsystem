import type { ReactNode } from 'react'

/* ---------- Panel (card surface) ---------- */
export function Panel({ title, hint, actions, children, flush = false, className = '' }: { title?: string; hint?: string; actions?: ReactNode; children: ReactNode; flush?: boolean; className?: string }) {
  return <section className={`ec-card ${className}`.trim()}>
    {(title || actions) && <div className="ec-card__head"><div>{title && <h2 className="ec-card__title">{title}</h2>}{hint && <p className="ec-card__hint">{hint}</p>}</div>{actions}</div>}
    <div className={flush ? 'ec-card__body--flush' : 'ec-card__body'}>{children}</div>
  </section>
}

/* ---------- Page header ---------- */
export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return <header className="ec-page-header">
    <div>{eyebrow && <p className="ec-eyebrow">{eyebrow}</p>}<h1>{title}</h1>{subtitle && <p className="ec-subtitle">{subtitle}</p>}</div>
    {actions && <div className="ec-header-actions">{actions}</div>}
  </header>
}

/* ---------- Badge ---------- */
export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

export function Badge({ tone = 'neutral', children, dot = false }: { tone?: BadgeTone; children: ReactNode; dot?: boolean }) {
  return <span className={`ec-badge ${tone === 'neutral' ? '' : `ec-badge--${tone}`}`.trim()}>{dot && <i />}{children}</span>
}

/* ---------- Avatar ---------- */
export function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')
  return <span className={`ec-avatar ${size === 'md' ? 'ec-avatar--md' : ''}`.trim()} aria-hidden>{initials}</span>
}

/* ---------- Progress ---------- */
export function ProgressBar({ value, max = 100, tone = 'primary' }: { value: number; max?: number; tone?: 'primary' | 'success' | 'warning' | 'danger' }) {
  const percent = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100))
  return <div className="ec-progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${percent}%`, background: `var(--ec-${tone})` }} /></div>
}

/* ---------- Key/value grid ---------- */
export function KeyValue({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return <dl className="ec-kv">{items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
}

/* ---------- Tabs ---------- */
export function Tabs({ tabs, active, onChange }: { tabs: Array<{ id: string; label: string }>; active: string; onChange: (id: string) => void }) {
  return <div className="ec-tabs" role="tablist">{tabs.map((tab) => <button key={tab.id} type="button" role="tab" className="ec-tab" data-active={tab.id === active} aria-selected={tab.id === active} onClick={() => onChange(tab.id)}>{tab.label}</button>)}</div>
}

/* ---------- Chips (segmented filter) ---------- */
export function ChipRow<T extends string>({ options, value, onChange }: { options: Array<{ value: T; label: string }>; value: T; onChange: (value: T) => void }) {
  return <div className="ec-chips">{options.map((option) => <button key={option.value} type="button" className="ec-chip" data-active={option.value === value} onClick={() => onChange(option.value)}>{option.label}</button>)}</div>
}

/* ---------- Switch ---------- */
export function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return <button type="button" className="ec-switch" data-on={checked} aria-pressed={checked} aria-label={label} onClick={() => onChange(!checked)}><i /></button>
}
