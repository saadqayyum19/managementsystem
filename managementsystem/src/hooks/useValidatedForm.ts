import { useCallback, useMemo, useState } from 'react'

export type SimpleRule = (value: string) => string | undefined
export type ValidationRule<T> = (value: string, values: T) => string | undefined
export type ValidationRules<T> = Partial<Record<keyof T, ValidationRule<T>>>

const required = (label: string): SimpleRule => (value) => value.trim() ? undefined : `${label} is required`
const email = (): SimpleRule => (value) => !value.trim() || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? undefined : 'Enter a valid email address'
const minLength = (length: number, label = 'This field'): SimpleRule => (value) => !value || value.trim().length >= length ? undefined : `${label} needs at least ${length} characters`
const number = (label = 'This field'): SimpleRule => (value) => !value || /^-?\d+(\.\d+)?$/.test(value) ? undefined : `${label} must be a number`
const range = (min: number, max: number, label = 'This field'): SimpleRule => (value) => { const parsed = Number(value); return !value || (parsed >= min && parsed <= max) ? undefined : `${label} must be between ${min} and ${max}` }
const pattern = (regex: RegExp, message: string): SimpleRule => (value) => !value || regex.test(value) ? undefined : message

export const validators = { required, email, minLength, number, range, pattern }

export function chain(...rules: SimpleRule[]): SimpleRule {
  return (value) => { for (const rule of rules) { const message = rule(value); if (message) return message } return undefined }
}

export function useValidatedForm<T extends Record<string, string>>(initialValues: T, rules: ValidationRules<T>) {
  const [values, setValuesState] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const setValue = useCallback((key: keyof T, value: string) => {
    const next = { ...values, [key]: value } as T
    setValuesState(next)
    setTouched((current) => ({ ...current, [key]: true }))
    const rule = rules[key]
    if (rule) setErrors((current) => ({ ...current, [key]: rule(value, next) }))
  }, [rules, values])

  const setMany = useCallback((patch: Partial<T>) => { setValuesState((current) => ({ ...current, ...patch })) }, [])

  const validate = useCallback(() => {
    const nextErrors: Partial<Record<keyof T, string>> = {}
    for (const key of Object.keys(rules) as Array<keyof T>) {
      const rule = rules[key]
      if (!rule) continue
      const message = rule(values[key] ?? '', values)
      if (message) nextErrors[key] = message
    }
    setErrors(nextErrors)
    setSubmitAttempted(true)
    return Object.keys(nextErrors).length === 0
  }, [rules, values])

  const reset = useCallback((next?: T) => { setValuesState(next ?? initialValues); setErrors({}); setTouched({}); setSubmitAttempted(false) }, [initialValues])

  const fieldError = useCallback((key: keyof T) => (submitAttempted || touched[key]) ? errors[key] : undefined, [errors, submitAttempted, touched])

  const isValid = useMemo(() => Object.values(errors).every((message) => !message), [errors])

  return { values, setValue, setMany, validate, reset, fieldError, errors, isValid, submitAttempted }
}
