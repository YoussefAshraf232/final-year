'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, Banknote, Eye, FileDown, PackageSearch, Printer, RotateCcw, ShoppingCart, Trash2, X } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { BadgeVariant } from '@/components/ui/Badge';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import DemoModeBanner from '@/components/ui/DemoModeBanner';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useCustomers } from '@/hooks/useCustomers';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useWarehouseStock } from '@/hooks/useStock';
import { useCreateReturnInvoice, useReturnInvoices } from '@/hooks/useReturnInvoices';
import { useCreateSalesInvoice, useSalesInvoices, useSalesManagementSummary, useVoidSalesInvoice } from '@/hooks/useSalesInvoices';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { CreateSalesInvoiceRequest, SalesInvoice, SalesInvoiceFilters } from '@/types/sales-invoice.types';
import { CreateReturnInvoiceRequest } from '@/types/return-invoice.types';

type StockRow = { productId: number; productName?: string; warehouseId: number; warehouseName?: string; amount?: number; quantityOnHand?: number; availableQuantity?: number };

const statusOptions = ['', 'PENDING', 'COMPLETED', 'PAID', 'CANCELLED', 'RETURNED'];
const paymentMethods = ['Card', 'Cash', 'Bank Transfer', 'COD'];

function statusBadge(status?: string): BadgeVariant {
  if (status === 'PAID') return 'success';
  if (status === 'PENDING') return 'warning';
  if (status === 'CANCELLED') return 'danger';
  if (status === 'RETURNED') return 'info';
  return 'info';
}

function stockQty(row?: StockRow) {
  return row?.availableQuantity ?? row?.quantityOnHand ?? row?.amount ?? 0;
}

function invoiceCode(id: number) {
  return `INV-${String(id).padStart(4, '0')}`;
}

function returnCode(id: number) {
  return `RET-${String(id).padStart(4, '0')}`;
}

