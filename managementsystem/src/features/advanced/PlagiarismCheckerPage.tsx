import { useState } from 'react'
import { AlertTriangle, FileSearch, FileText } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, KeyValue, PageHeader, Panel, ProgressBar } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { ChartCard, ChartTooltip, chartAxisProps, chartColors, chartGridProps } from '../../components/ui/ChartCard'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { Modal } from '../../components/ui/Modal'
import { FormGrid, SelectField, TextField } from '../../components/ui/FormField'
import { useToast } from '../../components/ui/Toast'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import type { PlagiarismReport } from '../../mocks/types'

const statusTone = { clear: 'success', reviewing: 'warning', flagged: 'danger' } as const
const bands = [{ label: '0–20%', min: 0, max: 20 }, { label: '21–40%', min: 21, max: 40 }, { label: '41–60%', min: 41, max: 60 }, { label: '61–80%', min: 61, max: 80 }, { label: '81–100%', min: 81, max: 100 }]

export function PlagiarismCheckerPage() {
  const [focus, setFocus] = useState<PlagiarismReport | null>(null)
  const [scanOpen, setScanOpen] = useState(false)
  const [form, setForm] = useState({ title: '', studentId: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [overrides, setOverrides] = useState<Record<string, PlagiarismReport['status']>>({})
  const [extra, setExtra] = useState<PlagiarismReport[]>([])
  const toast = useToast()
  const { exportStub } = useExportStub()
  const query = useMockQuery(['advanced', 'plagiarism'], mockApi.plagiarismBoard)
  const header = <PageHeader eyebrow="Advanced · integrity" title="Plagiarism checker" subtitle="Similarity scoring with a manual review workflow. Ships behind the plagiarism_checker feature toggle." actions={<button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Plagiarism report')}>Export report</button>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={2} height={300} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const rows = [...extra, ...data.reports].map((report) => ({ ...report, status: overrides[report.id] ?? report.status }))
  const flagged = rows.filter((report) => report.status === 'flagged').length
  const reviewing = rows.filter((report) => report.status === 'reviewing').length
  const averageSimilarity = rows.length === 0 ? 0 : Math.round((rows.reduce((sum, report) => sum + report.similarityPercent, 0) / rows.length) * 10) / 10
  const distribution = bands.map((band) => ({ band: band.label, count: rows.filter((report) => report.similarityPercent >= band.min && report.similarityPercent <= band.max).length }))
  const statusSplit = (['clear', 'reviewing', 'flagged'] as const).map((status) => ({ status, count: rows.filter((report) => report.status === status).length }))
  const columns: Array<DataTableColumn<PlagiarismReport>> = [
    { key: 'submission', header: 'Submission', render: (row) => <div className="ec-table__primary"><strong>{row.submissionTitle}</strong><span>{row.submittedAt} · {row.assignmentId}</span></div>, searchValue: (row) => `${row.submissionTitle} ${row.assignmentId}` },
    { key: 'student', header: 'Student', render: (row) => nameOf(row.studentId), searchValue: (row) => nameOf(row.studentId) },
    { key: 'similarity', header: 'Similarity', align: 'right', render: (row) => <div style={{ minWidth: 130 }}><strong>{row.similarityPercent}%</strong><ProgressBar value={row.similarityPercent} tone={row.similarityPercent >= 60 ? 'danger' : row.similarityPercent >= 25 ? 'warning' : 'success'} /></div>, sortValue: (row) => row.similarityPercent },
    { key: 'source', header: 'Matched source', render: (row) => <span className="ec-small">{row.matchedSource}</span>, searchValue: (row) => row.matchedSource },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={statusTone[row.status]} dot>{row.status}</Badge> },
  ]
  const runScan = () => {
    const next = { title: form.title.trim() ? '' : 'Submission title is required.', studentId: form.studentId ? '' : 'Pick a student.' }
    setErrors(next); if (Object.values(next).some(Boolean)) return
    const similarityPercent = 6 + ((form.title.trim().length * 7) % 82)
    const status: PlagiarismReport['status'] = similarityPercent >= 55 ? 'flagged' : similarityPercent >= 25 ? 'reviewing' : 'clear'
    setExtra((list) => [{ id: `plg-x${list.length + 1}`, submissionTitle: form.title.trim(), studentId: form.studentId, assignmentId: 'manual-upload', submittedAt: '2026-02-24 10:00', similarityPercent, matchedSource: status === 'clear' ? 'No significant match' : 'Mock web archive', status }, ...list])
    setScanOpen(false); setForm({ title: '', studentId: '' })
    toast.success({ title: 'Scan complete', message: `${form.title.trim()} scored ${similarityPercent}% similarity.` })
  }

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Submissions" value={rows.length} icon={FileText} hint="Scanned this term" />
      <StatCard label="Flagged" value={flagged} icon={AlertTriangle} tone={flagged > 0 ? 'danger' : 'success'} hint="60% similarity and above" />
      <StatCard label="Reviewing" value={reviewing} icon={FileSearch} tone="warning" hint="Manual adjudication" />
      <StatCard label="Average similarity" value={`${averageSimilarity}%`} icon={FileSearch} tone={averageSimilarity < 25 ? 'success' : 'warning'} hint="Across all scans" />
    </div>
    <div className="ec-row" style={{ marginBottom: 'var(--ec-space-3)' }}>
      <span className="ec-small ec-muted">Similarity is scored against web, e-library and internal-submission sources.</span>
      <span className="ec-spacer" />
      <button type="button" className="ec-btn" onClick={() => setScanOpen(true)}>Run new scan</button>
    </div>
    <div className="ec-grid ec-grid--2" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <ChartCard title="Similarity distribution" hint="Submissions grouped by match band" isEmpty={rows.length === 0} legend={[{ label: 'Submissions', color: chartColors.primary }]}>
        <BarChart data={distribution}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="band" {...chartAxisProps} />
          <YAxis {...chartAxisProps} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="count" name="Submissions" radius={[4, 4, 0, 0]}>{distribution.map((entry, index) => <Cell key={entry.band} fill={index >= 3 ? chartColors.danger : index === 2 ? chartColors.warning : chartColors.success} />)}</Bar>
        </BarChart>
      </ChartCard>
      <ChartCard title="Review status" hint="Workflow state across scans" isEmpty={rows.length === 0} legend={[{ label: 'Clear', color: chartColors.success }, { label: 'Reviewing', color: chartColors.warning }, { label: 'Flagged', color: chartColors.danger }]}>
        <PieChart>
          <Pie data={statusSplit} dataKey="count" nameKey="status" innerRadius={55} outerRadius={90}>{statusSplit.map((entry) => <Cell key={entry.status} fill={entry.status === 'flagged' ? chartColors.danger : entry.status === 'reviewing' ? chartColors.warning : chartColors.success} />)}</Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ChartCard>
    </div>
    <div style={{ marginBottom: 'var(--ec-space-4)' }}>
      <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} searchPlaceholder="Search submissions, students, sources…" filters={[{ key: 'status', label: 'All statuses', options: (['clear', 'reviewing', 'flagged'] as const).map((status) => ({ value: status, label: status })), match: (row, value) => row.status === value }]} actions={(row) => <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => setFocus(row)}>Review</button>} emptyTitle="No submissions" emptyMessage="No plagiarism scans match the current filters." />
    </div>
    <Modal open={focus !== null} title={focus?.submissionTitle ?? 'Submission'} description="Similarity detail and adjudication controls." onClose={() => setFocus(null)} footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => { if (focus) { setOverrides((prev) => ({ ...prev, [focus.id]: 'clear' })); toast.success({ title: 'Marked clear', message: `${focus.submissionTitle} passed manual review.` }) } setFocus(null) }}>Mark clear</button><button type="button" className="ec-btn" onClick={() => { if (focus) { setOverrides((prev) => ({ ...prev, [focus.id]: 'flagged' })); toast.warning({ title: 'Flag confirmed', message: `${focus.submissionTitle} is flagged for the academic integrity board.` }) } setFocus(null) }}>Confirm flag</button></>}>
      {focus && <div className="ec-stack">
        <KeyValue items={[{ label: 'Student', value: nameOf(focus.studentId) }, { label: 'Assignment', value: focus.assignmentId }, { label: 'Submitted', value: focus.submittedAt }, { label: 'Similarity', value: `${focus.similarityPercent}%` }, { label: 'Status', value: <Badge tone={statusTone[focus.status]} dot>{focus.status}</Badge> }]} />
        <Panel title="Matched source"><div className="ec-stack" style={{ gap: 6 }}><strong>{focus.matchedSource}</strong><ProgressBar value={focus.similarityPercent} tone={focus.similarityPercent >= 60 ? 'danger' : focus.similarityPercent >= 25 ? 'warning' : 'success'} /><span className="ec-small ec-muted">Scores above 60% are auto-flagged; 25–59% enters manual review.</span></div></Panel>
      </div>}
    </Modal>
    <Modal open={scanOpen} title="Run new scan" description="Submits a mock similarity check against the seeded corpus." onClose={() => setScanOpen(false)} footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setScanOpen(false)}>Cancel</button><button type="button" className="ec-btn" onClick={runScan}>Run scan</button></>}>
      <FormGrid>
        <TextField label="Submission title" name="plagiarism-title" value={form.title} onChange={(title) => setForm((prev) => ({ ...prev, title }))} error={errors.title} required />
        <SelectField label="Student" name="plagiarism-student" value={form.studentId} onChange={(studentId) => setForm((prev) => ({ ...prev, studentId }))} options={data.students.map((student) => ({ value: student.id, label: `${student.firstName} ${student.lastName}` }))} error={errors.studentId} required />
      </FormGrid>
    </Modal>
  </div>
}


