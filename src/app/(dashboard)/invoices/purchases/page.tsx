'use client';

import { useMemo, useState } from 'react';
import {
  Eye,
  Truck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Printer,
  PackageCheck,
  Clock,
  PackageSearch,
  PackageX,
  X,
  MoreHorizontal,
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
import Modal from '@/components/ui/Modal';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import {
  usePurchaseInvoices,
  useReceiveOrderSummary,
  usePurchaseInvoice,
  useCreatePurchaseInvoice,
  useApprovePurchaseOrder,
  useReceiveOrder,
  useRejectOrder,
} from '@/hooks/usePurchaseInvoices';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  PurchaseInvoice,
  ReceiptStatus,
  ReceiveOrderFilters,
  ReceiveOrderRequest,
} from '@/types/purchase-invoice.types';
import {
  receiptStatusBadge,
  receiptStatusLabel,
  RECEIPT_STATUS_OPTIONS,
} from '@/lib/receipt-status';
import { printGrn } from '@/lib/grn-print';
import ReceiveOrderDrawer from '@/components/invoices/ReceiveOrderDrawer';
import RejectOrderModal from '@/components/invoices/RejectOrderModal';

type DrawerMode = 'view' | 'receive' | 'partial' | 'damaged';

export default function ReceiveOrdersPage() {
  const { isGuest, user, isWarehouseManager, isOperationalManager, assignedWarehouse, assignedWarehouseId } = useAuth();

  const [search, setSearch] = useState('');
  const [receiptStatus, setReceiptStatus] = useState<ReceiptStatus | ''>('');
  const [supplierId, setSupplierId] = useState<number | ''>('');
  const [warehouseId, setWarehouseId] = useState<number | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('view');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({ supplierId: '', productId: '', quantity: 1, price: 0 });
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search.trim(), 300);

  const filters: ReceiveOrderFilters = useMemo(() => ({
    page: 0,
    size: 50,
    search: debouncedSearch || undefined,
    receiptStatus: receiptStatus || undefined,
    supplierId: supplierId === '' ? undefined : supplierId,
    warehouseId: isWarehouseManager ? assignedWarehouseId ?? undefined : warehouseId === '' ? undefined : warehouseId,
    dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
    dateTo: dateTo ? new Date(`${dateTo}T23:59:59`).toISOString() : undefined,
  }), [assignedWarehouseId, debouncedSearch, isWarehouseManager, receiptStatus, supplierId, warehouseId, dateFrom, dateTo]);

  const ordersQuery = usePurchaseInvoices(filters, { enabled: !isGuest });
  const summaryQuery = useReceiveOrderSummary({ enabled: !isGuest });
  const detailQuery = usePurchaseInvoice(selectedId, { enabled: !!selectedId && drawerOpen });
  const suppliersQuery = useSuppliers({ size: 200 }, { enabled: !isGuest });
  const warehousesQuery = useWarehouses({ size: 200 }, { enabled: !isGuest && !isWarehouseManager });
  const productsQuery = useProducts({ size: 200 }, { enabled: !isGuest });

  const createOrderMutation = useCreatePurchaseInvoice();
  const approveOrderMutation = useApprovePurchaseOrder();
  const receiveMutation = useReceiveOrder();
  const rejectMutation = useRejectOrder();

  const orders = ordersQuery.data?.content ?? [];
  const summary = summaryQuery.data;
  const selectedDetail = detailQuery.data ?? orders.find((o) => o.id === selectedId) ?? null;
  const selectedSummary = orders.find((o) => o.id === selectedId) ?? null;

  const supplierOptions = useMemo(() => ([
    { value: '', label: 'All Suppliers' },
    ...((suppliersQuery.data?.content ?? []).map((s) => ({ value: String(s.id), label: s.name }))),
  ]), [suppliersQuery.data]);

  const warehouseOptions = useMemo(() => (
    isWarehouseManager && assignedWarehouse
      ? [{ value: String(assignedWarehouse.id), label: assignedWarehouse.address }]
      : [
          { value: '', label: 'All Warehouses' },
          ...((warehousesQuery.data?.content ?? []).map((w) => ({ value: String(w.id), label: w.address }))),
        ]
  ), [assignedWarehouse, isWarehouseManager, warehousesQuery.data]);
  const productOptions = useMemo(() => [
    { value: '', label: 'Select Product' },
    ...((productsQuery.data?.content ?? []).map((p) => ({ value: String(p.id), label: p.name }))),
  ], [productsQuery.data]);
  const selectedNewOrderProduct = useMemo(
    () => (productsQuery.data?.content ?? []).find((p) => String(p.id) === newOrderForm.productId) ?? null,
    [newOrderForm.productId, productsQuery.data]
  );
  const expectedUnitPrice = selectedNewOrderProduct?.currentPrice ?? null;
  const priceAboveExpected = expectedUnitPrice !== null && newOrderForm.price > expectedUnitPrice;
  const canSubmitNewOrder = Boolean(
    assignedWarehouseId &&
      newOrderForm.supplierId &&
      newOrderForm.productId &&
      newOrderForm.quantity > 0 &&
      newOrderForm.price >= 0 &&
      !priceAboveExpected
  );

  const clearFilters = () => {
    setSearch('');
    setReceiptStatus('');
    setSupplierId('');
    setWarehouseId('');
    setDateFrom('');
    setDateTo('');
  };

  const openDrawer = (order: PurchaseInvoice, mode: DrawerMode) => {
    setSelectedId(order.id);
    setDrawerMode(mode);
    setDrawerOpen(true);
    setOpenMenuId(null);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const handleReceiveSubmit = (mode: 'partial' | 'confirm' | 'damaged', payload: ReceiveOrderRequest) => {
    if (!selectedId) return;
    receiveMutation.mutate(
      { id: selectedId, data: payload },
      {
        onSuccess: () => {
          if (mode === 'confirm') {
            setDrawerOpen(false);
          }
        },
      }
    );
  };

  const handleReject = (reason: string, notes?: string) => {
    if (!selectedId) return;
    rejectMutation.mutate(
      { id: selectedId, data: { reason, notes } },
      {
        onSuccess: () => {
          setRejectOpen(false);
          setDrawerOpen(false);
        },
      }
    );
  };

  const handleCreateOrder = () => {
    if (!canSubmitNewOrder || !assignedWarehouseId) return;
    createOrderMutation.mutate(
      {
        supplierId: Number(newOrderForm.supplierId),
        warehouseId: assignedWarehouseId,
        items: [{
          productId: Number(newOrderForm.productId),
          amount: newOrderForm.quantity,
          price: newOrderForm.price,
        }],
      },
      {
        onSuccess: () => {
          setNewOrderOpen(false);
          setNewOrderForm({ supplierId: '', productId: '', quantity: 1, price: 0 });
        },
      }
    );
  };

  const handlePrint = (order: PurchaseInvoice | null) => {
    if (!order) return;
    printGrn(order, user?.username);
  };

  const requireSelection = (action: () => void) => {
    if (!selectedSummary) return;
    action();
  };

  const showError = !isGuest && !!ordersQuery.error;

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (o: PurchaseInvoice) => (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); openDrawer(o, 'view'); }}
          className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          PO-{String(o.id).padStart(4, '0')}
        </button>
      ),
    },
    { key: 'supplier', label: 'Supplier', render: (o: PurchaseInvoice) => <span className="text-gray-700">{o.supplier?.name ?? '—'}</span> },
    { key: 'warehouse', label: 'Warehouse', render: (o: PurchaseInvoice) => <span className="text-gray-600 text-sm">{o.warehouse?.address ?? '—'}</span> },
    { key: 'items', label: 'Items', render: (o: PurchaseInvoice) => <span className="text-gray-700">{o.items?.length ?? 0}</span> },
    { key: 'ordered', label: 'Ordered', render: (o: PurchaseInvoice) => <span className="text-gray-700">{o.totalOrderedQuantity ?? 0}</span> },
    { key: 'received', label: 'Received', render: (o: PurchaseInvoice) => <span className="text-gray-700">{o.totalReceivedQuantity ?? 0}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (o: PurchaseInvoice) => {
        const sb = receiptStatusBadge(o.receiptStatus);
        return <Badge variant={sb.variant}>{receiptStatusLabel(o.receiptStatus)}</Badge>;
      },
    },
    { key: 'amount', label: 'Amount', render: (o: PurchaseInvoice) => <span className="font-semibold text-gray-900">{formatCurrency(o.totalPrice)}</span> },
    { key: 'date', label: 'Date', render: (o: PurchaseInvoice) => <span className="text-gray-500 text-sm">{formatDate(o.createdAt)}</span> },
    {
      key: 'actions',
      label: '',
      className: 'w-40',
      render: (o: PurchaseInvoice) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => openDrawer(o, 'view')}
            className="p-1.5 rounded-md hover:bg-indigo-50 text-gray-500 hover:text-indigo-600"
            title="View"
            aria-label="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => openDrawer(o, 'receive')}
            className="p-1.5 rounded-md hover:bg-emerald-50 text-gray-500 hover:text-emerald-600"
            title="Receive"
            aria-label="Receive"
            disabled={o.receiptStatus === 'PENDING_APPROVAL' || o.receiptStatus === 'REJECTED' || o.receiptStatus === 'RECEIVED'}
          >
            <PackageCheck className="h-4 w-4" />
          </button>
          {isOperationalManager && o.receiptStatus === 'PENDING_APPROVAL' && (
            <button
              type="button"
              onClick={() => approveOrderMutation.mutate(o.id)}
              className="p-1.5 rounded-md hover:bg-emerald-50 text-gray-500 hover:text-emerald-600"
              title="Accept order"
              aria-label="Accept order"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenuId(openMenuId === o.id ? null : o.id)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
              title="More"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {openMenuId === o.id && (
              <div className="absolute right-0 mt-1 z-20 w-44 rounded-lg border border-gray-200 bg-white shadow-lg py-1 text-sm">
                <MenuItem onClick={() => approveOrderMutation.mutate(o.id)} disabled={!isOperationalManager || o.receiptStatus !== 'PENDING_APPROVAL'}>Accept Order</MenuItem>
                <MenuItem onClick={() => openDrawer(o, 'partial')} disabled={o.receiptStatus === 'PENDING_APPROVAL' || o.receiptStatus === 'REJECTED' || o.receiptStatus === 'RECEIVED'}>Partial Receive</MenuItem>
                <MenuItem onClick={() => openDrawer(o, 'damaged')} disabled={o.receiptStatus === 'PENDING_APPROVAL' || o.receiptStatus === 'REJECTED'}>Mark Damaged</MenuItem>
                <MenuItem onClick={() => { setSelectedId(o.id); setRejectOpen(true); setOpenMenuId(null); }} disabled={o.receiptStatus === 'REJECTED'}>Reject Items</MenuItem>
                <MenuItem onClick={() => { setOpenMenuId(null); handlePrint(o); }}>Print GRN</MenuItem>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <Topbar title="Receive Orders" subtitle="Review supplier orders and record received stock" />

      <div className="p-6 space-y-6">
        <BreadCrumb
          items={[
            { label: 'Orders', href: '/invoices/purchases' },
            { label: 'Receive Orders' },
          ]}
        />

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="Pending Receipts"
            value={summary?.pendingReceiptsCount ?? 0}
            icon={Clock}
            color="indigo"
            isLoading={summaryQuery.isLoading}
          />
          <KpiCard
            label="Total Received"
            value={summary?.receivedTodayCount ?? 0}
            icon={PackageCheck}
            color="emerald"
            isLoading={summaryQuery.isLoading}
          />
          <KpiCard
            label="Partially Received"
            value={summary?.partiallyReceivedCount ?? 0}
            icon={PackageSearch}
            color="amber"
            isLoading={summaryQuery.isLoading}
          />
          <KpiCard
            label="Damaged Items"
            value={summary?.damagedItemsCount ?? 0}
            icon={PackageX}
            color="red"
            isLoading={summaryQuery.isLoading}
          />
        </section>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2">
              <Input
                id="receive-search"
                label="Search"
                placeholder="Order ID or supplier"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              id="receive-status"
              label="Status"
              value={receiptStatus}
              onChange={(e) => setReceiptStatus(e.target.value as ReceiptStatus | '')}
              options={RECEIPT_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
            <Select
              id="receive-supplier"
              label="Supplier"
              value={supplierId === '' ? '' : String(supplierId)}
              onChange={(e) => setSupplierId(e.target.value === '' ? '' : Number(e.target.value))}
              options={supplierOptions}
            />
            <Select
              id="receive-warehouse"
              label="Warehouse"
              value={isWarehouseManager ? String(assignedWarehouseId ?? '') : warehouseId === '' ? '' : String(warehouseId)}
              onChange={(e) => setWarehouseId(e.target.value === '' ? '' : Number(e.target.value))}
              options={warehouseOptions}
              disabled={isWarehouseManager}
            />
            <div className="grid grid-cols-2 gap-2 lg:col-span-1">
              <Input id="date-from" label="From" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <Input id="date-to" label="To" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" /> Clear Filters
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-gray-100">
            <span className="text-xs uppercase text-gray-500 mr-2">Quick actions</span>
            {isWarehouseManager && (
              <Button size="sm" variant="primary" onClick={() => setNewOrderOpen(true)} disabled={!assignedWarehouseId}>
                <Plus className="h-4 w-4" /> New Order
              </Button>
            )}
            {isOperationalManager && (
              <Button size="sm" variant="outline" onClick={() => requireSelection(() => approveOrderMutation.mutate(selectedSummary!.id))} disabled={!selectedSummary || selectedSummary.receiptStatus !== 'PENDING_APPROVAL'}>
                <CheckCircle2 className="h-4 w-4" /> Accept Order
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => requireSelection(() => openDrawer(selectedSummary!, 'view'))} disabled={!selectedSummary}>
              <Eye className="h-4 w-4" /> View Order
            </Button>
            <Button size="sm" variant="primary" onClick={() => requireSelection(() => openDrawer(selectedSummary!, 'receive'))} disabled={!selectedSummary || selectedSummary.receiptStatus === 'PENDING_APPROVAL'}>
              <Truck className="h-4 w-4" /> Receive Order
            </Button>
            <Button size="sm" variant="outline" onClick={() => requireSelection(() => openDrawer(selectedSummary!, 'partial'))} disabled={!selectedSummary}>
              <PackageCheck className="h-4 w-4" /> Partial Receive
            </Button>
            <Button size="sm" variant="outline" onClick={() => requireSelection(() => openDrawer(selectedSummary!, 'damaged'))} disabled={!selectedSummary}>
              <AlertTriangle className="h-4 w-4" /> Mark Damaged
            </Button>
            <Button size="sm" variant="danger" onClick={() => requireSelection(() => setRejectOpen(true))} disabled={!selectedSummary}>
              <Ban className="h-4 w-4" /> Reject Items
            </Button>
            <Button size="sm" variant="ghost" onClick={() => requireSelection(() => handlePrint(selectedDetail ?? selectedSummary))} disabled={!selectedSummary}>
              <Printer className="h-4 w-4" /> Print GRN
            </Button>
            {!selectedSummary && (
              <span className="ml-auto text-xs text-gray-400">Select an order first.</span>
            )}
            {selectedSummary && (
              <span className="ml-auto text-xs text-gray-500">
                Selected: <span className="font-medium text-gray-900">PO-{String(selectedSummary.id).padStart(4, '0')}</span>
              </span>
            )}
          </div>

          {showError ? (
            <ErrorState
              title="Could not load receive orders"
              message="Check that the backend is running and your session is valid."
              onRetry={() => void ordersQuery.refetch()}
            />
          ) : (
            <Table
              columns={columns}
              data={orders}
              keyExtractor={(o) => o.id}
              isLoading={!isGuest && ordersQuery.isLoading}
              emptyMessage={
                debouncedSearch || receiptStatus || supplierId !== '' || warehouseId !== '' || dateFrom || dateTo
                  ? 'No orders match the current filters.'
                  : 'No receive orders found.'
              }
              onRowClick={(o) => setSelectedId(o.id)}
            />
          )}
        </Card>
      </div>

      <ReceiveOrderDrawer
        isOpen={drawerOpen}
        mode={drawerMode === 'receive' ? 'CONFIRM' : drawerMode === 'partial' ? 'PARTIAL' : drawerMode === 'damaged' ? 'DAMAGED' : 'view'}
        order={selectedDetail}
        isLoading={detailQuery.isLoading}
        isSaving={receiveMutation.isPending}
        onClose={closeDrawer}
        onSavePartial={(p) => handleReceiveSubmit('partial', p)}
        onConfirmReceipt={(p) => handleReceiveSubmit('confirm', p)}
        onMarkDamaged={(p) => handleReceiveSubmit('damaged', p)}
        onPrintGrn={() => handlePrint(selectedDetail ?? selectedSummary)}
        onOpenReject={() => setRejectOpen(true)}
      />

      <RejectOrderModal
        isOpen={rejectOpen}
        isSaving={rejectMutation.isPending}
        orderLabel={selectedSummary ? `PO-${String(selectedSummary.id).padStart(4, '0')}` : undefined}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
      />
      <Modal isOpen={newOrderOpen} onClose={() => setNewOrderOpen(false)} title="New Order" size="lg">
        <div className="space-y-4">
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
            Warehouse: <span className="font-semibold">{assignedWarehouse?.address ?? 'Assigned warehouse'}</span>
          </div>
          <Select id="new-order-supplier" label="Supplier" value={newOrderForm.supplierId} onChange={(e) => setNewOrderForm((f) => ({ ...f, supplierId: e.target.value }))} options={supplierOptions.filter((option) => option.value !== '')} />
          <Select id="new-order-product" label="Product" value={newOrderForm.productId} onChange={(e) => setNewOrderForm((f) => ({ ...f, productId: e.target.value }))} options={productOptions} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Quantity" type="number" min={1} value={newOrderForm.quantity} onChange={(e) => setNewOrderForm((f) => ({ ...f, quantity: Number(e.target.value) }))} />
            <div>
              <Input
                label="Unit price"
                type="number"
                min={0}
                step="0.01"
                value={newOrderForm.price}
                onChange={(e) => setNewOrderForm((f) => ({ ...f, price: Number(e.target.value) }))}
                error={priceAboveExpected ? `Higher than expected ${formatCurrency(expectedUnitPrice)}` : undefined}
              />
              {expectedUnitPrice !== null && (
                <p className="mt-1.5 text-xs text-gray-500">
                  Expected price: <span className="font-semibold text-gray-700">{formatCurrency(expectedUnitPrice)}</span>
                </p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500">Orders created by warehouse managers are saved for operational manager approval before stock can be received.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setNewOrderOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOrder} isLoading={createOrderMutation.isPending} disabled={!canSubmitNewOrder}>Submit Order</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  color,
  isLoading,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'indigo' | 'emerald' | 'amber' | 'red';
  isLoading?: boolean;
}) {
  const palette: Record<string, { bg: string; text: string }> = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    red: { bg: 'bg-red-50', text: 'text-red-600' },
  };
  const p = palette[color];
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {isLoading ? '—' : value.toLocaleString()}
          </p>
        </div>
        <div className={`p-2.5 rounded-lg ${p.bg}`}>
          <Icon className={`h-5 w-5 ${p.text}`} />
        </div>
      </div>
    </Card>
  );
}

function MenuItem({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
    >
      {children}
    </button>
  );
}
