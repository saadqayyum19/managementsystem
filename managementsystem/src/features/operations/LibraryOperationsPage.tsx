import { useState } from 'react'
import { BookOpenCheck, CheckCircle2, Clock3, Library } from 'lucide-react'
import { Badge, PageHeader, Panel } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { useMockQuery } from '../../hooks/useMockQuery'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import type { LibraryIssue } from '../../mocks/types'

export function LibraryOperationsPage() {
  const [returned, setReturned] = useState<Record<string, string>>({})
  const toast = useToast(); const query = useMockQuery(['library-ops'], mockApi.libraryBoard)
  const header = <PageHeader eyebrow="Operations · circulation" title="Library circulation" subtitle="Issue, return and fine tracking for physical resources." />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>
  const statusOf = (row: LibraryIssue) => returned[row.id] ? 'returned' as const : row.status
  const rows = data.issues.map((row) => ({ ...row, returnedOn: returned[row.id] ?? row.returnedOn, status: statusOf(row) }))
  const resource = (id: string) => data.resources.find((item) => item.id === id)
  const columns: Array<DataTableColumn<(typeof rows)[number]>> = [{ key: 'resource', header: 'Resource', render: (row) => <div className="ec-table__primary"><strong>{resource(row.resourceId)?.title ?? row.resourceId}</strong><span>{resource(row.resourceId)?.type ?? 'Resource'}</span></div>, searchValue: (row) => `${resource(row.resourceId)?.title ?? ''} ${resource(row.resourceId)?.author ?? ''}` }, { key: 'member', header: 'Member', render: (row) => <div className="ec-table__primary"><strong>{nameOf(row.memberId)}</strong><span>{row.memberRole}</span></div> }, { key: 'issued', header: 'Issued', render: (row) => row.issuedOn, sortValue: (row) => row.issuedOn }, { key: 'due', header: 'Due', render: (row) => row.dueOn, sortValue: (row) => row.dueOn }, { key: 'fine', header: 'Fine', align: 'right', render: (row) => `$${row.fine}`, sortValue: (row) => row.fine }, { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'returned' ? 'success' : row.status === 'overdue' ? 'danger' : 'warning'} dot>{row.status}</Badge> }]
  return <div className="ec-page">{header}<div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}><StatCard label="Resources" value={data.resources.length} icon={Library} /><StatCard label="Issued" value={rows.filter((row) => row.status === 'issued').length} icon={BookOpenCheck} tone="info" /><StatCard label="Overdue" value={rows.filter((row) => row.status === 'overdue').length} icon={Clock3} tone="danger" /><StatCard label="Returned" value={rows.filter((row) => row.status === 'returned').length} icon={CheckCircle2} tone="success" /></div><Panel flush><div className="ec-card__body"><DataTable columns={columns} rows={rows} rowKey={(row) => row.id} searchPlaceholder="Search resources or members…" filters={[{ key: 'status', label: 'All statuses', options: [{ value: 'issued', label: 'Issued' }, { value: 'overdue', label: 'Overdue' }, { value: 'returned', label: 'Returned' }], match: (row, value) => row.status === value }]} emptyTitle="No circulation records" actions={(row) => row.status === 'returned' ? <span className="ec-small ec-muted">Complete</span> : <button type="button" className="ec-btn ec-btn--sm" onClick={() => { setReturned((prev) => ({ ...prev, [row.id]: new Date().toISOString().slice(0, 10) })); toast.success({ title: 'Book returned', message: `${resource(row.resourceId)?.title ?? 'Resource'} was returned.` }) }}>Mark returned</button>} /></div></Panel></div>
}
