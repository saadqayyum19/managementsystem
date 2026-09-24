import { useState } from 'react'
import { Boxes, PackagePlus, TriangleAlert, Warehouse } from 'lucide-react'
import { Badge, PageHeader, Panel, ProgressBar } from '../../components/ui/primitives'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { FormGrid, SelectField, TextField } from '../../components/ui/FormField'
import { Modal } from '../../components/ui/Modal'
import { StatCard } from '../../components/ui/StatCard'
import { SkeletonCards } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'
import { useToast } from '../../components/ui/Toast'
import { RoleGate } from '../../components/ui/RoleGate'
import { useMockQuery } from '../../hooks/useMockQuery'
import { mockApi } from '../../services/mockApi'
import { isoDate, TODAY } from '../../mocks/seed'
import type { InventoryItem } from '../../mocks/types'
import type { UserRole } from '../../store/authSlice'

const leadership: UserRole[] = ['super_admin', 'principal']
const categories: InventoryItem['category'][] = ['lab', 'sports', 'furniture', 'it', 'stationery']

export function InventoryPage() {
  const [open, setOpen] = useState(false)
  const [extra, setExtra] = useState<InventoryItem[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ name: '', category: 'stationery', quantity: '1', unit: 'units', location: '', vendor: '', cost: '1' })
  const toast = useToast()
  const query = useMockQuery(['inventory'], mockApi.inventoryBoard)
  const header = <PageHeader eyebrow="Operations · assets" title="Inventory" subtitle="Stock levels, reorder thresholds and asset condition." actions={<RoleGate roles={leadership}><button type="button" className="ec-btn" onClick={() => setOpen(true)}>Add item</button></RoleGate>} />
  const data = query.data
  if (query.isLoading) return <div className="ec-page">{header}<SkeletonCards count={4} /></div>
  if (query.isError || !data) return <div className="ec-page">{header}<ErrorState onRetry={() => query.refetch()} /></div>
  const rows = [...extra, ...data.items]
  const low = rows.filter((row) => row.quantity <= row.reorderLevel)
  const save = () => {
    const next = { name: form.name.trim() ? '' : 'Item name is required.', quantity: Number(form.quantity) >= 0 ? '' : 'Quantity cannot be negative.', unit: form.unit.trim() ? '' : 'Unit is required.', location: form.location.trim() ? '' : 'Location is required.', vendor: form.vendor.trim() ? '' : 'Vendor is required.', cost: Number(form.cost) >= 0 ? '' : 'Cost cannot be negative.' }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    const quantity = Number(form.quantity)
    setExtra((list) => [{ id: `inv-x${list.length + 1}`, name: form.name.trim(), category: form.category as InventoryItem['category'], quantity, unit: form.unit.trim(), location: form.location.trim(), vendor: form.vendor.trim(), purchasedOn: isoDate(TODAY), unitCost: Number(form.cost), condition: 'new', reorderLevel: 5 }, ...list])
    setOpen(false)
    toast.success({ title: 'Inventory item added', message: `${quantity} ${form.unit.trim()} of ${form.name.trim()} were added.` })
  }
  const columns: Array<DataTableColumn<InventoryItem>> = [
    { key: 'name', header: 'Item', render: (row) => <div className="ec-table__primary"><strong>{row.name}</strong><span>{row.vendor} · {row.location}</span></div>, searchValue: (row) => `${row.name} ${row.vendor} ${row.location}` },
    { key: 'category', header: 'Category', render: (row) => <Badge tone="info">{row.category}</Badge> },
    { key: 'stock', header: 'Stock', render: (row) => <div><span className="ec-small">{row.quantity} {row.unit}</span><ProgressBar value={row.quantity} max={Math.max(row.reorderLevel * 3, row.quantity)} tone={row.quantity <= row.reorderLevel ? 'danger' : 'success'} /></div> },
    { key: 'cost', header: 'Unit cost', align: 'right', render: (row) => `$${row.unitCost.toLocaleString()}`, sortValue: (row) => row.unitCost },
    { key: 'condition', header: 'Condition', render: (row) => <Badge tone={row.condition === 'new' ? 'success' : row.condition === 'repair' ? 'warning' : 'neutral'}>{row.condition}</Badge> },
  ]

  return <div className="ec-page">{header}
    <div className="ec-grid ec-grid--4" style={{ marginBottom: 'var(--ec-space-4)' }}>
      <StatCard label="Items" value={rows.length} icon={Boxes} />
      <StatCard label="Units" value={rows.reduce((sum, row) => sum + row.quantity, 0)} icon={Warehouse} tone="info" />
      <StatCard label="Reorder" value={low.length} icon={TriangleAlert} tone="warning" />
      <StatCard label="Value" value={`$${rows.reduce((sum, row) => sum + row.quantity * row.unitCost, 0).toLocaleString()}`} icon={PackagePlus} tone="success" />
    </div>
    <Panel flush><div className="ec-card__body">
      <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} searchPlaceholder="Search items, vendors, locations…"
        filters={[{ key: 'category', label: 'All categories', options: categories.map((value) => ({ value, label: value })), match: (row, value) => row.category === value }, { key: 'condition', label: 'All conditions', options: ['new', 'good', 'repair', 'retired'].map((value) => ({ value, label: value })), match: (row, value) => row.condition === value }]}
        emptyTitle="No inventory items" emptyMessage="Add the first stock item to begin tracking." />
    </div></Panel>
    <Modal open={open} title="Add inventory item" description="Creates a new stock record in mock mode." onClose={() => setOpen(false)} footer={<><button type="button" className="ec-btn ec-btn--ghost" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="ec-btn" onClick={save}>Add item</button></>}>
      <FormGrid>
        <TextField label="Item name" name="item-name" value={form.name} onChange={(name) => setForm((prev) => ({ ...prev, name }))} error={errors.name} required />
        <SelectField label="Category" name="item-category" value={form.category} onChange={(category) => setForm((prev) => ({ ...prev, category }))} options={categories.map((value) => ({ value, label: value }))} />
        <TextField label="Quantity" name="item-quantity" type="number" value={form.quantity} onChange={(quantity) => setForm((prev) => ({ ...prev, quantity }))} error={errors.quantity} required />
        <TextField label="Unit" name="item-unit" value={form.unit} onChange={(unit) => setForm((prev) => ({ ...prev, unit }))} error={errors.unit} required />
        <TextField label="Location" name="item-location" value={form.location} onChange={(location) => setForm((prev) => ({ ...prev, location }))} error={errors.location} required />
        <TextField label="Vendor" name="item-vendor" value={form.vendor} onChange={(vendor) => setForm((prev) => ({ ...prev, vendor }))} error={errors.vendor} required />
        <TextField label="Unit cost" name="item-cost" type="number" value={form.cost} onChange={(cost) => setForm((prev) => ({ ...prev, cost }))} error={errors.cost} required />
      </FormGrid>
    </Modal>
  </div>
}