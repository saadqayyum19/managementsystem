import { useState } from 'react'
import { Building2, CalendarRange, GraduationCap, Users } from 'lucide-react'
import { Badge, PageHeader, Panel } from '../../components/ui/primitives'
import { FormGrid, SelectField, TextField } from '../../components/ui/FormField'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { useMockQuery } from '../../hooks/useMockQuery'
import { mockApi } from '../../services/mockApi'
import type { Institution } from '../../mocks/types'

export function InstitutionSetupPage() {
  const [draft, setDraft] = useState<Partial<Institution>>({})
  const toast = useToast()
  const query = useMockQuery(['system', 'institution'], mockApi.institutionSetup)
  const header = <PageHeader eyebrow="System · institution" title="Institution setup" subtitle="Core identity, contact details and academic configuration for this workspace." />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={320} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const profile: Institution = { ...data.institution, ...draft }
  const set = (patch: Partial<Institution>) => setDraft((prev) => ({ ...prev, ...patch }))
  const save = () => { setDraft(profile); toast.success({ title: 'Institution saved', message: `${profile.name} configuration updated in the mock store.` }) }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Students" value={data.stats.students} icon={Users} hint="Active enrolment" />
      <StatCard label="Teachers" value={data.stats.teachers} icon={GraduationCap} tone="success" hint="Faculty on roll" />
      <StatCard label="Classes" value={data.stats.classes} icon={Building2} tone="info" hint="Across all grades" />
      <StatCard label="Subjects" value={data.stats.subjects} icon={CalendarRange} tone="warning" hint={`${profile.termsPerYear} terms per year`} />
    </div>
    <div className="ec-grid ec-grid--sidebar">
      <Panel title="Institution identity" hint="Shown on reports, ID cards and guardian communications" actions={<Badge tone="info">{profile.plan} plan</Badge>}>
        <FormGrid columns={2}>
          <TextField label="Institution name" name="institution-name" value={profile.name} onChange={(name) => set({ name })} required />
          <TextField label="Institution code" name="institution-code" value={profile.code} onChange={(code) => set({ code })} required />
          <TextField label="Phone" name="institution-phone" type="tel" value={profile.phone} onChange={(phone) => set({ phone })} />
          <TextField label="Email" name="institution-email" type="email" value={profile.email} onChange={(email) => set({ email })} />
          <TextField label="Website" name="institution-website" value={profile.website} onChange={(website) => set({ website })} />
          <TextField label="Principal" name="institution-principal" value={profile.principalName} onChange={(principalName) => set({ principalName })} />
          <TextField label="Address" name="institution-address" value={profile.address} onChange={(address) => set({ address })} />
          <TextField label="City" name="institution-city" value={profile.city} onChange={(city) => set({ city })} />
          <TextField label="Country" name="institution-country" value={profile.country} onChange={(country) => set({ country })} />
          <TextField label="Established" name="institution-established" type="number" value={String(profile.established)} onChange={(established) => set({ established: Number(established) })} />
        </FormGrid>
      </Panel>
      <div className="ec-stack">
        <Panel title="Brand preview" hint="Logo initials used across generated documents">
          <div className="ec-row">
            <span className="ec-avatar ec-avatar--md" aria-hidden>{profile.logoInitials}</span>
            <div className="ec-table__primary"><strong>{profile.name}</strong><span>{profile.code} · {profile.city}, {profile.country}</span></div>
          </div>
        </Panel>
        <Panel title="Academic configuration" hint="Term structure and grading">
          <FormGrid columns={1}>
            <TextField label="Academic year" name="institution-year" value={profile.academicYear} onChange={(academicYear) => set({ academicYear })} />
            <TextField label="Timezone" name="institution-timezone" value={profile.timezone} onChange={(timezone) => set({ timezone })} />
            <TextField label="Terms per year" name="institution-terms" type="number" value={String(profile.termsPerYear)} onChange={(termsPerYear) => set({ termsPerYear: Number(termsPerYear) })} />
            <TextField label="Grading scale" name="institution-grading" value={profile.gradingScale} onChange={(gradingScale) => set({ gradingScale })} />
            <SelectField label="Plan" name="institution-plan" value={profile.plan} onChange={(plan) => set({ plan: plan as Institution['plan'] })} options={[{ value: 'Starter', label: 'Starter' }, { value: 'Growth', label: 'Growth' }, { value: 'Enterprise', label: 'Enterprise' }]} />
          </FormGrid>
        </Panel>
        <div className="ec-row">
          <button type="button" className="ec-btn ec-btn--ghost" onClick={() => { setDraft({}); toast.info({ title: 'Draft reset', message: 'Seeded institution values restored.' }) }}>Reset</button>
          <span className="ec-spacer" />
          <button type="button" className="ec-btn" onClick={save}>Save configuration</button>
        </div>
      </div>
    </div>
  </div>
}
