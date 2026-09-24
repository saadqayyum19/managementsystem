import { useState } from 'react'
import { AlertTriangle, BookMarked, Download, Star } from 'lucide-react'
import { Badge, PageHeader, Panel, Tabs } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { RoleGate } from '../../components/ui/RoleGate'
import { useMockQuery } from '../../hooks/useMockQuery'
import { useExportStub } from '../../hooks/useExportStub'
import { mockApi } from '../../services/mockApi'
import { nameOf, subjects } from '../../mocks'
import type { UserRole } from '../../store/authSlice'

const staffRoles: UserRole[] = ['super_admin', 'principal', 'teacher']
const typeTone = { ebook: 'info', journal: 'warning', video: 'success', paper: 'neutral' } as const
const issueTone = { issued: 'info', returned: 'success', overdue: 'danger' } as const

export function ELibraryPage() {
  const [tab, setTab] = useState('resources')
  const toast = useToast()
  const { exportStub, notImplemented } = useExportStub()
  const query = useMockQuery(['library'], mockApi.libraryBoard)

  const header = <PageHeader eyebrow="Academics · library" title="E-Library" subtitle="Digital catalogue plus physical circulation, fines and due dates." actions={<>
    <RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--ghost" onClick={() => exportStub('Library catalogue')}>Export</button></RoleGate>
    <RoleGate roles={staffRoles}><button type="button" className="ec-btn" onClick={() => notImplemented('Resource upload')}>Add resource</button></RoleGate>
  </>} />

  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /><div style={{ height: 16 }} /><SkeletonCards count={1} height={320} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>

  const { resources, issues } = data
  const totalDownloads = resources.reduce((sum, item) => sum + item.downloads, 0)
  const averageRating = resources.length === 0 ? 0 : Math.round((resources.reduce((sum, item) => sum + item.rating, 0) / resources.length) * 10) / 10
  const openIssues = issues.filter((item) => item.status !== 'returned').length
  const fines = issues.reduce((sum, item) => sum + item.fine, 0)
  const subjectName = (subjectId: string | null) => (subjectId ? subjects.find((item) => item.id === subjectId)?.name ?? subjectId : 'General')
  const resourceTitle = (resourceId: string) => resources.find((item) => item.id === resourceId)?.title ?? resourceId

  const resourceColumns: Array<DataTableColumn<(typeof resources)[number]>> = [
    { key: 'title', header: 'Title', render: (row) => <div className="ec-table__primary"><strong>{row.title}</strong><span>{row.author}</span></div>, searchValue: (row) => `${row.title} ${row.author}` },
    { key: 'category', header: 'Category', render: (row) => <Badge tone="info">{row.category}</Badge> },
    { key: 'type', header: 'Type', render: (row) => <Badge tone={typeTone[row.type]}>{row.type}</Badge> },
    { key: 'subject', header: 'Subject', render: (row) => subjectName(row.subjectId) },
    { key: 'rating', header: 'Rating', align: 'right', render: (row) => <span style={{ color: '#d97706' }}>★ {row.rating.toFixed(1)}</span>, sortValue: (row) => row.rating },
    { key: 'downloads', header: 'Downloads', align: 'right', render: (row) => row.downloads.toLocaleString(), sortValue: (row) => row.downloads },
    { key: 'size', header: 'Size', align: 'right', render: (row) => `${row.sizeMb} MB`, sortValue: (row) => row.sizeMb },
    { key: 'added', header: 'Added', render: (row) => row.addedOn, sortValue: (row) => row.addedOn },
  ]

  const issueColumns: Array<DataTableColumn<(typeof issues)[number]>> = [
    { key: 'item', header: 'Item', render: (row) => <strong>{resourceTitle(row.resourceId)}</strong>, searchValue: (row) => resourceTitle(row.resourceId) },
    { key: 'member', header: 'Member', render: (row) => <div className="ec-table__primary"><strong>{nameOf(row.memberId)}</strong><span>{row.memberRole}</span></div>, searchValue: (row) => nameOf(row.memberId) },
    { key: 'issued', header: 'Issued', render: (row) => row.issuedOn, sortValue: (row) => row.issuedOn },
    { key: 'due', header: 'Due', render: (row) => row.dueOn, sortValue: (row) => row.dueOn },
    { key: 'returned', header: 'Returned', render: (row) => row.returnedOn ?? '—' },
    { key: 'fine', header: 'Fine', align: 'right', render: (row) => (row.fine > 0 ? `$${row.fine}` : '—'), sortValue: (row) => row.fine },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={issueTone[row.status]} dot>{row.status}</Badge> },
  ]

  return <div className="ec-page">
    {header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Titles" value={resources.length} icon={BookMarked} hint="Digital catalogue" />
      <StatCard label="Downloads" value={totalDownloads.toLocaleString()} icon={Download} tone="success" delta={12.4} deltaLabel="this month" />
      <StatCard label="Avg rating" value={`${averageRating} ★`} icon={Star} tone="warning" hint="Community score" />
      <StatCard label="Open issues" value={openIssues} icon={AlertTriangle} tone={openIssues > 0 ? 'danger' : 'success'} hint={`$${fines} fines recorded`} />
    </div>
    <Panel flush>
      <div className="ec-card__body">
        <Tabs tabs={[{ id: 'resources', label: `Catalogue (${resources.length})` }, { id: 'circulation', label: `Circulation (${issues.length})` }]} active={tab} onChange={setTab} />
        <div style={{ paddingTop: 'var(--ec-space-4)' }}>
          {tab === 'resources'
            ? <DataTable columns={resourceColumns} rows={resources} rowKey={(row) => row.id} searchPlaceholder="Search titles, authors…"
                filters={[{ key: 'type', label: 'All formats', options: [{ value: 'ebook', label: 'E-book' }, { value: 'journal', label: 'Journal' }, { value: 'video', label: 'Video' }, { value: 'paper', label: 'Paper' }], match: (row, value) => row.type === value }]}
                emptyTitle="Catalogue is empty" emptyMessage="Add the first digital resource to the library."
                actions={(row) => <RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => toast.success({ title: 'Copy issued', message: `${row.title} issued to your account.` })}>Issue</button></RoleGate>} />
            : <DataTable columns={issueColumns} rows={issues} rowKey={(row) => row.id} searchPlaceholder="Search members or titles…"
                filters={[{ key: 'status', label: 'All statuses', options: [{ value: 'issued', label: 'Issued' }, { value: 'returned', label: 'Returned' }, { value: 'overdue', label: 'Overdue' }], match: (row, value) => row.status === value }]}
                emptyTitle="No circulation records" emptyMessage="Nothing has been borrowed yet."
                actions={(row) => row.status === 'returned'
                  ? <span className="ec-small ec-muted">—</span>
                  : <RoleGate roles={staffRoles}><button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => toast.success({ title: 'Return recorded', message: `${resourceTitle(row.resourceId)} returned by ${nameOf(row.memberId)}.` })}>Mark returned</button></RoleGate>} />}
        </div>
      </div>
    </Panel>
  </div>
}

