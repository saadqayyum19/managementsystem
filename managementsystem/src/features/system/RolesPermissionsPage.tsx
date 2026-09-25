import { useState } from 'react'
import { Check, Lock, ShieldCheck, Users } from 'lucide-react'
import { Badge, ChipRow, PageHeader, Panel } from '../../components/ui/primitives'
import { CheckboxField } from '../../components/ui/FormField'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { roleLabels } from '../../components/ui/RoleGate'
import { useMockQuery } from '../../hooks/useMockQuery'
import { mockApi } from '../../services/mockApi'
import type { PermissionActions, Role } from '../../mocks/types'

const actionLabels: Array<{ key: keyof PermissionActions; label: string }> = [
  { key: 'create', label: 'Create' },
  { key: 'read', label: 'View' },
  { key: 'update', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
]

export function RolesPermissionsPage() {
  const [role, setRole] = useState<Role>('teacher')
  const [overrides, setOverrides] = useState<Partial<Record<Role, Record<string, PermissionActions>>>>({})
  const toast = useToast()
  const query = useMockQuery(['system', 'rbac'], mockApi.rbacBoard)
  const header = <PageHeader eyebrow="System · access control" title="Roles & permissions" subtitle="Module-level CRUD matrix applied by the RBAC guard on every route and API call." />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={360} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const actionsFor = (module: string): PermissionActions => overrides[role]?.[module] ?? data.matrix.roles[role][module] ?? { create: false, read: false, update: false, delete: false }
  const granted = data.modules.filter((module) => actionsFor(module).read).length
  const editable = data.modules.filter((module) => actionsFor(module).create || actionsFor(module).update || actionsFor(module).delete).length
  const roleCount = data.roles.length
  const fullAccess = data.modules.filter((module) => actionLabels.every((action) => actionsFor(module)[action.key])).length
  const setAction = (module: string, action: keyof PermissionActions, value: boolean) => {
    const current = actionsFor(module)
    setOverrides((prev) => ({ ...prev, [role]: { ...(prev[role] ?? {}), [module]: { ...current, [action]: value } } }))
  }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Roles" value={roleCount} icon={Users} hint="System-defined" />
      <StatCard label="Modules with view" value={granted} icon={ShieldCheck} tone="success" hint={`of ${data.modules.length} modules`} />
      <StatCard label="Modules with write" value={editable} icon={Check} tone="info" hint="Create, edit or delete" />
      <StatCard label="Full access" value={fullAccess} icon={Lock} tone="warning" hint="All four actions" />
    </div>
    <div className="ec-row" style={{ marginBottom: 'var(--ec-space-3)', flexWrap: 'wrap', gap: 12 }}>
      <ChipRow options={data.roles.map((item) => ({ value: item, label: roleLabels[item] }))} value={role} onChange={setRole} />
      <span className="ec-spacer" />
      <button type="button" className="ec-btn ec-btn--ghost" onClick={() => { setOverrides((prev) => ({ ...prev, [role]: {} })); toast.info({ title: 'Matrix reset', message: `${roleLabels[role]} permissions restored to the seeded matrix.` }) }}>Reset role</button>
      <button type="button" className="ec-btn" onClick={() => toast.success({ title: 'Permissions saved', message: `${roleLabels[role]} now has ${granted} viewable and ${editable} writable modules.` })}>Save matrix</button>
    </div>
    <Panel title={`${roleLabels[role]} permissions`} hint="Toggle each action per module — changes stay in the mock session">
      <div className="ec-grid ec-grid--2">
        {data.modules.map((module) => <div key={module} className="ec-card" style={{ padding: 'var(--ec-space-3)' }}>
          <div className="ec-row" style={{ marginBottom: 'var(--ec-space-2)' }}><strong style={{ fontSize: 13 }}>{module}</strong><span className="ec-spacer" />{actionsFor(module).read ? <Badge tone="success" dot>visible</Badge> : <Badge tone="neutral">hidden</Badge>}</div>
          <div className="ec-row">{actionLabels.map((action) => <CheckboxField key={action.key} label={action.label} checked={actionsFor(module)[action.key]} onChange={(checked) => setAction(module, action.key, checked)} />)}</div>
        </div>)}
      </div>
    </Panel>
  </div>
}
