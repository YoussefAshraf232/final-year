'use client';

import { useMemo, useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Layers,
  Eye,
  MoreHorizontal,
  Plus,
  X,
} from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useWarehouses } from '@/hooks/useWarehouses';
import {
  useStockEditRequests,
  useStockEditRequest,
  useStockEditRequestSummary,
  useCreateStockEditRequest,
  useApproveStockEditRequest,
  useRejectStockEditRequest,
  useCancelStockEditRequest,
  useAddStockEditRequestComment,
} from '@/hooks/useStockEditRequests';
import {
  StockEditRequest,
  StockEditRequestFilters,
  StockEditRequestStatus,
  STOCK_EDIT_STATUS_OPTIONS,
} from '@/types/stock-edit-request.types';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import StockEditRequestDrawer from '@/components/stock/StockEditRequestDrawer';
import CreateStockEditRequestModal from '@/components/stock/CreateStockEditRequestModal';

const statusVariantMap: Record<StockEditRequestStatus, 'warning' | 'success' | 'danger' | 'default'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'default',
};
const statusLabelMap: Record<StockEditRequestStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

export default function RequestStockEditPage() {
  const { user, isGuest, isSystemAdmin, isOperationalManager } = useAuth();
  const canReview = isSystemAdmin || isOperationalManager;

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StockEditRequestStatus | ''>('');
  const [productId, setProductId] = useState<number | ''>('');
  const [warehouseId, setWarehouseId] = useState<number | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search.trim(), 300);

  const filters: StockEditRequestFilters = useMemo(() => ({
    page: 0,
    size: 50,
    search: debouncedSearch || undefined,
    status: status || undefined,
    productId: productId === '' ? undefined : productId,
    warehouseId: warehouseId === '' ? undefined : warehouseId,
    dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
    dateTo: dateTo ? new Date(`${dateTo}T23:59:59`).toISOString() : undefined,
  }), [debouncedSearch, status, productId, warehouseId, dateFrom, dateTo]);

  const listQuery = useStockEditRequests(filters, { enabled: !isGuest });
  const summaryQuery = useStockEditRequestSummary({ enabled: !isGuest });
  const detailQuery = useStockEditRequest(selectedId, { enabled: drawerOpen && !!selectedId });
  const productsQuery = useProducts({ size: 200 }, { enabled: !isGuest });
  const warehousesQuery = useWarehouses({ size: 200 }, { enabled: !isGuest });

  const createMutation = useCreateStockEditRequest();
  const approveMutation = useApproveStockEditRequest();
  const rejectMutation = useRejectStockEditRequest();
  const cancelMutation = useCancelStockEditRequest();
  const commentMutation = useAddStockEditRequestComment();

  const rows = listQuery.data?.content ?? [];
  const summary = summaryQuery.data;
  const selectedDetail = detailQuery.data ?? rows.find((r) => r.id === selectedId) ?? null;

  const productOptions = useMemo(() => ([
    { value: '', label: 'All Products' },
    ...((productsQuery.data?.content ?? []).map((p) => ({ value: String(p.id), label: p.name }))),
  ]), [productsQuery.data]);

  const warehouseOptions = useMemo(() => ([
    { value: '', label: 'All Warehouses' },
    ...((warehousesQuery.data?.content ?? []).map((w) => ({ value: String(w.id), label: w.address }))),
  ]), [warehousesQuery.data]);

  const isFiltered = !!(debouncedSearch || status || productId !== '' || warehouseId !== '' || dateFrom || dateTo);
  const showError = !isGuest && !!listQuery.error;

  const clearFilters = () => {
    setSearch(''); setStatus(''); setProductId(''); setWarehouseId(''); setDateFrom(''); setDateTo('');
  };

  const openDrawer = (id: number) => {
    setSelectedId(id);
    setDrawerOpen(true);
    setOpenMenuId(null);
  };

  const isOwner = (r: StockEditRequest) => !!user && r.requestedBy?.id === user.id;
  const canCancelRequest = (r: StockEditRequest) =>
    r.status === 'PENDING' && (isOwner(r) || canReview);

  const handleApprove = (comment?: string) => {
    if (!selectedId) return;
    approveMutation.mutate(
      { id: selectedId, data: { comment } },
      { onSuccess: () => setDrawerOpen(false) }
    );
  };
  const handleReject = (comment?: string) => {
    if (!selectedId) return;
    rejectMutation.mutate(
      { id: selectedId, data: { comment } },
      { onSuccess: () => setDrawerOpen(false) }
    );
  };
  const handleCancel = () => {
    if (!selectedId) return;
    cancelMutation.mutate(selectedId, { onSuccess: () => setDrawerOpen(false) });
  };
  const handleAddComment = (comment: string) => {
    if (!selectedId) return;
    commentMutation.mutate({ id: selectedId, data: { comment } });
  };

  const columns = [
    {
      key: 'id',
      label: 'Request ID',
      render: (r: StockEditRequest) => (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); openDrawer(r.id); }}
          className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          RSE-{String(r.id).padStart(4, '0')}
        </button>
      ),
    },
    { key: 'product', label: 'Product', render: (r: StockEditRequest) => <span className="text-gray-700">{r.product?.name ?? '—'}</span> },
    { key: 'warehouse', label: 'Warehouse', render: (r: StockEditRequest) => <span className="text-gray-600 text-sm">{r.warehouse?.address ?? '—'}</span> },
    { key: 'currentQty', label: 'Current Qty', render: (r: StockEditRequest) => <span className="text-gray-700">{r.currentQuantity}</span> },
    { key: 'requestedQty', label: 'Requested Qty', render: (r: StockEditRequest) => <span className="text-gray-700">{r.requestedQuantity}</span> },
    {
      key: 'difference',
      label: 'Difference',
      render: (r: StockEditRequest) => {
        const d = r.differenceQuantity;
        const cls = d > 0 ? 'text-emerald-600' : d < 0 ? 'text-red-600' : 'text-gray-500';
        return <span className={cn('font-semibold', cls)}>{d > 0 ? `+${d}` : d}</span>;
      },
    },
    { key: 'reason', label: 'Reason', render: (r: StockEditRequest) => <span className="text-gray-600 text-sm">{r.reason}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (r: StockEditRequest) => <Badge variant={statusVariantMap[r.status]}>{statusLabelMap[r.status]}</Badge>,
    },
    { key: 'requestedBy', label: 'Requested By', render: (r: StockEditRequest) => <span className="text-gray-600 text-sm">{r.requestedBy?.username ?? '—'}</span> },
    { key: 'date', label: 'Date', render: (r: StockEditRequest) => <span className="text-gray-500 text-sm">{formatDate(r.createdAt)}</span> },
    {
      key: 'actions',
      label: '',
      className: 'w-24',
      render: (r: StockEditRequest) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => openDrawer(r.id)}
            className="p-1.5 rounded-md hover:bg-indigo-50 text-gray-500 hover:text-indigo-600"
            title="View"
            aria-label="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
              title="More"
              aria-label="More"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {openMenuId === r.id && (
              <div className="absolute right-0 mt-1 z-20 w-44 rounded-lg border border-gray-200 bg-white shadow-lg py-1 text-sm">
                {canReview && r.status === 'PENDING' && (
                  <>
                    <MenuItem onClick={() => { setSelectedId(r.id); setOpenMenuId(null); approveMutation.mutate({ id: r.id, data: {} }); }}>Approve</MenuItem>
                    <MenuItem onClick={() => { setSelectedId(r.id); setOpenMenuId(null); rejectMutation.mutate({ id: r.id, data: {} }); }}>Reject</MenuItem>
                  </>
                )}
                <MenuItem onClick={() => openDrawer(r.id)}>Add Comment</MenuItem>
                {canCancelRequest(r) && (
                  <MenuItem onClick={() => { setOpenMenuId(null); cancelMutation.mutate(r.id); }}>Cancel Request</MenuItem>
                )}
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <Topbar title="Request Stock Edit" subtitle="Warehouse edit requests and review flow" />

      <div className="p-6 space-y-6">
        <BreadCrumb items={[{ label: 'Stock', href: '/stock' }, { label: 'Request Stock Edit' }]} />

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="Pending Requests" value={summary?.pendingRequestsCount ?? 0} icon={Clock} color="amber" hint="Awaiting review" isLoading={summaryQuery.isLoading} />
          <KpiCard label="Approved Today" value={summary?.approvedTodayCount ?? 0} icon={CheckCircle2} color="emerald" hint="Requests approved" isLoading={summaryQuery.isLoading} />
          <KpiCard label="Rejected Requests" value={summary?.rejectedRequestsCount ?? 0} icon={XCircle} color="red" hint="Requests rejected" isLoading={summaryQuery.isLoading} />
          <KpiCard label="Total Adjustments This Month" value={summary?.totalAdjustmentsThisMonth ?? 0} icon={Layers} color="indigo" hint="Across all warehouses" isLoading={summaryQuery.isLoading} />
        </section>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            <div className="lg:col-span-2">
              <Input
                id="ser-search"
                label="Search"
                placeholder="Search by request ID, product, or warehouse"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select id="ser-status" label="Status" value={status} onChange={(e) => setStatus(e.target.value as StockEditRequestStatus | '')} options={STOCK_EDIT_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} />
            <Select id="ser-warehouse-filter" label="Warehouse" value={warehouseId === '' ? '' : String(warehouseId)} onChange={(e) => setWarehouseId(e.target.value === '' ? '' : Number(e.target.value))} options={warehouseOptions} />
            <Select id="ser-product-filter" label="Product" value={productId === '' ? '' : String(productId)} onChange={(e) => setProductId(e.target.value === '' ? '' : Number(e.target.value))} options={productOptions} />
            <div className="grid grid-cols-2 gap-2">
              <Input id="ser-from" label="From" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <Input id="ser-to" label="To" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
          <div className="mt-3 flex justify-between">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" /> Clear Filters
            </Button>
            <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New Stock Edit Request
            </Button>
          </div>
        </Card>

        <Card>
          {showError ? (
            <ErrorState
              title="Could not load stock edit requests"
              message="Check that the backend is running and your session is valid."
              onRetry={() => void listQuery.refetch()}
            />
          ) : (
            <Table
              columns={columns}
              data={rows}
              keyExtractor={(r) => r.id}
              isLoading={!isGuest && listQuery.isLoading}
              emptyMessage={isFiltered ? 'No requests match the current filters.' : 'No stock edit requests found.'}
              onRowClick={(r) => setSelectedId(r.id)}
            />
          )}
          {rows.length > 0 && (
            <div className="mt-3 text-xs text-gray-500">Showing 1 to {rows.length} of {listQuery.data?.totalElements ?? rows.length} requests</div>
          )}
        </Card>
      </div>

      {drawerOpen && (
        <StockEditRequestDrawer
          key={selectedId ?? 'none'}
          isOpen={drawerOpen}
          request={selectedDetail}
          isLoading={detailQuery.isLoading}
          canReview={!!canReview}
          canCancel={selectedDetail ? canCancelRequest(selectedDetail) : false}
          isSaving={approveMutation.isPending || rejectMutation.isPending || cancelMutation.isPending || commentMutation.isPending}
          onClose={() => setDrawerOpen(false)}
          onApprove={handleApprove}
          onReject={handleReject}
          onAddComment={handleAddComment}
          onCancel={handleCancel}
        />
      )}

      {createOpen && (
        <CreateStockEditRequestModal
          isOpen={createOpen}
          isSaving={createMutation.isPending}
          onClose={() => setCreateOpen(false)}
          onSubmit={(data) => createMutation.mutate(data, { onSuccess: () => setCreateOpen(false) })}
        />
      )}
    </>
  );
}

function KpiCard({
  label, value, icon: Icon, color, hint, isLoading,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'amber' | 'emerald' | 'red' | 'indigo';
  hint: string;
  isLoading?: boolean;
}) {
  const palette: Record<string, { bg: string; text: string; dot: string }> = {
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   dot: 'bg-amber-400' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' },
    red:     { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-400' },
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  dot: 'bg-indigo-400' },
  };
  const p = palette[color];
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">{isLoading ? '—' : value.toLocaleString()}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${p.bg}`}>
          <Icon className={`h-5 w-5 ${p.text}`} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <span className={`h-2 w-2 rounded-full ${p.dot}`} />
        {hint}
      </div>
    </Card>
  );
}

function MenuItem({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-gray-700"
    >
      {children}
    </button>
  );
}
