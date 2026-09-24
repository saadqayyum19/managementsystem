import { useState } from 'react'
import { Download, Inbox, Plus } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, KeyValue, PageHeader, Panel, ProgressBar, Tabs, ToggleSwitch } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { FormGrid, SelectField, TextAreaField, TextField } from '../../components/ui/FormField'
import { Modal } from '../../components/ui/Modal'
import { SkeletonCards, SkeletonText } from '../../components/ui/Skeleton'
import { StatCard } from '../../components/ui/StatCard'
import { ChartCard, chartColors, chartGridProps, chartTooltipStyle } from '../../components/ui/ChartCard'
import { ToastProvider, useToast } from '../../components/ui/Toast'
import { RoleGate } from '../../components/ui/RoleGate'
import { useExportStub } from '../../hooks/useExportStub'
import { useValidatedForm, validators } from '../../hooks/useValidatedForm'

type DemoRow = { id: string; name: string; role: string; status: string; score: number }

const demoRows: DemoRow[] = [
  { id: '1', name: 'Olivia Chen', role: 'student', status: 'active', score: 92 },
  { id: '2', name: 'Ethan Kapoor', role: 'student', status: 'active', score: 74 },
  { id: '3', name: 'Maya Iyer', role: 'student', status: 'active', score: 86 },
  { id: '4', name: 'Noah Fernandes', role: 'student', status: 'inactive', score: 58 },
  { id: '5', name: 'Sara Okafor', role: 'student', status: 'active', score: 81 },
]

const demoColumns: Array<DataTableColumn<DemoRow>> = [
  { key: 'name', header: 'Name', render: (row) => <div className="ec-table__primary"><strong>{row.name}</strong><span>Sample record</span></div>, sortValue: (row) => row.name },
  { key: 'role', header: 'Role', render: (row) => <Badge tone="info">{row.role}</Badge> },
  { key: 'score', header: 'Score', render: (row) => `${row.score}%`, sortValue: (row) => row.score, align: 'right' },
  { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'active' ? 'success' : 'danger'} dot>{row.status}</Badge> },
]

const chartData = [{ label: 'Mon', value: 82 }, { label: 'Tue', value: 88 }, { label: 'Wed', value: 91 }, { label: 'Thu', value: 86 }, { label: 'Fri', value: 94 }]
const pieData = [{ name: 'Present', value: 62 }, { name: 'Late', value: 9 }, { name: 'Absent', value: 6 }]
const axis = { stroke: '#94a3b8', tick: { fontSize: 11, fill: '#94a3b8' } }

