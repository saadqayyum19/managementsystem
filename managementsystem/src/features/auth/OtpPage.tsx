import { useState } from 'react'
import { ArrowLeft, ArrowRight, LoaderCircle, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from './AuthLayout'

const otpSchema = z.object({ otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code') })
export type OtpValues = z.infer<typeof otpSchema>
type OtpPageProps = { email: string; onBack?: () => void; onSubmit?: (values: OtpValues) => Promise<void> | void; onResend?: () => Promise<void> | void }

export function OtpPage({ email, onBack, onSubmit, onResend }: OtpPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm<OtpValues>({ resolver: zodResolver(otpSchema), defaultValues: { otp: '' } })
  const submit = async (values: OtpValues) => { setIsSubmitting(true); setMessage(''); try { await onSubmit?.(values) } catch { setMessage('That code is not valid. Request a new one and try again.') } finally { setIsSubmitting(false) } }
  const resend = async () => { setResending(true); setMessage(''); try { await onResend?.(); setMessage('A new code has been sent.') } finally { setResending(false) } }
  return <AuthLayout title="Verify your identity" subtitle={`Enter the code we sent to ${email}.`}><form className="auth-form" onSubmit={handleSubmit(submit)}><div className="otp-intro"><div className="auth-success-icon"><ShieldCheck size={21} /></div><p>For your security, this code expires in 10 minutes.</p></div><label className="auth-field"><span>6-digit verification code</span><input {...register('otp')} className="otp-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" aria-invalid={Boolean(errors.otp)} />{errors.otp && <small>{errors.otp.message}</small>}</label>{message && <p className="auth-message">{message}</p>}<button className="auth-submit" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="spin" size={17} /> : <ArrowRight size={17} />}{isSubmitting ? 'Verifying...' : 'Verify code'}</button><button type="button" className="back-link" onClick={onBack}><ArrowLeft size={15} /> Use a different email</button></form><p className="auth-switch">Didn&apos;t receive a code? <button type="button" onClick={resend} disabled={resending}>{resending ? 'Sending...' : 'Resend code'}</button></p></AuthLayout>
}
