'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, FilePenLine, Inbox, Plus, Send } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useWarehouses } from '@/hooks/useWarehouses';
import {
  useStockEditRequests,
  useStockEditRequestSummary,
  useCreateStockEditRequest,
  useCancelStockEditRequest,
} from '@/hooks/useStockEditRequests';
import {
  useAcceptWarehouseStockRequest,
  useCreateWarehouseStockRequest,
  useIncomingWarehouseStockRequests,
  useOutgoingWarehouseStockRequests,
  useRejectWarehouseStockRequest,
  useWarehouseStockRequestSummary,
} from '@/hooks/useWarehouseStockRequests';
import { stockService } from '@/services/stock.service';
import { StockEditRequest } from '@/types/stock-edit-request.types';
import { WarehouseStockRequest } from '@/types/warehouse-stock-request.types';
import { formatDate } from '@/lib/formatters';
import CreateStockEditRequestModal from '@/components/stock/CreateStockEditRequestModal';

type Tab = 'edits' | 'request' | 'incoming';

const requestStatusVariant: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'default',
};

export default function RequestStockEditPage() {
  const { assignedWarehouse, assignedWarehouseId, isGuest, isWarehouseManager } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('edits');
  const [createEditOpen, setCreateEditOpen] = useState(false);
  const [productId, setProductId] = useState<number | ''>('');
  const [sourceWarehouseId, setSourceWarehouseId] = useState<number | ''>('');
  const [requestedQuantity, setRequestedQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [reviewDraft, setReviewDraft] = useState<Record<number, { quantity: string; comment: string }>>({});

  const hasAssignedWarehouse = !isWarehouseManager || !!assignedWarehouseId;
  const editFilters = {
    page: 0,
    size: 50,
    warehouseId: isWarehouseManager ? assignedWarehouseId ?? undefined : undefined,
  };
  const stockEditsQuery = useStockEditRequests(editFilters, { enabled: !isGuest && hasAssignedWarehouse });
  const editSummaryQuery = useStockEditRequestSummary({ enabled: !isGuest && hasAssignedWarehouse });
  const outgoingQuery = useOutgoingWarehouseStockRequests({ page: 0, size: 50 }, { enabled: !isGuest && hasAssignedWarehouse });
  const incomingQuery = useIncomingWarehouseStockRequests({ page: 0, size: 50 }, { enabled: !isGuest && hasAssignedWarehouse });
  const stockRequestSummaryQuery = useWarehouseStockRequestSummary({ enabled: !isGuest && hasAssignedWarehouse });
  const productsQuery = useProducts({ size: 200 }, { enabled: !isGuest && hasAssignedWarehouse });
  const warehousesQuery = useWarehouses({ size: 200 }, { enabled: !isGuest && hasAssignedWarehouse });
  const sourceStockQuery = useQuery({
    queryKey: ['stock', 'warehouse', sourceWarehouseId],
    queryFn: () => stockService.getWarehouseStock(sourceWarehouseId as number).then((res) => res.data),
    enabled: !isGuest && sourceWarehouseId !== '',
  });

  const createEditMutation = useCreateStockEditRequest();
  const cancelEditMutation = useCancelStockEditRequest();
  const createStockRequestMutation = useCreateWarehouseStockRequest();
  const acceptMutation = useAcceptWarehouseStockRequest();
  const rejectMutation = useRejectWarehouseStockRequest();

  const productOptions = useMemo(() => [
    { value: '', label: 'Select product...' },
    ...((productsQuery.data?.content ?? []).map((p) => ({ value: String(p.id), label: p.name }))),
  ], [productsQuery.data]);

  const sourceWarehouseOptions = useMemo(() => [
    { value: '', label: 'Select source warehouse...' },
    ...((warehousesQuery.data?.content ?? [])
      .filter((w) => !assignedWarehouseId || w.id !== assignedWarehouseId)
      .map((w) => ({ value: String(w.id), label: w.address }))),
  ], [assignedWarehouseId, warehousesQuery.data]);

  const availableAtSource = useMemo(() => {
    if (productId === '' || sourceWarehouseId === '') return null;
    const row = (sourceStockQuery.data?.content ?? []).find((item) => item.productId === productId);
    return row?.availableQuantity ?? row?.quantityOnHand ?? row?.amount ?? 0;
  }, [productId, sourceWarehouseId, sourceStockQuery.data]);

  const stockEditRows = stockEditsQuery.data?.content ?? [];
  const outgoingRows = outgoingQuery.data?.content ?? [];
  const incomingRows = incomingQuery.data?.content ?? [];
  const editSummary = editSummaryQuery.data;
  const requestSummary = stockRequestSummaryQuery.data;

  const submitStockRequest = () => {
    if (productId === '' || sourceWarehouseId === '' || Number(requestedQuantity) <= 0 || !reason.trim()) {
      return;
    }
    createStockRequestMutation.mutate(
      {
        productId,
        sourceWarehouseId,
        requestedQuantity: Number(requestedQuantity),
        reason: reason.trim(),
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setProductId('');
          setSourceWarehouseId('');
          setRequestedQuantity('');
          setReason('');
          setNotes('');
          setActiveTab('edits');
        },
      }
    );
  };

  const draftFor = (id: number) => reviewDraft[id] ?? { quantity: '', comment: '' };
  const setDraft = (id: number, value: Partial<{ quantity: string; comment: string }>) => {
    setReviewDraft((current) => ({ ...current, [id]: { ...draftFor(id), ...value } }));
  };

  if (isWarehouseManager && !assignedWarehouseId) {
    return (
      <>
        <Topbar title="Request Stock Edit" subtitle="Warehouse stock corrections and requests" />
        <div className="p-6">
          <ErrorState
            title="No warehouse assigned"
            message="No warehouse assigned to this account. Please contact a system administrator."
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Request Stock Edit" subtitle="Stock corrections and warehouse-to-warehouse requests" />
      <div className="p-6 space-y-6">
        <BreadCrumb items={[{ label: 'Stock', href: '/stock' }, { label: 'Request Stock Edit' }]} />

        {assignedWarehouse && (
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
            Warehouse: <span className="font-semibold">{assignedWarehouse.address}</span>
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Kpi label="Stock Edits Pending" value={editSummary?.pendingRequestsCount ?? 0} icon={<FilePenLine className="h-5 w-5" />} />
          <Kpi label="Incoming Requests" value={requestSummary?.incomingPendingCount ?? 0} icon={<Inbox className="h-5 w-5" />} />
          <Kpi label="Outgoing Pending" value={requestSummary?.outgoingPendingCount ?? 0} icon={<Send className="h-5 w-5" />} />
          <Kpi label="Accepted Today" value={requestSummary?.acceptedTodayCount ?? 0} icon={<CheckCircle2 className="h-5 w-5" />} />
        </section>

        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          <TabButton active={activeTab === 'edits'} onClick={() => setActiveTab('edits')}>My Stock Edit Requests</TabButton>
          <TabButton active={activeTab === 'request'} onClick={() => setActiveTab('request')}>Request Stock From Warehouse</TabButton>
          <TabButton active={activeTab === 'incoming'} onClick={() => setActiveTab('incoming')}>Incoming Warehouse Requests</TabButton>
        </div>

        {activeTab === 'edits' && (
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">My Stock Edit Requests</h2>
                <p className="text-sm text-gray-500">Corrections are locked to your assigned warehouse.</p>
              </div>
              <Button variant="primary" onClick={() => setCreateEditOpen(true)}>
                <Plus className="h-4 w-4" /> New Stock Edit Request
              </Button>
            </div>
            <Table
              columns={[
                { key: 'id', label: 'Request ID', render: (r: StockEditRequest) => `RSE-${String(r.id).padStart(4, '0')}` },
                { key: 'product', label: 'Product', render: (r: StockEditRequest) => r.product?.name ?? 'N/A' },
                { key: 'warehouse', label: 'Warehouse', render: (r: StockEditRequest) => r.warehouse?.address ?? 'N/A' },
                { key: 'current', label: 'Current Qty', render: (r: StockEditRequest) => r.currentQuantity },
                { key: 'requested', label: 'Requested Qty', render: (r: StockEditRequest) => r.requestedQuantity },
                { key: 'difference', label: 'Difference', render: (r: StockEditRequest) => r.differenceQuantity > 0 ? `+${r.differenceQuantity}` : r.differenceQuantity },
                { key: 'reason', label: 'Reason', render: (r: StockEditRequest) => r.reason },
                { key: 'status', label: 'Status', render: (r: StockEditRequest) => <Badge variant={requestStatusVariant[r.status] ?? 'default'}>{r.status}</Badge> },
                { key: 'date', label: 'Date', render: (r: StockEditRequest) => formatDate(r.createdAt) },
                { key: 'actions', label: '', render: (r: StockEditRequest) => r.status === 'PENDING' ? <Button variant="ghost" size="sm" onClick={() => cancelEditMutation.mutate(r.id)}>Cancel</Button> : null },
              ]}
              data={stockEditRows}
              keyExtractor={(r) => r.id}
              isLoading={stockEditsQuery.isLoading}
              emptyMessage="No stock edit requests found."
            />
          </Card>
        )}

        {activeTab === 'request' && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Request Stock From Warehouse</h2>
              <div className="space-y-4">
                <Select id="wsr-product" label="Product" value={productId === '' ? '' : String(productId)} onChange={(e) => setProductId(e.target.value === '' ? '' : Number(e.target.value))} options={productOptions} />
                <Select id="wsr-source" label="Source Warehouse" value={sourceWarehouseId === '' ? '' : String(sourceWarehouseId)} onChange={(e) => setSourceWarehouseId(e.target.value === '' ? '' : Number(e.target.value))} options={sourceWarehouseOptions} />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Available Quantity at Source Warehouse</label>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{availableAtSource ?? 'N/A'}</div>
                </div>
                <Input id="wsr-qty" label="Requested Quantity" type="number" value={requestedQuantity} onChange={(e) => setRequestedQuantity(e.target.value)} />
                <Input id="wsr-reason" label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Low stock before weekly sales" />
                <div>
                  <label htmlFor="wsr-notes" className="mb-1.5 block text-sm font-medium text-gray-700">Notes</label>
                  <textarea id="wsr-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <Button variant="primary" fullWidth onClick={submitStockRequest} isLoading={createStockRequestMutation.isPending}>
                  Submit Stock Request
                </Button>
              </div>
            </Card>
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Outgoing Warehouse Requests</h2>
              <WarehouseRequestTable rows={outgoingRows} isLoading={outgoingQuery.isLoading} emptyMessage="No outgoing warehouse requests." />
            </Card>
          </div>
        )}

        {activeTab === 'incoming' && (
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Incoming Warehouse Requests</h2>
            {incomingQuery.error ? (
              <ErrorState title="Could not load incoming requests" message="Check that the backend is running and your session is valid." onRetry={() => void incomingQuery.refetch()} />
            ) : (
              <Table
                columns={[
                  { key: 'id', label: 'Request ID', render: (r: WarehouseStockRequest) => `WSR-${String(r.id).padStart(4, '0')}` },
                  { key: 'product', label: 'Product', render: (r: WarehouseStockRequest) => r.product?.name ?? 'N/A' },
                  { key: 'requestedBy', label: 'Requested By', render: (r: WarehouseStockRequest) => r.requestedBy?.username ?? 'N/A' },
                  { key: 'source', label: 'Source Warehouse', render: (r: WarehouseStockRequest) => r.sourceWarehouse?.address ?? 'N/A' },
                  { key: 'destination', label: 'Destination Warehouse', render: (r: WarehouseStockRequest) => r.destinationWarehouse?.address ?? 'N/A' },
                  { key: 'requested', label: 'Requested Qty', render: (r: WarehouseStockRequest) => r.requestedQuantity },
                  { key: 'available', label: 'Available Qty', render: (r: WarehouseStockRequest) => r.availableQuantity },
                  { key: 'reason', label: 'Reason', render: (r: WarehouseStockRequest) => r.reason },
                  { key: 'status', label: 'Status', render: (r: WarehouseStockRequest) => <Badge variant={requestStatusVariant[r.status] ?? 'default'}>{r.status}</Badge> },
                  { key: 'date', label: 'Date', render: (r: WarehouseStockRequest) => formatDate(r.createdAt) },
                  {
                    key: 'actions',
                    label: 'Actions',
                    render: (r: WarehouseStockRequest) => {
                      const draft = draftFor(r.id);
                      const canAct = r.status === 'PENDING';
                      return (
                        <div className="min-w-56 space-y-2">
                          {canAct && (
                            <>
                              <Input id={`approved-${r.id}`} type="number" value={draft.quantity} placeholder={String(r.requestedQuantity)} onChange={(e) => setDraft(r.id, { quantity: e.target.value })} />
                              <Input id={`comment-${r.id}`} value={draft.comment} placeholder="Comment" onChange={(e) => setDraft(r.id, { comment: e.target.value })} />
                              <div className="flex gap-2">
                                <Button size="sm" variant="primary" disabled={r.availableQuantity <= 0} onClick={() => acceptMutation.mutate({ id: r.id, data: { approvedQuantity: draft.quantity ? Number(draft.quantity) : r.requestedQuantity, comment: draft.comment || undefined } })}>
                                  Accept
                                </Button>
                                <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => rejectMutation.mutate({ id: r.id, data: { comment: draft.comment || undefined } })}>
                                  Reject
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    },
                  },
                ]}
                data={incomingRows}
                keyExtractor={(r) => r.id}
                isLoading={incomingQuery.isLoading}
                emptyMessage="No incoming warehouse requests."
              />
            )}
          </Card>
        )}
      </div>

      {createEditOpen && (
        <CreateStockEditRequestModal
          isOpen={createEditOpen}
          isSaving={createEditMutation.isPending}
          lockedWarehouse={assignedWarehouse ?? null}
          onClose={() => setCreateEditOpen(false)}
          onSubmit={(data) => createEditMutation.mutate(data, { onSuccess: () => setCreateEditOpen(false) })}
        />
      )}
    </>
  );
}

function WarehouseRequestTable({ rows, isLoading, emptyMessage }: { rows: WarehouseStockRequest[]; isLoading: boolean; emptyMessage: string }) {
  return (
    <Table
      columns={[
        { key: 'id', label: 'Request ID', render: (r: WarehouseStockRequest) => `WSR-${String(r.id).padStart(4, '0')}` },
        { key: 'product', label: 'Product', render: (r: WarehouseStockRequest) => r.product?.name ?? 'N/A' },
        { key: 'source', label: 'Source Warehouse', render: (r: WarehouseStockRequest) => r.sourceWarehouse?.address ?? 'N/A' },
        { key: 'destination', label: 'Destination Warehouse', render: (r: WarehouseStockRequest) => r.destinationWarehouse?.address ?? 'N/A' },
        { key: 'requested', label: 'Requested Qty', render: (r: WarehouseStockRequest) => r.requestedQuantity },
        { key: 'approved', label: 'Approved Qty', render: (r: WarehouseStockRequest) => r.approvedQuantity ?? 'N/A' },
        { key: 'status', label: 'Status', render: (r: WarehouseStockRequest) => <Badge variant={requestStatusVariant[r.status] ?? 'default'}>{r.status}</Badge> },
        { key: 'date', label: 'Date', render: (r: WarehouseStockRequest) => formatDate(r.createdAt) },
      ]}
      data={rows}
      keyExtractor={(r) => r.id}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
    />
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? 'border-indigo-600 text-indigo-700'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function Kpi({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">{icon}</div>
      </div>
    </Card>
  );
}
