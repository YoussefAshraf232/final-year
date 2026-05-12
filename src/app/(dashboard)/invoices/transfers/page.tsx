'use client';

import { useState, useMemo } from 'react';
import {
  Clock,
  Truck,
  CheckCircle2,
  Home,
  Plus,
  Eye,
  Trash2,
  Download,
  X,
  Building2,
} from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import DemoModeBanner from '@/components/ui/DemoModeBanner';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  useInternalInvoices,
  useInternalInvoicesSummary,
  useCreateInternalInvoice,
  useDeleteInternalInvoice,
} from '@/hooks/useInternalInvoices';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useProducts } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { InternalInvoice } from '@/types/internal-invoice.types';
import { formatDate } from '@/lib/formatters';

interface KpiCardProps {
  title: string;
  value: number | string;
  hint?: string;
  icon: React.ReactNode;
  tone: string;
}

function KpiCard({ title, value, hint, icon, tone }: KpiCardProps) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tone}`}>
          {icon}
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500">{title}</div>
          <div className="text-2xl font-bold text-gray-900 mt-0.5">{value}</div>
          {hint && <div className="text-xs text-gray-400 mt-0.5">{hint}</div>}
        </div>
      </div>
    </Card>
  );
}

interface ItemForm {
  productId: string;
  amount: string;
}

export default function DistributeProductsPage() {
  const { isGuest } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [destFilter, setDestFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const debouncedSearch = useDebounce(search.trim(), 300);

  const [selected, setSelected] = useState<InternalInvoice | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [destinationId, setDestinationId] = useState<string>('');
  const [items, setItems] = useState<ItemForm[]>([{ productId: '', amount: '1' }]);
  const [formError, setFormError] = useState<string | null>(null);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<InternalInvoice | null>(null);

  const enabled = !isGuest;
  const { data, isLoading, error, refetch } = useInternalInvoices(
    { page: 0, size: 200 },
    { enabled }
  );
  const { data: summary } = useInternalInvoicesSummary({ enabled });
  const { data: warehousesData } = useWarehouses({ page: 0, size: 100 }, { enabled });
  const { data: productsData } = useProducts({ page: 0, size: 200 }, { enabled });

  const createMutation = useCreateInternalInvoice();
  const deleteMutation = useDeleteInternalInvoice();

  const warehouses = warehousesData?.content ?? [];
  const products = productsData?.content ?? [];
  const central = useMemo(() => warehouses.find((w) => w.isCentral), [warehouses]);
  const branches = useMemo(() => warehouses.filter((w) => !w.isCentral), [warehouses]);

  const showDemoData = isGuest;
  const showError = !showDemoData && !!error;
  const allInvoices = data?.content ?? [];

  const filtered = useMemo(() => {
    return allInvoices.filter((inv) => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const hit =
          String(inv.id).includes(q) ||
          (inv.sourceWarehouse?.address?.toLowerCase().includes(q) ?? false) ||
          (inv.destinationWarehouse?.address?.toLowerCase().includes(q) ?? false);
        if (!hit) return false;
      }
      if (destFilter && String(inv.destinationWarehouse?.id ?? inv.destinationWarehouseId ?? '') !== destFilter) {
        return false;
      }
      // Status: existing flow is immediate-complete → treat as COMPLETED.
      if (statusFilter && statusFilter !== 'COMPLETED') return false;
      if (dateFrom) {
        if (new Date(inv.createdAt) < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        if (new Date(inv.createdAt) > new Date(dateTo)) return false;
      }
      return true;
    });
  }, [allInvoices, debouncedSearch, destFilter, statusFilter, dateFrom, dateTo]);

  function openCreate() {
    setDestinationId('');
    setItems([{ productId: '', amount: '1' }]);
    setFormError(null);
    setCreateOpen(true);
  }

  async function handleCreate() {
    if (!central) {
      setFormError('No central warehouse configured');
      return;
    }
    if (!destinationId) {
      setFormError('Destination warehouse required');
      return;
    }
    if (Number(destinationId) === central.id) {
      setFormError('Destination cannot equal source');
      return;
    }
    const validItems = items.filter((i) => i.productId && Number(i.amount) > 0);
    if (validItems.length === 0) {
      setFormError('At least one item with quantity > 0 required');
      return;
    }
    try {
      await createMutation.mutateAsync({
        sourceWarehouseId: central.id,
        destinationWarehouseId: Number(destinationId),
        items: validItems.map((i) => ({
          productId: Number(i.productId),
          amount: Number(i.amount),
        })),
      });
      setCreateOpen(false);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setFormError(err?.response?.data?.message || err?.message || 'Failed to create');
    }
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    try {
      await deleteMutation.mutateAsync(cancelTarget.id);
      setCancelOpen(false);
      setCancelTarget(null);
      if (selected?.id === cancelTarget.id) setSelected(null);
    } catch (e) {
      console.error(e);
    }
  }

  function exportCsv() {
    const headers = [
      'Transfer ID',
      'From Warehouse',
      'To Warehouse',
      'Requested By',
      'Items',
      'Total Qty',
      'Status',
      'Created',
    ];
    const rows = filtered.map((inv) => [
      `TRF-${String(inv.id).padStart(4, '0')}`,
      inv.sourceWarehouse?.address ?? '',
      inv.destinationWarehouse?.address ?? '',
      inv.user ? `${inv.user.firstName ?? ''} ${inv.user.lastName ?? ''}`.trim() || inv.user.username : '',
      String(inv.items?.length ?? 0),
      String(inv.items?.reduce((s, it) => s + (it.amount ?? 0), 0) ?? 0),
      'Completed',
      formatDate(inv.createdAt),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transfers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalQty = (inv: InternalInvoice) =>
    inv.items?.reduce((s, it) => s + (it.amount ?? 0), 0) ?? 0;

  const columns = [
    {
      key: 'id',
      label: 'Transfer ID',
      render: (inv: InternalInvoice) => (
        <button
          onClick={() => setSelected(inv)}
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          TRF-{String(inv.id).padStart(4, '0')}
        </button>
      ),
    },
    {
      key: 'sourceWarehouse',
      label: 'From Warehouse',
      render: (inv: InternalInvoice) => (
        <span className="text-gray-700 text-sm">{inv.sourceWarehouse?.address ?? '—'}</span>
      ),
    },
    {
      key: 'destinationWarehouse',
      label: 'To Warehouse',
      render: (inv: InternalInvoice) => (
        <span className="text-gray-700 text-sm">{inv.destinationWarehouse?.address ?? '—'}</span>
      ),
    },
    {
      key: 'user',
      label: 'Requested By',
      render: (inv: InternalInvoice) => (
        <span className="text-gray-700 text-sm">
          {inv.user
            ? `${inv.user.firstName ?? ''} ${inv.user.lastName ?? ''}`.trim() || inv.user.username
            : '—'}
        </span>
      ),
    },
    {
      key: 'items',
      label: 'Items',
      render: (inv: InternalInvoice) => <span className="font-medium">{inv.items?.length ?? 0}</span>,
    },
    {
      key: 'totalQty',
      label: 'Total Qty',
      render: (inv: InternalInvoice) => (
        <span className="font-medium">{totalQty(inv).toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: () => <Badge variant="success">Completed</Badge>,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (inv: InternalInvoice) => (
        <span className="text-gray-600 text-sm">{formatDate(inv.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'w-24',
      render: (inv: InternalInvoice) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setSelected(inv)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCancelTarget(inv);
              setCancelOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const pending = summary?.pendingCount ?? 0;
  const inTransit = summary?.inTransitCount ?? 0;
  const completedThisWeek = summary?.completedThisWeekCount ?? 0;
  const destinationsCount = summary?.destinationWarehousesCount ?? branches.length;

  return (
    <>
      <Topbar
        title="Distribute Products"
        subtitle="Create and track product transfers from the central warehouse to branch warehouses"
      />

      <div className="p-6 flex gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <BreadCrumb
              items={[
                { label: 'Stock', href: '/stock' },
                { label: 'Distribute Products' },
              ]}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportCsv}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                New Distribution
              </Button>
            </div>
          </div>

          {showDemoData && <DemoModeBanner resource="warehouse transfers" />}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              title="Pending"
              value={pending}
              hint="Awaiting dispatch"
              icon={<Clock className="h-6 w-6 text-violet-600" />}
              tone="bg-violet-50"
            />
            <KpiCard
              title="In Transit"
              value={inTransit}
              hint="On the way to destinations"
              icon={<Truck className="h-6 w-6 text-blue-600" />}
              tone="bg-blue-50"
            />
            <KpiCard
              title="Completed This Week"
              value={completedThisWeek}
              hint="Last 7 days"
              icon={<CheckCircle2 className="h-6 w-6 text-emerald-600" />}
              tone="bg-emerald-50"
            />
            <KpiCard
              title="Destination Warehouses"
              value={destinationsCount}
              hint="Active branches"
              icon={<Home className="h-6 w-6 text-amber-600" />}
              tone="bg-amber-50"
            />
          </div>

          {showError ? (
            <ErrorState
              title="Could not load product distributions"
              message="Check that the backend is running and your session is valid."
              onRetry={() => void refetch()}
            />
          ) : (
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 items-end">
                <Input
                  id="trf-search"
                  label="Search"
                  placeholder="Search by transfer ID, warehouse, or product"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Select
                  id="trf-status"
                  label="Status"
                  options={[
                    { value: '', label: 'All Statuses' },
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'IN_TRANSIT', label: 'In Transit' },
                    { value: 'COMPLETED', label: 'Completed' },
                    { value: 'CANCELLED', label: 'Cancelled' },
                  ]}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
                <Select
                  id="trf-dest"
                  label="Destination Warehouse"
                  options={[
                    { value: '', label: 'All Warehouses' },
                    ...branches.map((w) => ({ value: String(w.id), label: w.address })),
                  ]}
                  value={destFilter}
                  onChange={(e) => setDestFilter(e.target.value)}
                />
                <Input
                  id="trf-from"
                  type="date"
                  label="From"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <Input
                  id="trf-to"
                  type="date"
                  label="To"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-sm">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">Source:</span>
                <span>{central?.address ?? 'No central warehouse'}</span>
              </div>

              <Table
                columns={columns}
                data={filtered}
                keyExtractor={(inv) => inv.id}
                isLoading={!showDemoData && isLoading}
                emptyMessage={
                  debouncedSearch || statusFilter || destFilter || dateFrom || dateTo
                    ? 'No records match the current filters.'
                    : 'No product distributions found.'
                }
              />
            </Card>
          )}
        </div>

        {selected && (
          <aside className="w-96 bg-white border border-gray-200/80 rounded-xl shadow-sm flex flex-col self-start sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Transfer Details</h3>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100" aria-label="Close">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div>
                <div className="font-semibold text-gray-900">
                  TRF-{String(selected.id).padStart(4, '0')}
                </div>
                <Badge variant="success">Completed</Badge>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">From</span>
                  <span className="text-gray-900 font-medium">{selected.sourceWarehouse?.address ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">To</span>
                  <span className="text-gray-900 font-medium">{selected.destinationWarehouse?.address ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Requested By</span>
                  <span className="text-gray-900 font-medium">
                    {selected.user
                      ? `${selected.user.firstName ?? ''} ${selected.user.lastName ?? ''}`.trim() ||
                        selected.user.username
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-900 font-medium">{formatDate(selected.createdAt)}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="font-medium text-gray-900 mb-2">Items</div>
                <div className="space-y-2">
                  {selected.items?.map((it) => {
                    const product = products.find((p) => p.id === it.productId);
                    return (
                      <div
                        key={it.productId}
                        className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {product?.name ?? `Product #${it.productId}`}
                          </div>
                          {product?.sku && <div className="text-xs text-gray-500">SKU: {product.sku}</div>}
                        </div>
                        <div className="font-semibold text-gray-900">{it.amount}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => {
                    setCancelTarget(selected);
                    setCancelOpen(true);
                  }}
                >
                  Delete Transfer
                </Button>
              </div>
            </div>
          </aside>
        )}
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Distribution" size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Source Warehouse</label>
              <div className="rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900">
                {central?.address ?? 'No central warehouse'}
              </div>
            </div>
            <Select
              id="form-dest"
              label="Destination Warehouse"
              options={[
                { value: '', label: 'Select branch warehouse' },
                ...branches.map((w) => ({ value: String(w.id), label: w.address })),
              ]}
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Items</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setItems([...items, { productId: '', amount: '1' }])}
              >
                <Plus className="h-4 w-4" />
                Add item
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Select
                      id={`item-product-${idx}`}
                      label={idx === 0 ? 'Product' : undefined}
                      options={[
                        { value: '', label: 'Select product' },
                        ...products.map((p) => ({ value: String(p.id), label: p.name })),
                      ]}
                      value={it.productId}
                      onChange={(e) => {
                        const next = [...items];
                        next[idx] = { ...it, productId: e.target.value };
                        setItems(next);
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      id={`item-amount-${idx}`}
                      label={idx === 0 ? 'Quantity' : undefined}
                      type="number"
                      min="1"
                      value={it.amount}
                      onChange={(e) => {
                        const next = [...items];
                        next[idx] = { ...it, amount: e.target.value };
                        setItems(next);
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setItems(items.filter((_, i) => i !== idx))}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} isLoading={createMutation.isPending}>
              Create Distribution
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title="Delete Transfer"
        message="Delete this transfer record? Stock changes already applied will remain."
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
