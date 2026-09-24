import type { ReactNode } from 'react'
import { GraduationCap, ShieldCheck } from 'lucide-react'
import './auth.css'

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="EduCore OS">
        <div className="auth-brand"><span className="auth-brand-mark"><GraduationCap size={22} /></span><strong>EduCore <em>OS</em></strong></div>
        <div className="auth-visual-copy"><span className="auth-kicker">THE SCHOOL OPERATING SYSTEM</span><h1>One clear view of every learner&apos;s journey.</h1><p>Connect your people, programs, and progress in one calm workspace built for modern education.</p></div>
        <div className="auth-trust"><ShieldCheck size={15} /> Secure by design <span>•</span> Built for your institution</div>
      </section>
      <section className="auth-panel"><div className="auth-panel-inner"><div className="auth-mobile-brand"><span className="auth-brand-mark"><GraduationCap size={19} /></span><strong>EduCore <em>OS</em></strong></div><div className="auth-heading"><h2>{title}</h2><p>{subtitle}</p></div>{children}</div></section>
    </main>
  )
}

type AuthFieldProps = { label: string; name: string; type?: string; placeholder?: string; error?: string; register: object }
export function AuthField({ label, name, type = 'text', placeholder, error, register }: AuthFieldProps) {
  return <label className="auth-field"><span>{label}</span><input {...register} name={name} type={type} placeholder={placeholder} aria-invalid={Boolean(error)} />{error && <small>{error}</small>}</label>
}

export function AuthSwitch({ prompt, action, onAction }: { prompt: string; action: string; onAction: () => void }) {
  return <p className="auth-switch">{prompt} <button type="button" onClick={onAction}>{action}</button></p>
}
