import { useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, Inbox, Search, X } from 'lucide-react'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { SkeletonRows } from './Skeleton'

export type DataTableColumn<T> = {
  key: string
  header: string
  render: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  searchValue?: (row: T) => string
  align?: 'left' | 'right' | 'center'
  width?: string
}

export type DataTableFilter<T> = {
  key: string
  label: string
  options: Array<{ value: string; label: string }>
  match: (row: T, value: string) => boolean
}

export type DataTableProps<T> = {
  columns: Array<DataTableColumn<T>>
  rows: T[]
  rowKey: (row: T) => string
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  searchable?: boolean
  searchPlaceholder?: string
  filters?: Array<DataTableFilter<T>>
  toolbar?: ReactNode
  actions?: (row: T) => ReactNode
  actionsHeader?: string
  pageSize?: number
  pageSizeOptions?: number[]
  emptyTitle?: string
  emptyMessage?: string
  emptyAction?: ReactNode
  onRowClick?: (row: T) => void
  footerNote?: string
}

function scalarSearchValues(row: unknown): string[] {
  if (!row || typeof row !== 'object') return []
  const values: string[] = []
  for (const value of Object.values(row as Record<string, unknown>)) {
    if (typeof value === 'string' || typeof value === 'number') values.push(String(value))
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const nested of Object.values(value as Record<string, unknown>)) if (typeof nested === 'string' || typeof nested === 'number') values.push(String(nested))
    }
  }
  return values
}

export function DataTable<T>({
  columns, rows, rowKey, isLoading = false, isError = false, onRetry, searchable = true, searchPlaceholder = 'Search…',
  filters = [], toolbar, actions, actionsHeader = '', pageSize = 8, pageSizeOptions = [8, 16, 32], emptyTitle = 'Nothing here yet',
  emptyMessage = 'No records match the current filters.', emptyAction, onRowClick, footerNote,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [filterState, setFilterState] = useState<Record<string, string>>({})
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(pageSize)

  const activeFilters = useMemo(() => filters.filter((filter) => (filterState[filter.key] ?? '') !== ''), [filters, filterState])

  const processed = useMemo(() => {
    const term = search.trim().toLowerCase()
    let output = rows
    if (term) {
      output = output.filter((row) => {
        const custom = columns.map((column) => column.searchValue?.(row)).filter(Boolean).join(' ')
        return `${custom} ${scalarSearchValues(row).join(' ')}`.toLowerCase().includes(term)
      })
    }
    for (const filter of activeFilters) {
      const value = filterState[filter.key]
      if (value) output = output.filter((row) => filter.match(row, value))
    }
    const column = sort ? columns.find((item) => item.key === sort.key) : undefined
    if (sort && column?.sortValue) {
      const factor = sort.direction === 'asc' ? 1 : -1
      output = [...output].sort((a, b) => {
        const left = column.sortValue!(a)
        const right = column.sortValue!(b)
        if (typeof left === 'number' && typeof right === 'number') return (left - right) * factor
        return String(left).localeCompare(String(right)) * factor
      })
    }
    return output
  }, [rows, search, activeFilters, filterState, sort, columns])

  const totalPages = Math.max(1, Math.ceil(processed.length / size))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * size
  const visible = processed.slice(start, start + size)
  const columnCount = columns.length + (actions ? 1 : 0)

  const toggleSort = (key: string) => setSort((current) => current?.key === key ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' })
  const updateFilter = (key: string, value: string) => { setFilterState((current) => ({ ...current, [key]: value })); setPage(1) }
  const resetAll = () => { setSearch(''); setFilterState({}); setSort(null); setPage(1) }
  return <section className="ec-card">
    <div className="ec-toolbar">
      {searchable && <label className="ec-search"><Search size={15} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder={searchPlaceholder} aria-label="Search" />{search && <button type="button" className="ec-btn ec-btn--icon ec-btn--sm" onClick={() => setSearch('')} aria-label="Clear search"><X size={13} /></button>}</label>}
      {filters.map((filter) => <select key={filter.key} className="ec-select" style={{ width: 'auto' }} aria-label={filter.label} value={filterState[filter.key] ?? ''} onChange={(event) => updateFilter(filter.key, event.target.value)}>
        <option value="">{filter.label}</option>
        {filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>)}
      {(search !== '' || activeFilters.length > 0) && <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={resetAll}>Reset</button>}
      <span className="ec-spacer" />
      {toolbar}
    </div>
    <div className="ec-table-wrap">
      <table className="ec-table">
        <thead><tr>
          {columns.map((column) => <th key={column.key} style={{ width: column.width, textAlign: column.align ?? 'left' }}>
            {column.sortValue
              ? <button type="button" onClick={() => toggleSort(column.key)}>{column.header}{sort?.key === column.key ? (sort.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ChevronsUpDown size={12} />}</button>
              : column.header}
          </th>)}
          {actions && <th style={{ textAlign: 'right' }}>{actionsHeader}</th>}
        </tr></thead>
        <tbody>
          {isLoading
            ? <SkeletonRows rows={Math.min(size, 5)} columns={columnCount} />
            : isError
              ? <tr><td colSpan={columnCount}><ErrorState title="Could not load records" message="The mock data layer returned an error. Retry, or switch the demo state back to Live." onRetry={onRetry} /></td></tr>
              : visible.length === 0
                ? <tr><td colSpan={columnCount}><EmptyState icon={Inbox} title={emptyTitle} message={emptyMessage} action={emptyAction} /></td></tr>
                : visible.map((row) => <tr key={rowKey(row)} onClick={onRowClick ? () => onRowClick(row) : undefined} style={onRowClick ? { cursor: 'pointer' } : undefined}>
                  {columns.map((column) => <td key={column.key} style={{ textAlign: column.align ?? 'left' }}>{column.render(row)}</td>)}
                  {actions && <td style={{ textAlign: 'right' }}><div className="ec-row" style={{ justifyContent: 'flex-end' }}>{actions(row)}</div></td>}
                </tr>)}
        </tbody>
      </table>
    </div>
    <footer className="ec-pagination">
      <span>{footerNote ?? (processed.length === 0 ? 'No records' : `Showing ${start + 1}–${Math.min(start + size, processed.length)} of ${processed.length}`)}</span>
      <div className="ec-pagination__pages">
        <select className="ec-select" style={{ width: 'auto', height: 28 }} aria-label="Rows per page" value={size} onChange={(event) => { setSize(Number(event.target.value)); setPage(1) }}>{pageSizeOptions.map((option) => <option key={option} value={option}>{option} / page</option>)}</select>
        <button type="button" className="ec-page-btn" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page"><ChevronLeft size={14} /></button>
        {Array.from({ length: totalPages }).slice(0, 7).map((_, index) => <button key={index} type="button" className="ec-page-btn" data-active={index + 1 === currentPage} onClick={() => setPage(index + 1)}>{index + 1}</button>)}
        {totalPages > 7 && <span>…</span>}
        <button type="button" className="ec-page-btn" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} aria-label="Next page"><ChevronRight size={14} /></button>
      </div>
    </footer>
  </section>
}
