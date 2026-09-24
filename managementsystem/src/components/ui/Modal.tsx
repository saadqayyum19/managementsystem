import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export type ModalProps = {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  size?: 'md' | 'wide'
  closeOnBackdrop?: boolean
}

export function Modal({ open, title, description, children, footer, onClose, size = 'md', closeOnBackdrop = true }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); return }
    if (event.key !== 'Tab') return
    const panel = panelRef.current
    if (!panel) return
    const items = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector))
    if (items.length === 0) { event.preventDefault(); panel.focus(); return }
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    document.addEventListener('keydown', handleKeyDown, true)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const target = panelRef.current?.querySelector<HTMLElement>(focusableSelector) ?? panelRef.current
    window.setTimeout(() => target?.focus(), 0)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [open, handleKeyDown])

  return createPortal(<AnimatePresence>
    {open && <motion.div className="ec-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }} onMouseDown={(event) => { if (closeOnBackdrop && event.target === event.currentTarget) onClose() }}>
      <motion.div ref={panelRef} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className={`ec-modal ${size === 'wide' ? 'ec-modal--wide' : ''}`.trim()} initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
        <div className="ec-modal__head">
          <div><h2 className="ec-modal__title">{title}</h2>{description && <p className="ec-modal__desc">{description}</p>}</div>
          <button type="button" className="ec-btn ec-btn--icon ec-btn--sm" onClick={onClose} aria-label="Close dialog"><X size={15} /></button>
        </div>
        <div className="ec-modal__body">{children}</div>
        {footer && <div className="ec-modal__foot">{footer}</div>}
      </motion.div>
    </motion.div>}
  </AnimatePresence>, document.body)
}
