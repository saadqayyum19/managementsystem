import { useState } from 'react'
import { Badge, PageHeader, Panel } from '../../components/ui/primitives'
import { FileSpreadsheet, Save, Sparkles, Table2 } from 'lucide-react'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { CheckboxField, FormGrid, SelectField, TextField } from '../../components/ui/FormField'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'

type PreviewRow = Record<string, string>

/** Deterministic placeholder values derived from the module schema — the mock layer exposes no report rows yet. */
function sampleValue(column: string, index: number): string {
  const day = String((index % 27) + 1).padStart(2, '0')
  if (column.toLowerCase().includes('date') || column === 'Timestamp') return `2026-02-${day}`
  if (column.includes('%')) return `${58 + ((index * 7) % 41)}%`
  if (/(billed|paid|due|net pay|fine)/i.test(column)) return `$${(320 + index * 145).toLocaleString()}`
  if (column === 'Status') return ['active', 'pending', 'completed', 'overdue'][index % 4]
  if (/(student|employee|member|actor|driver)/i.test(column)) return `Westbridge ${column} ${index + 1}`
  if (column === 'Class') return `Grade ${6 + (index % 5)}A`
  if (/(invoice|route|item|exam)/i.test(column)) return `${column} #${1000 + index * 37}`
  return `Sample ${index + 1}`
}

export function CustomReportBuilderPage() {
  const [moduleId, setModuleId] = useState('students')
  const [columnOverrides, setColumnOverrides] = useState<Record<string, string[]>>({})
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [format, setFormat] = useState('csv')
  const [ran, setRan] = useState(false)
  const [saved, setSaved] = useState<string[]>([])
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['analytics', 'reports'], mockApi.reportBuilder)
  const header = <PageHeader eyebrow="Analytics · reports" title="Custom report builder" subtitle="Compose cross-module reports from the mock schema, preview rows and queue exports." actions={<Badge tone="info">Mock schema</Badge>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={2} height={220} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const modules = data.modules
  const active = modules.find((module) => module.id === moduleId) ?? modules[0]
  const activeColumns = columnOverrides[active.id] ?? active.columns
  const previewRows: PreviewRow[] = ran ? Array.from({ length: 12 }, (_, index) => {
    const row: PreviewRow = { __id: `preview-${index}` }
    active.columns.filter((column) => activeColumns.includes(column)).forEach((column) => { row[column] = sampleValue(column, index) })
    return row
  }) : []
  const previewColumns: Array<DataTableColumn<PreviewRow>> = active.columns.filter((column) => activeColumns.includes(column)).map((column) => ({ key: column, header: column, render: (row) => row[column] ?? '—' }))

  const pickModule = (id: string) => { setModuleId(id); setRan(false) }
  const toggleColumn = (column: string) => setColumnOverrides((prev) => {
    const current = prev[active.id] ?? active.columns
    return { ...prev, [active.id]: current.includes(column) ? current.filter((item) => item !== column) : [...current, column] }
  })
  const run = () => {
    if (activeColumns.length === 0) { toast.warning({ title: 'Pick at least one column', message: 'A report needs one or more fields before it can run.' }); return }
    setRan(true)
    toast.success({ title: 'Report generated', message: `${activeColumns.length} columns × 12 preview rows from the mock schema.` })
  }
  const save = () => {
    const name = `${active.label} · ${activeColumns.length} fields`
    setSaved((prev) => prev.includes(name) ? prev : [name, ...prev])
    toast.success({ title: 'Report template saved', message: `${name} is available for this session.` })
  }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--sidebar" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <Panel title="1 · Choose a module" hint="Each module maps to one mock dataset schema">
        <div className="ec-stack">
          {modules.map((module) => <button key={module.id} type="button" className={module.id === active.id ? 'ec-btn' : 'ec-btn ec-btn--ghost'} style={{ justifyContent: 'flex-start' }} onClick={() => pickModule(module.id)}>
            <Table2 size={15} />
            <span>{module.label}</span>
            <span className="ec-spacer" />
            <Badge tone={module.id === active.id ? 'info' : 'neutral'}>{module.columns.length} fields</Badge>
          </button>)}
        </div>
      </Panel>
      <Panel title="2 · Columns & scope" hint="Toggle fields, set a date window and choose the export format">
        <div className="ec-stack">
          <div className="ec-grid ec-grid--2">{active.columns.map((column) => <CheckboxField key={column} label={column} checked={activeColumns.includes(column)} onChange={() => toggleColumn(column)} />)}</div>
          <FormGrid columns={3}>
            <TextField label="From" name="report-from" type="date" value={from} onChange={setFrom} />
            <TextField label="To" name="report-to" type="date" value={to} onChange={setTo} />
            <SelectField label="Format" name="report-format" value={format} onChange={setFormat} options={[{ value: 'csv', label: 'CSV' }, { value: 'xlsx', label: 'Excel' }, { value: 'pdf', label: 'PDF' }]} />
          </FormGrid>
          <div className="ec-row">
            <button type="button" className="ec-btn" onClick={run}><Sparkles size={15} /> Run report</button>
            <button type="button" className="ec-btn ec-btn--ghost" onClick={save}><Save size={15} /> Save template</button>
            <button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub(`${active.label} report`)}><FileSpreadsheet size={15} /> Export</button>
          </div>
          {saved.length > 0 && <div className="ec-row"><span className="ec-small ec-muted">Saved:</span>{saved.map((name) => <Badge key={name} tone="success">{name}</Badge>)}</div>}
        </div>
      </Panel>
    </div>
    <div style={{ marginBottom: 'var(--ec-space-4)' }}>
      <DataTable columns={previewColumns} rows={previewRows} rowKey={(row) => row.__id ?? 'row'} searchPlaceholder="Search preview rows…" toolbar={<Badge tone={ran ? 'success' : 'neutral'}>{ran ? `${previewColumns.length} columns · 12 rows` : 'Awaiting run'}</Badge>} footerNote={ran ? `Preview generated from the ${active.label} mock schema.` : 'Choose a module, toggle columns and run the report.'} emptyTitle={ran ? 'No columns selected' : 'No report generated yet'} emptyMessage={ran ? 'Re-enable at least one column to preview the report.' : 'The preview table fills once you run a report definition.'} />
    </div>
    <Panel title="Schema catalogue" hint="Available modules and field coverage">
      <div className="ec-row">
        {modules.map((module) => <Badge key={module.id} tone={module.id === active.id ? 'info' : 'neutral'}>{module.label} · {module.columns.length}</Badge>)}
      </div>
    </Panel>
  </div>
}

