import { useState } from 'react'
import { ArrowLeft, ArrowRight, Mail, LoaderCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthField, AuthLayout } from './AuthLayout'

const forgotSchema = z.object({ email: z.string().email('Enter a valid email address') })
export type ForgotValues = z.infer<typeof forgotSchema>
type ForgotPasswordPageProps = { onBack?: () => void; onSubmit?: (values: ForgotValues) => Promise<void> | void }

export function ForgotPasswordPage({ onBack, onSubmit }: ForgotPasswordPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema), defaultValues: { email: '' } })
  const submit = async (values: ForgotValues) => { setIsSubmitting(true); try { await onSubmit?.(values); setSent(true) } finally { setIsSubmitting(false) } }
  return <AuthLayout title={sent ? 'Check your inbox' : 'Reset your password'} subtitle={sent ? 'We sent password reset instructions to your email address.' : 'Enter your work email and we&apos;ll help you get back in.'}>{sent ? <div className="auth-success"><div className="auth-success-icon"><Mail size={22} /></div><p>If an EduCore account exists for that email, you&apos;ll receive a secure reset link shortly.</p><button className="auth-submit" onClick={onBack}><ArrowLeft size={17} /> Back to sign in</button></div> : <form className="auth-form" onSubmit={handleSubmit(submit)}><AuthField label="Work email" name="email" type="email" placeholder="you@institution.edu" register={register('email')} error={errors.email?.message} /><button className="auth-submit" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="spin" size={17} /> : <ArrowRight size={17} />}{isSubmitting ? 'Sending...' : 'Send reset link'}</button><button type="button" className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to sign in</button></form>}</AuthLayout>
}
