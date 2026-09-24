import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'

export type ToastTone = 'success' | 'error' | 'info' | 'warning'
export type ToastItem = { id: string; tone: ToastTone; title: string; message?: string }
type ToastInput = { title: string; message?: string }

type ToastApi = {
  push: (tone: ToastTone, input: ToastInput) => void
  success: (input: ToastInput | string) => void
  error: (input: ToastInput | string) => void
  info: (input: ToastInput | string) => void
  warning: (input: ToastInput | string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

function normalise(input: ToastInput | string): ToastInput {
  return typeof input === 'string' ? { title: input } : input
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const dismiss = useCallback((id: string) => setItems((current) => current.filter((item) => item.id !== id)), [])
  const push = useCallback((tone: ToastTone, input: ToastInput) => {
    counter.current += 1
    const id = `toast-${counter.current}-${Date.now()}`
    const payload = normalise(input)
    setItems((current) => [...current, { id, tone, ...payload }])
    window.setTimeout(() => dismiss(id), 4500)
  }, [dismiss])

  const api = useMemo<ToastApi>(() => ({
    push, dismiss,
    success: (input) => push('success', normalise(input)),
    error: (input) => push('error', normalise(input)),
    info: (input) => push('info', normalise(input)),
    warning: (input) => push('warning', normalise(input)),
  }), [push, dismiss])

  return <ToastContext.Provider value={api}>
    {children}
    <Toaster items={items} onDismiss={dismiss} />
  </ToastContext.Provider>
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}

const icons: Record<ToastTone, typeof Info> = { success: CheckCircle2, error: XCircle, info: Info, warning: AlertTriangle }

export function Toaster({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: string) => void }) {
  return <div className="ec-toaster" role="status" aria-live="polite">
    <AnimatePresence initial={false}>
      {items.map((item) => {
        const Icon = icons[item.tone]
        return <motion.div key={item.id} className={`ec-toast ec-toast--${item.tone}`} initial={{ opacity: 0, x: 24, scale: 0.98 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 24, scale: 0.98 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
          <Icon size={16} className={`ec-toast__icon--${item.tone}`} />
          <div style={{ flex: 1 }}><strong>{item.title}</strong>{item.message && <span>{item.message}</span>}</div>
          <button type="button" className="ec-btn ec-btn--icon ec-btn--sm" onClick={() => onDismiss(item.id)} aria-label="Dismiss notification"><X size={13} /></button>
        </motion.div>
      })}
    </AnimatePresence>
  </div>
}
