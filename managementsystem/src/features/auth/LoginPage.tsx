import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthField, AuthLayout, AuthSwitch } from './AuthLayout'

const loginSchema = z.object({ email: z.string().email('Enter a valid email address'), password: z.string().min(8, 'Use at least 8 characters') })
export type LoginValues = z.infer<typeof loginSchema>

type LoginPageProps = { onForgotPassword?: () => void; onRegister?: () => void; onSubmit?: (values: LoginValues) => Promise<void> | void; demoAccounts?: Array<{ label: string; email: string; password: string }> }

export function LoginPage({ onForgotPassword, onRegister, onSubmit, demoAccounts }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })
  const useDemo = (email: string, password: string) => { setValue('email', email, { shouldValidate: true }); setValue('password', password, { shouldValidate: true }); setMessage('Demo credentials filled — press sign in.') }
  const submit = async (values: LoginValues) => { setIsSubmitting(true); setMessage(''); try { await onSubmit?.(values); setMessage('Welcome back. Your workspace is ready.'); } catch { setMessage('We could not sign you in. Check your details and try again.') } finally { setIsSubmitting(false) } }
  return <AuthLayout title="Welcome back" subtitle="Sign in to continue to your EduCore workspace."><form className="auth-form" onSubmit={handleSubmit(submit)}><AuthField label="Work email" name="email" type="email" placeholder="you@institution.edu" register={register('email')} error={errors.email?.message} /><label className="auth-field"><span>Password</span><div className="password-input"><input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Enter your password" aria-invalid={Boolean(errors.password)} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{errors.password && <small>{errors.password.message}</small>}</label><div className="auth-form-row"><label className="checkbox-label"><input type="checkbox" /> <span>Remember me</span></label><button type="button" className="auth-link" onClick={onForgotPassword}>Forgot password?</button></div>{message && <p className="auth-message">{message}</p>}<button className="auth-submit" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="spin" size={17} /> : <ArrowRight size={17} />}{isSubmitting ? 'Signing in...' : 'Sign in'}</button>{demoAccounts && demoAccounts.length > 0 && <div className="auth-demo"><p>Mock sign-in — one demo account per role</p><div className="auth-demo-grid">{demoAccounts.map((account) => <button key={account.email} type="button" className="auth-demo-button" onClick={() => useDemo(account.email, account.password)}><strong>{account.label}</strong><span>{account.email}</span></button>)}</div><small>Every demo account uses the password {demoAccounts[0].password}</small></div>}</form><AuthSwitch prompt="New to EduCore?" action="Create an account" onAction={() => onRegister?.()} /></AuthLayout>
}
