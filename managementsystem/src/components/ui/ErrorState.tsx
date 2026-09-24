import { AlertTriangle, RotateCcw } from 'lucide-react'

type ErrorStateProps = { title?: string; message?: string; onRetry?: () => void; retryLabel?: string }

export function ErrorState({ title = 'Something went wrong', message = 'We could not load this data from the mock data layer.', onRetry, retryLabel = 'Try again' }: ErrorStateProps) {
  return <div className="ec-state" role="alert">
    <div className="ec-state__icon ec-state__icon--danger"><AlertTriangle size={20} /></div>
    <strong>{title}</strong>
    <span>{message}</span>
    {onRetry && <button type="button" className="ec-btn ec-btn--ghost" onClick={onRetry}><RotateCcw size={14} /> {retryLabel}</button>}
  </div>
}
