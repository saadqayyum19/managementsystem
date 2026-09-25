import { useState } from 'react'
import { Bell, KeyRound, Mail, Phone, ShieldCheck } from 'lucide-react'
import { Avatar, Badge, KeyValue, PageHeader, Panel, ToggleSwitch } from '../../components/ui/primitives'
import { TextField } from '../../components/ui/FormField'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { roleLabels } from '../../components/ui/RoleGate'
import { useAppSelector } from '../../store'
import { useMockQuery } from '../../hooks/useMockQuery'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'

const preferenceLabels: Array<{ key: string; label: string }> = [
  { key: 'attendance', label: 'Attendance and absence alerts' },
  { key: 'fees', label: 'Fee reminders and receipts' },
  { key: 'announcements', label: 'Institution announcements' },
  { key: 'events', label: 'Events and calendar changes' },
]

export function MyProfilePage() {
  const user = useAppSelector((state) => state.auth.user)
  const [preferences, setPreferences] = useState<Record<string, boolean>>({ attendance: true, fees: true, announcements: true, events: false })
  const [passwords, setPasswords] = useState({ current: '', next: '' })
  const toast = useToast()
  const query = useMockQuery(['system', 'profiles'], mockApi.userProfileBoard)
  const header = <PageHeader eyebrow="Workspace · account" title="My profile" subtitle="Your contact details, guardian links and notification preferences." />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={3} height={200} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>
  if (!user) return <div className="ec-page">{header}<ErrorState title="No active session" message="Switch to a demo role from the topbar to view a profile." /></div>

  const name = nameOf(user.id)
  const student = data.students.find((item) => item.id === user.id)
  const teacher = data.teachers.find((item) => item.id === user.id)
  const guardian = data.guardians.find((item) => item.id === user.id)
  const guardianLinks = student ? data.guardians.filter((item) => student.guardianIds.includes(item.id)) : []
  const details = [
    { label: 'Role', value: <Badge tone="info">{roleLabels[user.role]}</Badge> },
    { label: 'Email', value: user.email },
    ...(student ? [{ label: 'Roll number', value: student.rollNo }, { label: 'House', value: student.house }, { label: 'Admission no.', value: student.admissionNo }, { label: 'Blood group', value: student.bloodGroup }] : []),
    ...(teacher ? [{ label: 'Employee code', value: teacher.employeeCode }, { label: 'Department', value: teacher.department }, { label: 'Designation', value: teacher.designation }, { label: 'Qualification', value: teacher.qualification }] : []),
    ...(guardian ? [{ label: 'Relationship', value: guardian.relationship }, { label: 'Occupation', value: guardian.occupation }] : []),
  ]

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--sidebar">
      <div className="ec-stack">
        <Panel title="Profile" hint="Identity on record in the mock directory">
          <div className="ec-row" style={{ alignItems: 'flex-start' }}>
            <Avatar name={name} size="md" />
            <div className="ec-table__primary"><strong style={{ fontSize: 16 }}>{name}</strong><span>{roleLabels[user.role]} · {user.email}</span><span className="ec-small ec-muted">ID {user.id}</span></div>
          </div>
          <div style={{ height: 12 }} />
          <div className="ec-row"><Badge tone="success" dot>Active</Badge><Badge tone="neutral">Institution {user.institutionId}</Badge></div>
        </Panel>
        <Panel title="Details" hint="Read-only records resolved from the mock directory"><KeyValue items={details} /></Panel>
        {student && <Panel title="Guardian links" hint="Contacts authorised to receive student updates">
          <div className="ec-stack">
            {guardianLinks.length === 0 ? <p className="ec-small ec-muted">No guardians linked to this student record.</p> : guardianLinks.map((item) => <div key={item.id} className="ec-row"><Avatar name={nameOf(item.id)} /><div className="ec-table__primary"><strong>{nameOf(item.id)}</strong><span>{item.relationship} · {item.phone}</span></div></div>)}
          </div>
        </Panel>}
      </div>
      <div className="ec-stack">
        <Panel title="Contact" hint="Reachability for alerts">
          <div className="ec-stack">
            <div className="ec-row"><Mail size={15} className="ec-muted" /><span>{user.email}</span></div>
            <div className="ec-row"><Phone size={15} className="ec-muted" /><span>{teacher?.phone ?? student?.phone ?? guardian?.phone ?? 'No phone on record'}</span></div>
          </div>
        </Panel>
        <Panel title="Notification preferences" hint="Applies to the in-app notification engine">
          <div className="ec-stack">
            {preferenceLabels.map((preference) => <div key={preference.key} className="ec-row">
              <Bell size={14} className="ec-muted" />
              <span>{preference.label}</span>
              <span className="ec-spacer" />
              <ToggleSwitch checked={preferences[preference.key] ?? false} onChange={(checked) => setPreferences((prev) => ({ ...prev, [preference.key]: checked }))} label={preference.label} />
            </div>)}
          </div>
        </Panel>
        <Panel title="Security" hint="Password changes are stubbed in the mock-only phase">
          <div className="ec-stack">
            <TextField label="Current password" name="profile-current-password" type="password" value={passwords.current} onChange={(current) => setPasswords((prev) => ({ ...prev, current }))} />
            <TextField label="New password" name="profile-new-password" type="password" value={passwords.next} onChange={(next) => setPasswords((prev) => ({ ...prev, next }))} />
            <div className="ec-row"><ShieldCheck size={15} className="ec-muted" /><span className="ec-small ec-muted">Minimum 8 characters, rotation enforced at institution level.</span></div>
            <div className="ec-row"><span className="ec-spacer" /><button type="button" className="ec-btn" onClick={() => { if (passwords.current.length < 6 || passwords.next.length < 8) { toast.warning({ title: 'Passwords too short', message: 'Enter the current password and a new password of at least 8 characters.' }); return } setPasswords({ current: '', next: '' }); toast.success({ title: 'Password updated', message: 'The mock identity provider accepted the change.' }) }}><KeyRound size={15} /> Update password</button></div>
          </div>
        </Panel>
      </div>
    </div>
  </div>
}

