import { useState } from 'react'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthField, AuthLayout, AuthSwitch } from './AuthLayout'

const registerSchema = z.object({ firstName: z.string().min(1, 'Enter your first name'), lastName: z.string().min(1, 'Enter your last name'), email: z.string().email('Enter a valid email address'), institutionCode: z.string().min(2, 'Enter your institution code'), password: z.string().min(8, 'Use at least 8 characters'), terms: z.boolean().refine((value) => value, 'Accept the terms to continue') })
export type RegisterValues = z.infer<typeof registerSchema>
type RegisterPageProps = { onLogin?: () => void; onSubmit?: (values: RegisterValues) => Promise<void> | void }

export function RegisterPage({ onLogin, onSubmit }: RegisterPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { firstName: '', lastName: '', email: '', institutionCode: '', password: '', terms: false } })
  const submit = async (values: RegisterValues) => { setIsSubmitting(true); setMessage(''); try { await onSubmit?.(values); setMessage('Account details accepted. Check your email to verify access.') } catch { setMessage('We could not create your account. Please try again.') } finally { setIsSubmitting(false) } }
  return <AuthLayout title="Create your account" subtitle="Join your institution&apos;s EduCore workspace."><form className="auth-form" onSubmit={handleSubmit(submit)}><div className="auth-field-grid"><AuthField label="First name" name="firstName" placeholder="Aisha" register={register('firstName')} error={errors.firstName?.message} /><AuthField label="Last name" name="lastName" placeholder="Rahman" register={register('lastName')} error={errors.lastName?.message} /></div><AuthField label="Work email" name="email" type="email" placeholder="you@institution.edu" register={register('email')} error={errors.email?.message} /><AuthField label="Institution code" name="institutionCode" placeholder="WEST01" register={register('institutionCode')} error={errors.institutionCode?.message} /><AuthField label="Password" name="password" type="password" placeholder="Create a secure password" register={register('password')} error={errors.password?.message} /><label className="checkbox-label terms-label"><input {...register('terms')} type="checkbox" /> <span>I agree to the EduCore terms and privacy policy.</span></label>{errors.terms && <small className="field-error">{errors.terms.message}</small>}{message && <p className="auth-message">{message}</p>}<button className="auth-submit" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="spin" size={17} /> : <ArrowRight size={17} />}{isSubmitting ? 'Creating account...' : 'Create account'}</button></form><AuthSwitch prompt="Already have an account?" action="Sign in" onAction={() => onLogin?.()} /></AuthLayout>
}