export default function SalesInvoicesPage() {
  const router = useRouter();
  const { isGuest, isWarehouseManager, assignedWarehouse, assignedWarehouseId } = useAuth();
  const [filters, setFilters] = useState<SalesInvoiceFilters>({ page: 0, size: 10 });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);
  const queryFilters = useMemo(
    () => ({
      ...filters,
      warehouseId: isWarehouseManager ? assignedWarehouseId ?? undefined : filters.warehouseId,
      search: debouncedSearch || undefined,
    }),
    [assignedWarehouseId, debouncedSearch, filters, isWarehouseManager]
  );
  const { data, isLoading, error, refetch } = useSalesInvoices(queryFilters, { enabled: !isGuest });
  const { data: summary } = useSalesManagementSummary({ enabled: !isGuest });
  const { data: customers } = useCustomers({ page: 0, size: 200 }, { enabled: !isGuest });
  const { data: warehouses } = useWarehouses({ page: 0, size: 200 }, { enabled: !isGuest && !isWarehouseManager });
  const [saleForm, setSaleForm] = useState({ customerId: '', warehouseId: '', productId: '', quantity: 1, unitPrice: 0, discount: 0, paymentMethod: 'Card', notes: '' });
  const [returnForm, setReturnForm] = useState({ productId: '', quantity: 1, reason: 'Damaged on delivery', condition: 'NEEDS_INSPECTION', restockDecision: 'PENDING_REVIEW', refundMethod: 'Original payment', notes: '' });
  const saleWarehouseId = saleForm.warehouseId ? Number(saleForm.warehouseId) : undefined;
  const { data: stock } = useWarehouseStock(
    { page: 0, size: 500, warehouseId: saleWarehouseId },
    { enabled: !isGuest && !!saleWarehouseId }
  );
  const { data: recentReturns } = useReturnInvoices({ page: 0, size: 3 }, { enabled: !isGuest });
  const createSale = useCreateSalesInvoice();
  const voidSale = useVoidSalesInvoice();
  const createReturn = useCreateReturnInvoice();
  const [selected, setSelected] = useState<SalesInvoice | null>(null);
  const [saleOpen, setSaleOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnInvoice, setReturnInvoice] = useState<SalesInvoice | null>(null);

  const invoices = data?.content ?? [];
  const customerRows = customers?.content ?? [];
  const warehouseRows = isWarehouseManager && assignedWarehouse
    ? [assignedWarehouse]
    : warehouses?.content ?? [];
  const stockRows = (stock?.content ?? []) as StockRow[];
  const stockRowsForWarehouse = saleWarehouseId
    ? stockRows.filter((row) => row.warehouseId === saleWarehouseId)
    : [];
  const selectedStock = stockRowsForWarehouse.find((row) => row.productId === Number(saleForm.productId));
  const selectedProduct = selectedStock;
  const discountPercent = Math.min(Math.max(saleForm.discount, 0), 100);
  const saleSubtotal = saleForm.quantity * saleForm.unitPrice;
  const saleDiscountAmount = saleSubtotal * (discountPercent / 100);
  const saleTotalDue = Math.max(saleSubtotal - saleDiscountAmount, 0);
  const salePaidAmountValue = Number.isFinite(saleTotalDue) ? saleTotalDue.toFixed(2) : '0.00';

  function updateFilter(key: keyof SalesInvoiceFilters, value: string) {
    setFilters((current) => ({ ...current, page: 0, [key]: value ? (key.endsWith('Id') ? Number(value) : value) : undefined }));
  }

  function clearFilters() {
    setSearch('');
    setFilters({ page: 0, size: 10 });
  }

  function exportCsv() {
    const rows = invoices.map((inv) => [invoiceCode(inv.id), inv.customer?.name ?? '', inv.items?.length ?? 0, inv.warehouse?.address ?? '', inv.totalPrice, inv.discount, inv.status ?? '', inv.paymentMethod ?? '', formatDate(inv.createdAt)]);
    const csv = [['Invoice ID', 'Customer', 'Items', 'Warehouse', 'Amount', 'Discount', 'Status', 'Payment', 'Date'], ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sales-invoices.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  function printPage() {
    window.print();
  }

  async function submitSale(event: FormEvent) {
    event.preventDefault();
    const available = stockQty(selectedStock);
    const effectiveWarehouseId = isWarehouseManager ? assignedWarehouseId : saleWarehouseId;
    if (!saleForm.customerId || !effectiveWarehouseId || !saleForm.productId) return toast.error('Customer, warehouse, and product are required');
    if (saleForm.quantity <= 0) return toast.error('Quantity must be positive');
    if (saleForm.quantity > available) return toast.error('Quantity exceeds available stock');
    const subtotal = saleForm.quantity * saleForm.unitPrice;
    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal - discountAmount;
    if (total < 0) return toast.error('Discount cannot make total negative');
    const payload: CreateSalesInvoiceRequest = {
      customerId: Number(saleForm.customerId),
      warehouseId: effectiveWarehouseId,
      discount: Number.isFinite(discountAmount) ? Number(discountAmount.toFixed(2)) : 0,
      paymentMethod: saleForm.paymentMethod,
      paidAmount: Number.isFinite(total) ? Number(total.toFixed(2)) : 0,
      notes: saleForm.notes || undefined,
      items: [{ productId: Number(saleForm.productId), amount: saleForm.quantity, sellingPrice: saleForm.unitPrice }],
    };
    const created = await createSale.mutateAsync(payload);
    toast.success('Sale created');
    setSaleOpen(false);
    setSelected(created);
  }

  function openReturn(inv: SalesInvoice) {
    setReturnInvoice(inv);
    setReturnForm({ productId: String(inv.items?.[0]?.product?.id ?? inv.items?.[0]?.productId ?? ''), quantity: 1, reason: 'Damaged on delivery', condition: 'NEEDS_INSPECTION', restockDecision: 'PENDING_REVIEW', refundMethod: 'Original payment', notes: '' });
    setReturnOpen(true);
  }

  async function submitReturn(event: FormEvent) {
    event.preventDefault();
    if (!returnInvoice) return;
    const item = returnInvoice.items?.find((row) => (row.product?.id ?? row.productId) === Number(returnForm.productId));
    if (!item) return toast.error('Select an invoice item');
    if (returnForm.quantity <= 0 || returnForm.quantity > item.amount) return toast.error('Return quantity is invalid');
    const payload: CreateReturnInvoiceRequest = {
      salesInvoiceId: returnInvoice.id,
      customerId: returnInvoice.customer?.id ?? returnInvoice.customerId!,
      warehouseId: returnInvoice.warehouse?.id ?? returnInvoice.warehouseId!,
      reason: returnForm.reason,
      refundMethod: returnForm.refundMethod,
      notes: returnForm.notes || undefined,
      items: [{ productId: Number(returnForm.productId), amount: returnForm.quantity, priceAtReturn: item.sellingPrice, condition: returnForm.condition as never, restockDecision: returnForm.restockDecision as never }],
    };
    await createReturn.mutateAsync(payload);
    toast.success('Return created for review');
    setReturnOpen(false);
  }

  async function handleVoid(inv: SalesInvoice) {
    if (!window.confirm(`Void ${invoiceCode(inv.id)}? Stock will be restored when allowed.`)) return;
    await voidSale.mutateAsync(inv.id);
    toast.success('Sale voided');
    setSelected(null);
  }

  const kpis = [
    { label: "Today's Sales", value: formatCurrency(summary?.todaySalesAmount ?? 0), detail: 'From completed sales', icon: Banknote, tone: 'bg-indigo-50 text-indigo-700' },
    { label: 'Pending Orders', value: summary?.pendingOrdersCount ?? 0, detail: 'Need follow-up', icon: ShoppingCart, tone: 'bg-green-50 text-green-700' },
    { label: 'Returns Today', value: formatCurrency(summary?.returnsTodayAmount ?? 0), detail: 'Customer returns', icon: RotateCcw, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Low Stock Alerts', value: summary?.lowStockAlertsCount ?? 0, detail: 'Items need attention', icon: AlertTriangle, tone: 'bg-red-50 text-red-700' },
  ];

  if (isGuest) {
    return (
      <>
        <Topbar title="Manage Sales" subtitle="Create, track, and control sales transactions" />
        <div className="p-6"><DemoModeBanner resource="sales management" /></div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Manage Sales" subtitle="Create, track, and control sales transactions" />
      <div className="bg-slate-50 p-6">
        <BreadCrumb items={[{ label: 'Sales' }, { label: 'Manage Sales' }]} />
        <div className="mb-4 flex gap-6 border-b border-gray-200">
          <Link href={ROUTES.SALES_INVOICES} className="border-b-2 border-indigo-600 px-1 pb-3 text-sm font-semibold text-indigo-700">Sales Invoices</Link>
          <Link href={ROUTES.RETURN_INVOICES} className="px-1 pb-3 text-sm font-medium text-gray-500 hover:text-indigo-700">Sales Returns</Link>
        </div>

        {error ? (
          <ErrorState title="Could not load sales invoices" message="Authenticated users are not shown demo invoices when the API fails." onRetry={() => void refetch()} />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              {kpis.map((kpi) => (
                <Card key={kpi.label} className="flex items-center gap-4">
                  <div className={`rounded-xl p-3 ${kpi.tone}`}><kpi.icon className="h-6 w-6" /></div>
                  <div><p className="text-xs font-semibold text-gray-500">{kpi.label}</p><p className="mt-1 text-2xl font-bold text-gray-900">{kpi.value}</p><p className="text-xs text-gray-500">{kpi.detail}</p></div>
                </Card>
              ))}
            </div>

            {(summary?.lowStockAlertsCount ?? 0) > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <span><AlertTriangle className="mr-2 inline h-4 w-4" />Low Stock Alert: {summary?.lowStockAlertsCount} items are running low. Review and request stock edits to avoid stockouts.</span>
                <Button size="sm" variant="outline" onClick={() => router.push(`${ROUTES.STOCK}?lowStockOnly=true`)}>View Low Stock</Button>
              </div>
            )}

            <Card padding={false}>
              <div className="space-y-3 border-b border-gray-100 p-4">
                <div className="flex flex-wrap items-end gap-3">
                  <Input className="h-10" placeholder="Search by invoice ID or customer" value={search} onChange={(event) => setSearch(event.target.value)} />
                  <select className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm" value={filters.status ?? ''} onChange={(event) => updateFilter('status', event.target.value)}>{statusOptions.map((status) => <option key={status} value={status}>{status || 'All Statuses'}</option>)}</select>
                  <Input type="date" value={filters.dateFrom?.slice(0, 10) ?? ''} onChange={(event) => updateFilter('dateFrom', event.target.value ? `${event.target.value}T00:00:00Z` : '')} />
                  <Input type="date" value={filters.dateTo?.slice(0, 10) ?? ''} onChange={(event) => updateFilter('dateTo', event.target.value ? `${event.target.value}T23:59:59Z` : '')} />
                  <Button className="ml-auto" onClick={() => {
                    if (isWarehouseManager && assignedWarehouseId) {
                      setSaleForm((current) => ({ ...current, warehouseId: String(assignedWarehouseId), productId: '' }));
                    }
                    setSaleOpen(true);
                  }}>+ New Sale</Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <select className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm" value={isWarehouseManager ? assignedWarehouseId ?? '' : filters.warehouseId ?? ''} onChange={(event) => updateFilter('warehouseId', event.target.value)} disabled={isWarehouseManager}><option value="">{isWarehouseManager ? 'Assigned Warehouse' : 'All Warehouses'}</option>{warehouseRows.map((w) => <option key={w.id} value={w.id}>{w.address}</option>)}</select>
                  <select className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm" value={filters.customerId ?? ''} onChange={(event) => updateFilter('customerId', event.target.value)}><option value="">All Customers</option>{customerRows.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                  <Button variant="outline" onClick={clearFilters}><X className="h-4 w-4" />Clear Filters</Button>
                  <Button className="ml-auto" variant="outline" onClick={exportCsv}><FileDown className="h-4 w-4" />Export</Button>
                  <Button variant="outline" onClick={printPage}><Printer className="h-4 w-4" />Print</Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{['Invoice ID', 'Customer', 'Items', 'Warehouse', 'Amount', 'Discount', 'Status', 'Payment', 'Date', 'Actions'].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading ? <tr><td className="px-4 py-12 text-center text-gray-500" colSpan={10}>Loading sales invoices...</td></tr> : invoices.length === 0 ? <tr><td className="px-4 py-12 text-center text-gray-500" colSpan={10}>No sales invoices found</td></tr> : invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-indigo-50/30">
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className="font-semibold text-indigo-700 hover:underline"
                            onClick={() => setSelected(inv)}
                            aria-label={`View invoice ${invoiceCode(inv.id)}`}
                          >
                            {invoiceCode(inv.id)}
                          </button>
                        </td>
                        <td className="px-4 py-3">{inv.customer?.name ?? 'N/A'}</td>
                        <td className="px-4 py-3">{inv.items?.length ?? 0}</td>
                        <td className="px-4 py-3">{inv.warehouse?.address ?? 'N/A'}</td>
                        <td className="px-4 py-3 font-semibold">{formatCurrency(inv.totalPrice)}</td>
                        <td className="px-4 py-3">{inv.discount ? formatCurrency(inv.discount) : '-'}</td>
                        <td className="px-4 py-3"><Badge variant={statusBadge(inv.status)}>{inv.status ?? 'PAID'}</Badge></td>
                        <td className="px-4 py-3">{inv.paymentMethod ?? '-'}</td>
                        <td className="px-4 py-3">{formatDate(inv.createdAt)}</td>
                        <td className="px-4 py-3"><div className="flex gap-2"><button title="View" onClick={() => setSelected(inv)}><Eye className="h-4 w-4" /></button><button title="Print" onClick={printPage}><Printer className="h-4 w-4" /></button><button title="Create return" onClick={() => openReturn(inv)}><RotateCcw className="h-4 w-4" /></button><button title={inv.status === 'CANCELLED' ? 'Already cancelled' : 'Void sale'} disabled={inv.status === 'CANCELLED'} onClick={() => void handleVoid(inv)}><Trash2 className="h-4 w-4 text-red-500 disabled:text-gray-300" /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={filters.page ?? 0} totalPages={data?.totalPages ?? 0} totalElements={data?.totalElements} isFirst={data?.first} isLast={data?.last} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
            </Card>

            <Card padding={false}>
              <div className="flex items-center justify-between p-4"><h2 className="font-semibold text-gray-900">Recent Sales Returns</h2><Link href={ROUTES.RETURN_INVOICES} className="text-sm font-medium text-indigo-600">View all returns</Link></div>
              <div className="overflow-x-auto"><table className="w-full text-sm"><tbody className="divide-y divide-gray-100">{(recentReturns?.content ?? []).map((ret) => <tr key={ret.id}><td className="px-4 py-3 font-semibold text-indigo-700">{returnCode(ret.id)}</td><td className="px-4 py-3">{ret.customer?.name}</td><td className="px-4 py-3">{ret.reason}</td><td className="px-4 py-3">{formatCurrency(ret.totalPrice)}</td><td className="px-4 py-3"><Badge variant={ret.restockStatus === 'RESTOCKED' ? 'success' : 'warning'}>{ret.restockStatus ?? 'PENDING_RESTOCK'}</Badge></td><td className="px-4 py-3">{formatDate(ret.returnedAt)}</td></tr>)}</tbody></table></div>
            </Card>
          </div>
        )}
      </div>

      {selected && <InvoiceDrawer invoice={selected} onClose={() => setSelected(null)} onPrint={printPage} onReturn={() => openReturn(selected)} onVoid={() => void handleVoid(selected)} />}

      <Modal isOpen={saleOpen} onClose={() => setSaleOpen(false)} title="New Sale" size="xl">
        <form className="space-y-4" onSubmit={submitSale}>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="sale-customer" className="text-xs font-semibold text-gray-600">Customer</label>
              <select id="sale-customer" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={saleForm.customerId} onChange={(e) => setSaleForm((f) => ({ ...f, customerId: e.target.value }))}><option value="">Select customer</option>{customerRows.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            </div>
            <div className="space-y-1">
              <label htmlFor="sale-warehouse" className="text-xs font-semibold text-gray-600">Warehouse</label>
              <select id="sale-warehouse" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50" value={isWarehouseManager ? assignedWarehouseId ?? '' : saleForm.warehouseId} onChange={(e) => setSaleForm((f) => ({ ...f, warehouseId: e.target.value, productId: '' }))} disabled={isWarehouseManager}><option value="">Select warehouse</option>{warehouseRows.map((w) => <option key={w.id} value={w.id}>{w.address}</option>)}</select>
            </div>
            <div className="space-y-1">
              <label htmlFor="sale-product" className="text-xs font-semibold text-gray-600">Product</label>
              <select id="sale-product" required disabled={!saleWarehouseId} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50" value={saleForm.productId} onChange={(e) => { const row = stockRowsForWarehouse.find((s) => s.productId === Number(e.target.value)); setSaleForm((f) => ({ ...f, productId: e.target.value, unitPrice: row?.availableQuantity ? f.unitPrice : f.unitPrice })); }}>
                <option value="">{saleWarehouseId ? 'Select product' : 'Select warehouse first'}</option>
                {stockRowsForWarehouse.map((s) => <option key={s.productId} value={s.productId}>{s.productName} ({stockQty(s)} available)</option>)}
              </select>
            </div>
            <Input label="Quantity" type="number" min={1} value={saleForm.quantity} onChange={(e) => setSaleForm((f) => ({ ...f, quantity: Number(e.target.value) }))} />
            <Input label="Unit price" type="number" min={0} step="0.01" value={saleForm.unitPrice} onChange={(e) => setSaleForm((f) => ({ ...f, unitPrice: Number(e.target.value) }))} />
            <Input label="Discount (%)" type="number" min={0} max={100} step="0.01" value={saleForm.discount} onChange={(e) => {
              const raw = Number(e.target.value);
              const next = Number.isNaN(raw) ? 0 : Math.min(Math.max(raw, 0), 100);
              setSaleForm((f) => ({ ...f, discount: next }));
            }} />
            <div className="space-y-1">
              <label htmlFor="sale-payment-method" className="text-xs font-semibold text-gray-600">Payment method</label>
              <select id="sale-payment-method" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={saleForm.paymentMethod} onChange={(e) => setSaleForm((f) => ({ ...f, paymentMethod: e.target.value }))}>{paymentMethods.map((method) => <option key={method}>{method}</option>)}</select>
            </div>
            <Input label="Paid amount (auto)" type="number" min={0} step="0.01" value={salePaidAmountValue} readOnly className="bg-gray-50" />
          </div>
          <div className="space-y-1">
            <label htmlFor="sale-notes" className="text-xs font-semibold text-gray-600">Notes</label>
            <textarea id="sale-notes" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Optional details about the sale" value={saleForm.notes} onChange={(e) => setSaleForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          <p className="text-xs text-gray-500">
            <PackageSearch className="mr-1 inline h-3.5 w-3.5" />
            {saleWarehouseId
              ? `Available stock: ${stockQty(selectedStock)}${selectedProduct?.productName ? ` for ${selectedProduct.productName}` : ''}`
              : 'Select a warehouse to view available stock.'}
          </p>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setSaleOpen(false)}>Cancel</Button><Button type="submit" isLoading={createSale.isPending}>Create Sale</Button></div>
        </form>
      </Modal>

      <ReturnModal isOpen={returnOpen} invoice={returnInvoice} form={returnForm} setForm={setReturnForm} onClose={() => setReturnOpen(false)} onSubmit={submitReturn} isLoading={createReturn.isPending} />
    </>
  );
}

function InvoiceDrawer({ invoice, onClose, onPrint, onReturn, onVoid }: { invoice: SalesInvoice; onClose: () => void; onPrint: () => void; onReturn: () => void; onVoid: () => void }) {
  const subtotal = invoice.items?.reduce((sum, item) => sum + item.amount * item.sellingPrice, 0) ?? invoice.totalPrice + (invoice.discount ?? 0);
  return (
    <aside className="fixed right-0 top-0 z-40 h-screen w-full max-w-md overflow-y-auto border-l border-gray-200 bg-white p-6 shadow-xl">
      <div className="mb-6 flex items-center justify-between"><div><h2 className="text-lg font-bold">Invoice Details</h2><div className="mt-4 flex gap-3"><span className="font-semibold">{invoiceCode(invoice.id)}</span><Badge variant={statusBadge(invoice.status)}>{invoice.status ?? 'PAID'}</Badge></div></div><button onClick={onClose}><X className="h-5 w-5" /></button></div>
      <section className="border-t py-4"><p className="text-xs font-semibold text-gray-500">Customer</p><h3 className="mt-2 font-bold">{invoice.customer?.name}</h3><p className="mt-2 text-sm text-gray-600">{invoice.customer?.phone ?? 'No phone'}</p><p className="text-sm text-gray-600">{invoice.customer?.address}</p></section>
      <section className="grid grid-cols-2 gap-4 border-t py-4 text-sm"><div><p className="text-xs text-gray-500">Date</p>{formatDate(invoice.createdAt)}</div><div><p className="text-xs text-gray-500">Warehouse</p>{invoice.warehouse?.address}</div><div><p className="text-xs text-gray-500">Payment Method</p>{invoice.paymentMethod ?? '-'}</div><div><p className="text-xs text-gray-500">Sales Rep</p>{invoice.user?.username ?? 'Warehouse Manager'}</div><div className="col-span-2"><p className="text-xs text-gray-500">Notes</p>{invoice.notes ?? '-'}</div></section>
      <section className="border-t py-4"><h3 className="mb-3 font-semibold">Items ({invoice.items?.length ?? 0})</h3>{invoice.items?.map((item) => <div key={item.product?.id ?? item.productId} className="flex justify-between py-2 text-sm"><span>{item.product?.name}</span><span>{item.amount} x {formatCurrency(item.sellingPrice)}</span></div>)}</section>
      <section className="space-y-2 border-t py-4 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div><div className="flex justify-between"><span>Discount</span><span>-{formatCurrency(invoice.discount ?? 0)}</span></div><div className="flex justify-between font-bold text-gray-900"><span>Total Amount</span><span>{formatCurrency(invoice.totalPrice)}</span></div></section>
      <section className="space-y-2 border-t py-4 text-sm"><div className="flex justify-between"><span>Paid Amount</span><span>{formatCurrency(invoice.paidAmount ?? invoice.totalPrice)}</span></div><div className="flex justify-between font-semibold"><span>Balance Due</span><span>{formatCurrency(invoice.balanceDue ?? 0)}</span></div></section>
      <div className="grid grid-cols-3 gap-2 border-t pt-4"><Button size="sm" onClick={onPrint}><Printer className="h-4 w-4" />Print</Button><Button size="sm" variant="outline" onClick={onReturn}><RotateCcw className="h-4 w-4" />Return</Button><Button size="sm" variant="danger" disabled={invoice.status === 'CANCELLED'} onClick={onVoid}><Trash2 className="h-4 w-4" />Void</Button></div>
    </aside>
  );
}

function ReturnModal({ isOpen, invoice, form, setForm, onClose, onSubmit, isLoading }: { isOpen: boolean; invoice: SalesInvoice | null; form: { productId: string; quantity: number; reason: string; condition: string; restockDecision: string; refundMethod: string; notes: string }; setForm: (value: { productId: string; quantity: number; reason: string; condition: string; restockDecision: string; refundMethod: string; notes: string }) => void; onClose: () => void; onSubmit: (event: FormEvent) => void; isLoading: boolean }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Return" size="xl">
      <form className="space-y-4" onSubmit={onSubmit}>
        <p className="text-sm text-gray-600">Original invoice: <span className="font-semibold text-indigo-700">{invoice ? invoiceCode(invoice.id) : '-'}</span></p>
        <select required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}><option value="">Select returned item</option>{invoice?.items?.map((item) => <option key={item.product?.id ?? item.productId} value={item.product?.id ?? item.productId}>{item.product?.name} ({item.amount} sold)</option>)}</select>
        <div className="grid gap-3 md:grid-cols-2">
          <Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>{['Damaged on delivery', 'Defective', 'Wrong item', 'Overstock', 'Customer changed mind', 'Other'].map((reason) => <option key={reason}>{reason}</option>)}</select>
          <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>{['GOOD', 'DAMAGED', 'MIXED', 'NEEDS_INSPECTION'].map((value) => <option key={value}>{value}</option>)}</select>
          <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={form.restockDecision} onChange={(e) => setForm({ ...form, restockDecision: e.target.value })}>{['PENDING_REVIEW', 'RESTOCKABLE', 'NOT_RESTOCKABLE'].map((value) => <option key={value}>{value}</option>)}</select>
          <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={form.refundMethod} onChange={(e) => setForm({ ...form, refundMethod: e.target.value })}>{['Original payment', 'Store credit', 'No refund yet'].map((value) => <option key={value}>{value}</option>)}</select>
        </div>
        <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" isLoading={isLoading}>Create Return</Button></div>
      </form>
    </Modal>
  );
}
