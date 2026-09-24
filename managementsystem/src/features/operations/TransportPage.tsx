import { useState } from 'react'
import { Bus, Clock3, MapPin, Users } from 'lucide-react'
import { Badge, PageHeader, Panel } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { FormGrid, TextField } from '../../components/ui/FormField'
import { Modal } from '../../components/ui/Modal'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { RoleGate } from '../../components/ui/RoleGate'
import { useMockQuery } from '../../hooks/useMockQuery'
import { mockApi } from '../../services/mockApi'
import type { TransportRoute } from '../../mocks/types'
import type { UserRole } from '../../store/authSlice'

const leadership: UserRole[] = ['super_admin', 'principal']

export function TransportPage() {
  const [open, setOpen] = useState(false); const [extra, setExtra] = useState<TransportRoute[]>([])
  const [form, setForm] = useState({ name: '', driver: '', vehicle: '', capacity: '36' }); const [errors, setErrors] = useState<Record<string, string>>({})
  const toast = useToast(); const query = useMockQuery(['transport'], mockApi.transportBoard)
  const header = <PageHeader eyebrow="Operations · transport" title="Transport management" subtitle="Routes, drivers, vehicles and student allocations." actions={<RoleGate roles={leadership}><button type="button" className="ec-btn" onClick={() => setOpen(true)}>Add route</button></RoleGate>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>
  const rows = [...extra, ...data.routes]
  const save = () => { const next = { name: form.name.trim() ? '' : 'Route name is required.', driver: form.driver.trim() ? '' : 'Driver is required.', vehicle: form.vehicle.trim() ? '' : 'Vehicle number is required.', capacity: Number(form.capacity) > 0 ? '' : 'Capacity must be positive.' }; setErrors(next); if (Object.values(next).some(Boolean)) return; const capacity = Number(form.capacity); setExtra((list) => [{ id: `rt-x${list.length + 1}`, name: form.name.trim(), code: `RT-X${list.length + 1}`, driverName: form.driver.trim(), driverPhone: '—', vehicleNo: form.vehicle.trim(), capacity, assignedStudentIds: [], stops: ['Campus gate'], morningDeparture: '07:00', eveningDeparture: '16:00', status: 'active' }, ...list]); setOpen(false); toast.success({ title: 'Route created', message: `${form.name.trim()} is ready for allocations.` }) }
  const columns: Array<DataTableColumn<TransportRoute>> = [{ key: 'name', header: 'Route', render: (row) => <div className="ec-table__primary"><strong>{row.name}</strong><span>{row.code} · {row.vehicleNo}</span></div>, searchValue: (row) => `${row.name} ${row.code} ${row.vehicleNo}` }, { key: 'driver', header: 'Driver', render: (row) => <div className="ec-table__primary"><strong>{row.driverName}</strong><span>{row.driverPhone}</span></div> }, { key: 'stops', header: 'Stops', render: (row) => row.stops.join(' → '), searchValue: (row) => row.stops.join(' ') }, { key: 'time', header: 'Departure', render: (row) => `${row.morningDeparture} / ${row.eveningDeparture}` }, { key: 'load', header: 'Load', align: 'right', render: (row) => `${row.assignedStudentIds.length}/${row.capacity}`, sortValue: (row) => row.assignedStudentIds.length }, { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'active' ? 'success' : 'warning'} dot>{row.status}</Badge> }]
  return <div className="ec-page">{header}<div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}><StatCard label="Routes" value={rows.length} icon={Bus} /><StatCard label="Students" value={rows.reduce((sum, row) => sum + row.assignedStudentIds.length, 0)} icon={Users} tone="info" /><StatCard label="Active" value={rows.filter((row) => row.status === 'active').length} icon={Clock3} tone="success" /><StatCard label="Maintenance" value={rows.filter((row) => row.status === 'maintenance').length} icon={MapPin} tone="warning" /></div><Panel flush><div className="ec-card__body"><DataTable columns={columns} rows={rows} rowKey={(row) => row.id} searchPlaceholder="Search routes, drivers, stops…" filters={[{ key: 'status', label: 'All statuses', options: [{ value: 'active', label: 'Active' }, { value: 'maintenance', label: 'Maintenance' }], match: (row, value) => row.status === value }]} emptyTitle="No transport routes" /></div></Panel><Modal open={open} title="Add transport route" description="Creates an unallocated route in the mock fleet." onClose={() => setOpen(false)} footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="ec-btn" onClick={save}>Create route</button></>}><FormGrid><TextField label="Route name" name="route-name" value={form.name} onChange={(name) => setForm((prev) => ({ ...prev, name }))} error={errors.name} required /><TextField label="Driver" name="route-driver" value={form.driver} onChange={(driver) => setForm((prev) => ({ ...prev, driver }))} error={errors.driver} required /><TextField label="Vehicle number" name="route-vehicle" value={form.vehicle} onChange={(vehicle) => setForm((prev) => ({ ...prev, vehicle }))} error={errors.vehicle} required /><TextField label="Capacity" name="route-capacity" type="number" value={form.capacity} onChange={(capacity) => setForm((prev) => ({ ...prev, capacity }))} error={errors.capacity} required /></FormGrid></Modal></div>
}
