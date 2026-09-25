import { useState } from 'react'
import { CloudUpload, DatabaseBackup, HardDriveDownload, ShieldCheck } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, KeyValue, PageHeader, Panel } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { ChartCard, ChartTooltip, chartAxisProps, chartColors, chartGridProps } from '../../components/ui/ChartCard'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import type { BackupRecord } from '../../mocks/types'

const statusTone = { completed: 'success', running: 'info', failed: 'danger' } as const

export function BackupAndRestorePage() {
  const [extra, setExtra] = useState<BackupRecord[]>([])
  const [restored, setRestored] = useState<string[]>([])
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['system', 'backup'], mockApi.backupBoard)
  const header = <PageHeader eyebrow="System · continuity" title="Backup & restore" subtitle="Snapshot history, retention policy and one-click restores for the mock tenant." actions={<button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Backup history')}>Export history</button>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={340} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const records = [...extra, ...data.records]
  const failed = records.filter((record) => record.status === 'failed').length
  const totalSize = Math.round(records.reduce((sum, record) => sum + record.sizeMb, 0) * 10) / 10
  const latest = records[0]
  const chartRows = records.slice(0, 8).reverse().map((record) => ({ label: record.createdAt.slice(5, 10), sizeMb: record.sizeMb, status: record.status }))
  const columns: Array<DataTableColumn<BackupRecord>> = [
    { key: 'label', header: 'Snapshot', render: (row) => <div className="ec-table__primary"><strong>{row.label}</strong><span>{row.createdAt} · {row.location}</span></div>, searchValue: (row) => `${row.label} ${row.location}` },
    { key: 'type', header: 'Type', render: (row) => <Badge tone={row.type === 'auto' ? 'info' : 'neutral'}>{row.type}</Badge>, sortValue: (row) => row.type },
    { key: 'size', header: 'Size', align: 'right', render: (row) => `${row.sizeMb} MB`, sortValue: (row) => row.sizeMb },
    { key: 'retention', header: 'Retention', align: 'right', render: (row) => `${row.retentionDays} days`, sortValue: (row) => row.retentionDays },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={restored.includes(row.id) ? 'info' : statusTone[row.status]} dot>{restored.includes(row.id) ? 'restored' : row.status}</Badge> },
  ]

  const runBackup = () => {
    setExtra((list) => [{ id: `bkp-x${list.length + 1}`, label: 'On-demand manual snapshot', createdAt: '2026-02-24 10:05', sizeMb: 417.4, type: 'manual', status: 'running', location: 's3://educore-westbridge/manual', retentionDays: 90 }, ...list])
    toast.success({ title: 'Backup started', message: 'The on-demand snapshot is running against the mock storage bucket.' })
  }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Snapshots" value={records.length} icon={DatabaseBackup} hint={`${data.records.filter((record) => record.type === 'auto').length} automatic`} />
      <StatCard label="Latest snapshot" value={latest ? latest.createdAt.slice(5) : '—'} icon={CloudUpload} tone="success" hint={latest?.label ?? 'No snapshots'} />
      <StatCard label="Failed runs" value={failed} icon={HardDriveDownload} tone={failed > 0 ? 'danger' : 'success'} hint="Needs a re-run" />
      <StatCard label="Stored volume" value={`${totalSize.toLocaleString()} MB`} icon={ShieldCheck} tone="info" hint={`Next run ${data.schedule.nextRun}`} />
    </div>
    <div className="ec-grid ec-grid--sidebar" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="Snapshot sizes" hint="Most recent eight runs in MB" isEmpty={chartRows.length === 0} legend={[{ label: 'Size (MB)', color: chartColors.primary }]}>
        <BarChart data={chartRows}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="label" {...chartAxisProps} />
          <YAxis {...chartAxisProps} />
          <Tooltip content={<ChartTooltip valueSuffix=" MB" />} />
          <Bar dataKey="sizeMb" name="Size (MB)" radius={[4, 4, 0, 0]}>{chartRows.map((entry) => <Cell key={entry.label} fill={entry.status === 'failed' ? chartColors.danger : entry.status === 'running' ? chartColors.warning : chartColors.primary} />)}</Bar>
        </BarChart>
      </ChartCard>
      <Panel title="Retention schedule" hint="Policy applied by the mock scheduler">
        <div className="ec-stack">
          <KeyValue items={[{ label: 'Frequency', value: data.schedule.frequency }, { label: 'Retention', value: data.schedule.retention }, { label: 'Last verification', value: data.schedule.lastVerification }, { label: 'Next run', value: data.schedule.nextRun }]} />
          <div className="ec-row">{data.schedule.encrypted && <Badge tone="success" dot>Encrypted</Badge>}{data.schedule.offsite && <Badge tone="info" dot>Offsite copy</Badge>}</div>
          <button type="button" className="ec-btn" onClick={runBackup}>Run backup now</button>
        </div>
      </Panel>
    </div>
    <DataTable columns={columns} rows={records} rowKey={(row) => row.id} searchPlaceholder="Search snapshots, locations…" filters={[{ key: 'type', label: 'All types', options: [{ value: 'auto', label: 'Automatic' }, { value: 'manual', label: 'Manual' }], match: (row, value) => row.type === value }, { key: 'status', label: 'All statuses', options: [{ value: 'completed', label: 'Completed' }, { value: 'running', label: 'Running' }, { value: 'failed', label: 'Failed' }], match: (row, value) => row.status === value }]} actions={(row) => <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" disabled={row.status !== 'completed'} onClick={() => { setRestored((prev) => prev.includes(row.id) ? prev : [...prev, row.id]); toast.warning({ title: 'Restore queued', message: `${row.label} will overwrite the mock tenant once confirmed.` }) }}>Restore</button>} emptyTitle="No snapshots" emptyMessage="No backup records match the current filters." />
  </div>
}

