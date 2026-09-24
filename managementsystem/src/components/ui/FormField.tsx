import type { ChangeEvent, ReactNode } from 'react'

export function FormField({ label, htmlFor, error, hint, required = false, children }: { label?: string; htmlFor?: string; error?: string; hint?: string; required?: boolean; children: ReactNode }) {
  return <div className="ec-field">
    {label && <label className="ec-field__label" htmlFor={htmlFor}>{label}{required && <span className="ec-field__req"> *</span>}</label>}
    {children}
    {error ? <span className="ec-field__error" role="alert">! {error}</span> : hint ? <span className="ec-field__hint">{hint}</span> : null}
  </div>
}

type BaseProps = { label?: string; error?: string; hint?: string; required?: boolean; className?: string; placeholder?: string; disabled?: boolean }

export function TextField({ label, name, value, onChange, type = 'text', placeholder, error, hint, required, disabled, className = '' }: BaseProps & { name: string; value: string; onChange: (value: string) => void; type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'tel' }) {
  return <FormField label={label} htmlFor={name} error={error} hint={hint} required={required}>
    <input id={name} name={name} type={type} className={`ec-input ${error ? 'ec-input--error' : ''} ${className}`.trim()} placeholder={placeholder} value={value} disabled={disabled} aria-invalid={Boolean(error)} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)} />
  </FormField>
}

export function SelectField({ label, name, value, onChange, options, error, hint, required, disabled, className = '', placeholder }: BaseProps & { name: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>; placeholder?: string }) {
  return <FormField label={label} htmlFor={name} error={error} hint={hint} required={required}>
    <select id={name} name={name} className={`ec-select ${error ? 'ec-select--error' : ''} ${className}`.trim()} value={value} disabled={disabled} aria-invalid={Boolean(error)} onChange={(event) => onChange(event.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </FormField>
}

export function TextAreaField({ label, name, value, onChange, rows = 4, placeholder, error, hint, required, disabled }: BaseProps & { name: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return <FormField label={label} htmlFor={name} error={error} hint={hint} required={required}>
    <textarea id={name} name={name} rows={rows} className={`ec-textarea ${error ? 'ec-textarea--error' : ''}`.trim()} placeholder={placeholder} value={value} disabled={disabled} aria-invalid={Boolean(error)} onChange={(event) => onChange(event.target.value)} />
  </FormField>
}

export function CheckboxField({ label, checked, onChange, name }: { label: string; checked: boolean; onChange: (checked: boolean) => void; name?: string }) {
  return <label className="ec-checkbox"><input type="checkbox" name={name} checked={checked} onChange={(event) => onChange(event.target.checked)} /> <span>{label}</span></label>
}

export function FormGrid({ children, columns = 2 }: { children: ReactNode; columns?: 1 | 2 | 3 }) {
  return <div className={`ec-grid ec-grid--${columns}`}>{children}</div>
}
