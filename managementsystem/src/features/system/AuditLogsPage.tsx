import { useState } from 'react'
import { AlertTriangle, FileText, ScrollText, ShieldAlert } from 'lucide-react'
import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import { Badge, KeyValue, PageHeader } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { ChartCard, ChartTooltip, chartColors } from '../../components/ui/ChartCard'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { Modal } from '../../components/ui/Modal'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import type { AuditLog } from '../../mocks/types'

const severityTone = { info: 'info', warning: 'warning', critical: 'danger' } as const

export function AuditLogsPage() {
  const [focus, setFocus] = useState<AuditLog | null>(null)
  const { exportStub } = useExportStub()
  const query = useMockQuery(['system', 'audit'], mockApi.auditLogBoard)
  const header = <PageHeader eyebrow="System · compliance" title="Audit logs" subtitle="Every privileged action, sign-in attempt and RBAC block captured by the mock audit stream." actions={<button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Audit log')}>Export log</button>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={340} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const severity = [
    { level: 'info', count: data.counts.info, color: chartColors.primary },
    { level: 'warning', count: data.counts.warning, color: chartColors.warning },
    { level: 'critical', count: data.counts.critical, color: chartColors.danger },
  ]
  const modules = Array.from(new Set(data.logs.map((log) => log.module)))
  const columns: Array<DataTableColumn<AuditLog>> = [
    { key: 'timestamp', header: 'When', render: (row) => <span className="ec-small">{row.timestamp}</span>, sortValue: (row) => row.timestamp },
    { key: 'actor', header: 'Actor', render: (row) => <div className="ec-table__primary"><strong>{nameOf(row.actorId)}</strong><span>{row.actorRole.replace('_', ' ')}</span></div>, searchValue: (row) => `${nameOf(row.actorId)} ${row.actorRole}` },
    { key: 'action', header: 'Action', render: (row) => <div className="ec-table__primary"><strong>{row.action}</strong><span>{row.entity} · {row.entityId}</span></div>, searchValue: (row) => `${row.action} ${row.entity} ${row.entityId}` },
    { key: 'module', header: 'Module', render: (row) => <Badge tone="info">{row.module}</Badge>, searchValue: (row) => row.module },
    { key: 'source', header: 'Source', render: (row) => <span className="ec-small">{row.ip}<br />{row.device}</span>, searchValue: (row) => `${row.ip} ${row.device}` },
    { key: 'severity', header: 'Severity', render: (row) => <Badge tone={severityTone[row.severity]} dot>{row.severity}</Badge>, sortValue: (row) => row.severity },
  ]

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Events captured" value={data.logs.length} icon={ScrollText} hint={`${modules.length} modules`} />
      <StatCard label="Info" value={data.counts.info} icon={FileText} tone="info" hint="Routine activity" />
      <StatCard label="Warnings" value={data.counts.warning} icon={AlertTriangle} tone="warning" hint="Review advised" />
      <StatCard label="Critical" value={data.counts.critical} icon={ShieldAlert} tone="danger" hint="Security follow-up" />
    </div>
    <div className="ec-grid ec-grid--sidebar" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <div>
        <DataTable columns={columns} rows={data.logs} rowKey={(row) => row.id} searchPlaceholder="Search actors, actions, modules…" pageSize={8} filters={[{ key: 'severity', label: 'All severities', options: severity.map((entry) => ({ value: entry.level, label: entry.level })), match: (row, value) => row.severity === value }, { key: 'module', label: 'All modules', options: modules.map((module) => ({ value: module, label: module })), match: (row, value) => row.module === value }]} actions={(row) => <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => setFocus(row)}>Inspect</button>} emptyTitle="No audit events" emptyMessage="No audit records match the current filters." />
      </div>
      <ChartCard title="Severity mix" hint="Events by severity band" isEmpty={data.logs.length === 0} legend={severity.map((entry) => ({ label: entry.level, color: entry.color }))}>
        <PieChart>
          <Pie data={severity} dataKey="count" nameKey="level" innerRadius={55} outerRadius={90}>{severity.map((entry) => <Cell key={entry.level} fill={entry.color} />)}</Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ChartCard>
    </div>
    <Modal open={focus !== null} title={focus?.action ?? 'Audit event'} description="Immutable event detail from the mock audit stream." onClose={() => setFocus(null)} footer={<button type="button" className="ec-btn" onClick={() => setFocus(null)}>Close</button>}>
      {focus && <KeyValue items={[{ label: 'Timestamp', value: focus.timestamp }, { label: 'Actor', value: `${nameOf(focus.actorId)} · ${focus.actorRole}` }, { label: 'Module', value: focus.module }, { label: 'Entity', value: `${focus.entity} (${focus.entityId})` }, { label: 'Severity', value: <Badge tone={severityTone[focus.severity]} dot>{focus.severity}</Badge> }, { label: 'IP address', value: focus.ip }, { label: 'Device', value: focus.device }]} />}
    </Modal>
  </div>
}
