import { useState } from 'react'
import { Power, SlidersHorizontal, ToggleLeft, ToggleRight } from 'lucide-react'
import { Badge, PageHeader, ProgressBar, ToggleSwitch } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { useAppDispatch } from '../../store'
import { setFeatureFlag, setFeatureFlags } from '../../store/uiSlice'
import { useMockQuery } from '../../hooks/useMockQuery'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import type { FeatureToggle } from '../../mocks/types'

export function FeatureTogglesPage() {
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  const dispatch = useAppDispatch()
  const toast = useToast()
  const query = useMockQuery(['system', 'feature-toggles'], mockApi.featureToggleBoard)
  const header = <PageHeader eyebrow="System · release control" title="Feature toggles" subtitle="Switch modules on or off live — the sidebar respects these flags immediately." />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={340} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const toggles = data.toggles
  const enabledOf = (toggle: FeatureToggle) => overrides[toggle.key] ?? toggle.enabled
  const enabled = toggles.filter(enabledOf).length
  const averageRollout = toggles.length === 0 ? 0 : Math.round(toggles.reduce((sum, toggle) => sum + toggle.rolloutPercent, 0) / toggles.length)
  const modules = Array.from(new Set(toggles.map((toggle) => toggle.module)))
  const columns: Array<DataTableColumn<FeatureToggle>> = [
    { key: 'toggle', header: 'Feature', render: (row) => <div className="ec-table__primary"><strong>{row.name}</strong><span>{row.description}</span></div>, searchValue: (row) => `${row.name} ${row.description} ${row.key}` },
    { key: 'module', header: 'Module', render: (row) => <Badge tone="info">{row.module}</Badge>, searchValue: (row) => row.module },
    { key: 'rollout', header: 'Rollout', align: 'right', render: (row) => <div style={{ minWidth: 120 }}><strong>{row.rolloutPercent}%</strong><ProgressBar value={row.rolloutPercent} tone={row.rolloutPercent >= 80 ? 'success' : row.rolloutPercent >= 40 ? 'warning' : 'danger'} /></div>, sortValue: (row) => row.rolloutPercent },
    { key: 'updated', header: 'Last change', render: (row) => <span className="ec-small">{nameOf(row.updatedBy)} · {row.updatedAt}</span>, searchValue: (row) => nameOf(row.updatedBy) },
    { key: 'state', header: 'State', render: (row) => <Badge tone={enabledOf(row) ? 'success' : 'neutral'} dot>{enabledOf(row) ? 'Enabled' : 'Disabled'}</Badge> },
  ]

  const toggleFlag = (toggle: FeatureToggle) => {
    const next = !enabledOf(toggle)
    setOverrides((prev) => ({ ...prev, [toggle.key]: next }))
    dispatch(setFeatureFlag({ key: toggle.key, enabled: next }))
    toast.success({ title: `${toggle.name} ${next ? 'enabled' : 'disabled'}`, message: next ? 'The module is now visible to permitted roles.' : 'The module is hidden from navigation.' })
  }
  const reset = () => {
    setOverrides({})
    dispatch(setFeatureFlags(Object.fromEntries(toggles.map((toggle) => [toggle.key, toggle.enabled]))))
    toast.info({ title: 'Toggles reset', message: 'Seeded release defaults restored.' })
  }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Total toggles" value={toggles.length} icon={SlidersHorizontal} hint={`${modules.length} modules`} />
      <StatCard label="Enabled" value={enabled} icon={ToggleRight} tone="success" hint="Visible in navigation" />
      <StatCard label="Disabled" value={toggles.length - enabled} icon={ToggleLeft} tone={toggles.length - enabled > 0 ? 'warning' : 'success'} hint="Advanced / AI ships off" />
      <StatCard label="Average rollout" value={`${averageRollout}%`} icon={Power} tone="info" hint="Across all features" />
    </div>
    <div className="ec-row" style={{ marginBottom: 'var(--ec-space-3)' }}>
      <Badge tone="warning" dot>Advanced / AI modules are disabled by default in this mock</Badge>
      <span className="ec-spacer" />
      <button type="button" className="ec-btn ec-btn--ghost" onClick={reset}>Reset to seeded defaults</button>
    </div>
    <DataTable columns={columns} rows={toggles} rowKey={(row) => row.id} searchPlaceholder="Search features, keys…" filters={[{ key: 'module', label: 'All modules', options: modules.map((module) => ({ value: module, label: module })), match: (row, value) => row.module === value }, { key: 'state', label: 'All states', options: [{ value: 'on', label: 'Enabled' }, { value: 'off', label: 'Disabled' }], match: (row, value) => value === 'on' ? enabledOf(row) : !enabledOf(row) }]} actions={(row) => <ToggleSwitch checked={enabledOf(row)} onChange={() => toggleFlag(row)} label={`Toggle ${row.name}`} />} actionsHeader="Live" emptyTitle="No toggles" emptyMessage="No feature toggles match the current filters." />
  </div>
}