export function Phase0ShowcasePage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [tab, setTab] = useState('table')
  const [switchOn, setSwitchOn] = useState(true)
  const toast = useToast()
  const { exportStub } = useExportStub()
  const form = useValidatedForm({ label: '', note: '' }, { label: (value) => validators.required('Label')(value), note: (value) => validators.minLength(10, 'Note')(value) })
  return <div className="ec-page">
    <PageHeader eyebrow="Phase 0 · component lab" title="Shared UI primitives" subtitle="These primitives are reused by every feature page — verify them here before wiring features." actions={<>
      <button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Component lab CSV')}><Download size={14} /> Export (stub)</button>
      <button type="button" className="ec-btn" onClick={() => setModalOpen(true)}><Plus size={14} /> Open modal</button>
    </>} />

    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Students" value="10" icon={Inbox} delta={6.4} deltaLabel="vs last term" />
      <StatCard label="Attendance" value="91.8%" icon={Inbox} tone="success" delta={2.1} deltaLabel="this month" />
      <StatCard label="Fee collection" value="78%" icon={Inbox} tone="warning" delta={-3.2} deltaLabel="target 85%" />
      <StatCard label="At risk" value="2" icon={Inbox} tone="danger" hint="flagged this week" />
    </div>

    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="Responsive bar chart" hint="Recharts inside a responsive container" legend={[{ label: 'Attendance %', color: chartColors.primary }]}>
        <BarChart data={chartData}><CartesianGrid {...chartGridProps} /><XAxis dataKey="label" {...axis} /><YAxis {...axis} /><Tooltip {...chartTooltipStyle} /><Bar dataKey="value" name="Attendance %" fill={chartColors.primary} radius={[4, 4, 0, 0]} /></BarChart>
      </ChartCard>
      <ChartCard title="Tooltip and legend styling" hint="Hover a slice for the interactive tooltip">
        <PieChart><Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>{pieData.map((entry, index) => <Cell key={entry.name} fill={[chartColors.success, chartColors.warning, chartColors.danger][index]} />)}</Pie><Legend /><Tooltip {...chartTooltipStyle} /></PieChart>
      </ChartCard>
    </div>

    <Panel title="Component states" hint="Loading, empty and error states are available to every async view" flush>
      <div className="ec-card__body">
        <Tabs tabs={[{ id: 'table', label: 'DataTable' }, { id: 'states', label: 'States' }, { id: 'form', label: 'Form + Modal' }, { id: 'shell', label: 'Shell bits' }]} active={tab} onChange={setTab} />
        <div style={{ paddingTop: 'var(--ec-space-4)' }}>
          {tab === 'table' && <DataTable
            columns={demoColumns}
            rows={demoRows}
            rowKey={(row) => row.id}
            searchPlaceholder="Search component rows…"
            filters={[{ key: 'status', label: 'All status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }], match: (row, value) => row.status === value }]}
            pageSize={3}
            emptyTitle="No demo rows"
            actions={(row) => <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => toast.success({ title: 'Row action fired', message: row.name })}>Ping</button>}
          />}
          {tab === 'states' && <div className="ec-grid ec-grid--3">
            <Panel title="Loading"><SkeletonCards count={2} height={72} /><div style={{ height: 12 }} /><SkeletonText /></Panel>
            <Panel title="Empty"><EmptyState icon={Inbox} title="Nothing here yet" message="The empty state renders whenever a filtered list returns zero rows." action={<button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => toast.info({ title: 'Empty-state CTA' })}>Add the first record</button>} /></Panel>
            <Panel title="Error"><ErrorState onRetry={() => toast.success({ title: 'Retry dispatched' })} /></Panel>
          </div>}
          {tab === 'form' && <div className="ec-grid ec-grid--2">
            <Panel title="Validated form" hint="Inline errors plus a success toast">
              <div className="ec-stack">
                <TextField label="Label" name="label" value={form.values.label} onChange={(value) => form.setValue('label', value)} error={form.fieldError('label')} placeholder="Type anything" required />
                <TextAreaField label="Note" name="note" value={form.values.note} onChange={(value) => form.setValue('note', value)} error={form.fieldError('note')} hint="Minimum 10 characters" />
                <button type="button" className="ec-btn" onClick={() => { if (form.validate()) { toast.success({ title: 'Form submitted', message: 'Validation passed and the success toast fired.' }); form.reset() } else toast.error({ title: 'Fix the highlighted fields' }) }}>Validate and submit</button>
              </div>
            </Panel>
            <Panel title="RoleGate" hint="Renders children only for the allowed roles">
              <div className="ec-stack">
                <RoleGate roles={['super_admin']}><Badge tone="info" dot>Visible to Super Admin only</Badge></RoleGate>
                <RoleGate roles={['principal', 'teacher']}><Badge tone="success" dot>Visible to Principal and Teacher</Badge></RoleGate>
                <RoleGate roles={['student']} fallback={<span className="ec-small ec-muted">Fallback shown because the active role is not Student.</span>}>Student content</RoleGate>
              </div>
            </Panel>
          </div>}
          {tab === 'shell' && <div className="ec-grid ec-grid--2">
            <Panel title="Key / value grid"><KeyValue items={[{ label: 'Institution', value: 'Westbridge Academy' }, { label: 'Academic year', value: '2026 / 2027' }, { label: 'Plan', value: 'Enterprise' }, { label: 'Terms', value: 3 }]} /></Panel>
            <Panel title="Progress and switch">
              <div className="ec-stack">
                <ProgressBar value={78} /><ProgressBar value={46} tone="warning" /><ProgressBar value={22} tone="danger" />
                <div className="ec-row"><ToggleSwitch checked={switchOn} onChange={setSwitchOn} label="Feature flag" /><span className="ec-small">{switchOn ? 'Enabled' : 'Disabled'}</span></div>
              </div>
            </Panel>
          </div>}
        </div>
      </div>
    </Panel>

    <Modal open={modalOpen} title="Modal behaviour" description="ESC closes it, the backdrop is blurred, focus stays trapped inside and AnimatePresence handles enter/exit." onClose={() => setModalOpen(false)}
      footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setModalOpen(false)}>Cancel</button><button type="button" className="ec-btn" onClick={() => { setModalOpen(false); toast.success({ title: 'Saved from modal' }) }}>Save</button></>}>
      <FormGrid columns={2}>
        <TextField label="First field" name="first" value="" onChange={() => undefined} hint="Tab cycles inside the dialog" />
        <SelectField label="Second field" name="second" value="" onChange={() => undefined} options={[{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }]} placeholder="Choose…" />
      </FormGrid>
      <p className="ec-small ec-muted">Press ESC or click the backdrop, then confirm focus returns to the trigger button.</p>
    </Modal>
  </div>
}

/** Standalone route wrapper so the component lab can be opened on its own. */
export function Phase0ShowcaseRoute() {
  return <ToastProvider><Phase0ShowcasePage /></ToastProvider>
}
