import { useState } from 'react'
import { BedDouble, Building2, ShieldCheck, Users } from 'lucide-react'
import { Badge, PageHeader, Panel } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { Modal } from '../../components/ui/Modal'
import { KeyValue, ProgressBar } from '../../components/ui/primitives'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { useMockQuery } from '../../hooks/useMockQuery'
import { mockApi } from '../../services/mockApi'
import { nameOf } from '../../mocks'
import type { HostelRoom } from '../../mocks/types'
type RoomRow = HostelRoom & { block: string; blockId: string; wardenId: string; blockType: 'boys' | 'girls' }

export function HostelPage() {
  const [selected, setSelected] = useState<RoomRow | null>(null)
  const toast = useToast(); const query = useMockQuery(['hostel'], mockApi.hostelBoard)
  const header = <PageHeader eyebrow="Operations · residence" title="Hostel management" subtitle="Room capacity, occupancy and warden assignments." />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>
  const rooms: RoomRow[] = data.blocks.flatMap((block) => block.rooms.map((room) => ({ ...room, block: block.name, blockId: block.id, wardenId: block.wardenId, blockType: block.type })))
  const occupied = rooms.reduce((sum, room) => sum + room.occupantIds.length, 0); const capacity = rooms.reduce((sum, room) => sum + room.capacity, 0)
  const columns: Array<DataTableColumn<(typeof rooms)[number]>> = [{ key: 'room', header: 'Room', render: (row) => <div className="ec-table__primary"><strong>{row.number}</strong><span>{row.block} · Floor {row.floor}</span></div> }, { key: 'warden', header: 'Warden', render: (row) => nameOf(row.wardenId) }, { key: 'type', header: 'Block type', render: (row) => <Badge tone={row.blockType === 'girls' ? 'info' : 'success'}>{row.blockType}</Badge> }, { key: 'occupancy', header: 'Occupancy', render: (row) => <div><span className="ec-small">{row.occupantIds.length}/{row.capacity}</span><ProgressBar value={row.occupantIds.length} max={row.capacity} tone={row.occupantIds.length >= row.capacity ? 'warning' : 'success'} /></div> }, { key: 'residents', header: 'Residents', render: (row) => row.occupantIds.map((id) => nameOf(id)).join(', ') || '—' }, { key: 'action', header: 'Details', align: 'right', render: (row) => <button type="button" className="ec-btn ec-btn--ghost ec-btn--sm" onClick={() => setSelected(row)}>View</button> }]
  return <div className="ec-page">{header}<div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}><StatCard label="Blocks" value={data.blocks.length} icon={Building2} /><StatCard label="Rooms" value={rooms.length} icon={BedDouble} tone="info" /><StatCard label="Occupied" value={occupied} icon={Users} tone="success" /><StatCard label="Occupancy" value={`${capacity ? Math.round(occupied / capacity * 100) : 0}%`} icon={ShieldCheck} tone="warning" /></div><Panel flush><div className="ec-card__body"><DataTable columns={columns} rows={rooms} rowKey={(row) => row.id} searchPlaceholder="Search rooms, blocks, residents…" filters={[{ key: 'type', label: 'All blocks', options: [{ value: 'boys', label: 'Boys' }, { value: 'girls', label: 'Girls' }], match: (row, value) => row.blockType === value }]} emptyTitle="No hostel rooms" /></div></Panel><Modal open={Boolean(selected)} title={selected?.number ?? 'Room details'} description={selected?.block} onClose={() => setSelected(null)} footer={<button type="button" className="ec-btn" onClick={() => { setSelected(null); toast.success({ title: 'Room verified', message: 'Occupancy was verified in the mock register.' }) }}>Verify occupancy</button>}>{selected && <KeyValue items={[{ label: 'Floor', value: selected.floor }, { label: 'Warden', value: nameOf(selected.wardenId) }, { label: 'Capacity', value: selected.capacity }, { label: 'Residents', value: selected.occupantIds.length ? selected.occupantIds.map((id) => nameOf(id)).join(', ') : 'Vacant' }]} />}</Modal></div>
}
