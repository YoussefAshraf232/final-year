'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Eye, FileDown, Package, Printer, RotateCcw, Wallet, X } from 'lucide-react';
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
import { useSalesInvoices } from '@/hooks/useSalesInvoices';
import { useApproveReturnInvoice, useCreateReturnInvoice, useRefundReturnInvoice, useRejectReturnInvoice, useRestockReturnInvoice, useReturnInvoices, useReturnSalesSummary } from '@/hooks/useReturnInvoices';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { SalesInvoice } from '@/types/sales-invoice.types';
import { CreateReturnInvoiceRequest, ReturnInvoice, ReturnInvoiceFilters } from '@/types/return-invoice.types';

const returnStatuses = ['', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'REFUNDED', 'CREDIT_ISSUED'];
const restockStatuses = ['', 'PENDING_RESTOCK', 'AWAITING_INSPECTION', 'RESTOCKED', 'NOT_RESTOCKED'];

function returnCode(id: number) {
  return `RET-${String(id).padStart(4, '0')}`;
}

function invoiceCode(id?: number) {
  return id ? `INV-${String(id).padStart(4, '0')}` : '-';
}

function badgeFor(value?: string): BadgeVariant {
  if (value === 'APPROVED' || value === 'REFUNDED' || value === 'RESTOCKED') return 'success';
  if (value === 'REJECTED' || value === 'NOT_RESTOCKED') return 'danger';
  if (value === 'AWAITING_INSPECTION' || value === 'CREDIT_ISSUED') return 'info';
  return 'warning';
}

export default function ReturnInvoicesPage() {
  const { isGuest } = useAuth();
  const [filters, setFilters] = useState<ReturnInvoiceFilters>({ page: 0, size: 10 });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);
  const queryFilters = useMemo(() => ({ ...filters, search: debouncedSearch || undefined }), [filters, debouncedSearch]);
  const { data, isLoading, error, refetch } = useReturnInvoices(queryFilters, { enabled: !isGuest });
  const { data: summary } = useReturnSalesSummary({ enabled: !isGuest });
  const { data: salesInvoices } = useSalesInvoices({ page: 0, size: 200 }, { enabled: !isGuest });
  const { data: customers } = useCustomers({ page: 0, size: 200 }, { enabled: !isGuest });
  const { data: warehouses } = useWarehouses({ page: 0, size: 200 }, { enabled: !isGuest });
  const createReturn = useCreateReturnInvoice();
  const approveReturn = useApproveReturnInvoice();
  const rejectReturn = useRejectReturnInvoice();
  const restockReturn = useRestockReturnInvoice();
  const refundReturn = useRefundReturnInvoice();
  const [selected, setSelected] = useState<ReturnInvoice | null>(null);
  const [actionReturnId, setActionReturnId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ salesInvoiceId: '', productId: '', quantity: 1, reason: 'Damaged on delivery', condition: 'NEEDS_INSPECTION', restockDecision: 'PENDING_REVIEW', refundMethod: 'Original payment', notes: '' });

  const returns = data?.content ?? [];
  const invoiceRows = salesInvoices?.content ?? [];
  const selectedInvoice = invoiceRows.find((inv) => inv.id === Number(form.salesInvoiceId));
  const customerRows = customers?.content ?? [];
  const warehouseRows = warehouses?.content ?? [];

  function updateFilter(key: keyof ReturnInvoiceFilters, value: string) {
    setFilters((current) => ({ ...current, page: 0, [key]: value ? (key.endsWith('Id') ? Number(value) : value) : undefined }));
  }

  function clearFilters() {
    setSearch('');
    setFilters({ page: 0, size: 10 });
  }

  function reviewPending() {
    setFilters((current) => ({ ...current, page: 0, returnStatus: 'PENDING_REVIEW', restockStatus: undefined }));
  }

  function exportCsv() {
    const rows = returns.map((ret) => [returnCode(ret.id), invoiceCode(ret.salesInvoiceId), ret.customer?.name ?? '', ret.items?.length ?? 0, ret.reason, ret.totalPrice, ret.returnStatus ?? '', ret.restockStatus ?? '', ret.refundStatus ?? '', formatDate(ret.returnedAt)]);
    const csv = [['Return ID', 'Original Invoice', 'Customer', 'Items', 'Reason', 'Amount', 'Return Status', 'Restock Status', 'Refund Status', 'Date'], ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sales-returns.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  function printPage() {
    window.print();
  }

  async function submitReturn(event: FormEvent) {
    event.preventDefault();
    const invoice = selectedInvoice;
    const item = invoice?.items?.find((row) => (row.product?.id ?? row.productId) === Number(form.productId));
    if (!invoice || !item) return toast.error('Select an invoice item');
    if (form.quantity <= 0 || form.quantity > item.amount) return toast.error('Returned quantity exceeds sold quantity');
    const payload: CreateReturnInvoiceRequest = {
      salesInvoiceId: invoice.id,
      customerId: invoice.customer?.id ?? invoice.customerId!,
      warehouseId: invoice.warehouse?.id ?? invoice.warehouseId!,
      reason: form.reason,
      refundMethod: form.refundMethod,
      notes: form.notes || undefined,
      items: [{ productId: Number(form.productId), amount: form.quantity, priceAtReturn: item.sellingPrice, condition: form.condition as never, restockDecision: form.restockDecision as never }],
    };
    await createReturn.mutateAsync(payload);
    toast.success('Return created');
    setModalOpen(false);
  }

  async function runReturnAction(id: number, label: string, action: (returnId: number) => Promise<ReturnInvoice>) {
    setActionReturnId(id);
    try {
      const updated = await action(id);
      setSelected((current) => (current?.id === updated.id ? updated : current));
      await refetch();
      toast.success(label);
    } finally {
      setActionReturnId(null);
    }
  }

  const kpis = [
    { label: 'Returns Today', value: formatCurrency(summary?.returnsTodayAmount ?? 0), detail: 'Returned value', icon: RotateCcw, tone: 'bg-indigo-50 text-indigo-700' },
    { label: 'Pending Approval', value: summary?.pendingApprovalCount ?? 0, detail: 'Need review', icon: Check, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Refunded Amount', value: formatCurrency(summary?.refundedAmount ?? 0), detail: 'Refunded total', icon: Wallet, tone: 'bg-green-50 text-green-700' },
    { label: 'Pending Restock', value: summary?.pendingRestockCount ?? 0, detail: 'Items need review', icon: Package, tone: 'bg-red-50 text-red-700' },
  ];

  if (isGuest) {
    return (
      <>
        <Topbar title="Sales Returns" subtitle="Review, approve, and process customer return transactions" />
        <div className="p-6"><DemoModeBanner resource="sales returns" /></div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Sales Returns" subtitle="Review, approve, and process customer return transactions" />
      <div className="bg-slate-50 p-6">
        <BreadCrumb items={[{ label: 'Sales' }, { label: 'Manage Sales', href: ROUTES.SALES_INVOICES }, { label: 'Sales Returns' }]} />
        <div className="mb-4 flex gap-6 border-b border-gray-200">
          <Link href={ROUTES.SALES_INVOICES} className="px-1 pb-3 text-sm font-medium text-gray-500 hover:text-indigo-700">Sales Invoices</Link>
          <Link href={ROUTES.RETURN_INVOICES} className="border-b-2 border-indigo-600 px-1 pb-3 text-sm font-semibold text-indigo-700">Sales Returns</Link>
        </div>

        {error ? (
          <ErrorState title="Could not load sales returns" message="Authenticated users are not shown demo returns when the API fails." onRetry={() => void refetch()} />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              {kpis.map((kpi) => <Card key={kpi.label} className="flex items-center gap-4"><div className={`rounded-xl p-3 ${kpi.tone}`}><kpi.icon className="h-6 w-6" /></div><div><p className="text-xs font-semibold text-gray-500">{kpi.label}</p><p className="mt-1 text-2xl font-bold text-gray-900">{kpi.value}</p><p className="text-xs text-gray-500">{kpi.detail}</p></div></Card>)}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <span>Some returned items require approval or restocking review before refunds can be issued.</span>
              <Button size="sm" variant="outline" onClick={reviewPending}>Review Pending Returns</Button>
            </div>

            <Card padding={false}>
              <div className="space-y-3 border-b border-gray-100 p-4">
                <div className="flex flex-wrap items-end gap-3">
                  <Input className="h-10" placeholder="Search by return ID, invoice ID, or customer" value={search} onChange={(event) => setSearch(event.target.value)} />
                  <select className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm" value={filters.returnStatus ?? ''} onChange={(event) => updateFilter('returnStatus', event.target.value)}>{returnStatuses.map((status) => <option key={status} value={status}>{status || 'All Statuses'}</option>)}</select>
                  <select className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm" value={filters.restockStatus ?? ''} onChange={(event) => updateFilter('restockStatus', event.target.value)}>{restockStatuses.map((status) => <option key={status} value={status}>{status || 'All Restock'}</option>)}</select>
                  <Input type="date" value={filters.dateFrom?.slice(0, 10) ?? ''} onChange={(event) => updateFilter('dateFrom', event.target.value ? `${event.target.value}T00:00:00Z` : '')} />
                  <Button className="ml-auto" onClick={() => setModalOpen(true)}>+ New Return</Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Input type="date" value={filters.dateTo?.slice(0, 10) ?? ''} onChange={(event) => updateFilter('dateTo', event.target.value ? `${event.target.value}T23:59:59Z` : '')} />
                  <select className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm" value={filters.warehouseId ?? ''} onChange={(event) => updateFilter('warehouseId', event.target.value)}><option value="">All Warehouses</option>{warehouseRows.map((w) => <option key={w.id} value={w.id}>{w.address}</option>)}</select>
                  <select className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm" value={filters.customerId ?? ''} onChange={(event) => updateFilter('customerId', event.target.value)}><option value="">All Customers</option>{customerRows.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                  <Button variant="outline" onClick={clearFilters}><X className="h-4 w-4" />Clear Filters</Button>
                  <Button className="ml-auto" variant="outline" onClick={exportCsv}><FileDown className="h-4 w-4" />Export</Button>
                  <Button variant="outline" onClick={printPage}><Printer className="h-4 w-4" />Print</Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{['Return ID', 'Original Invoice', 'Customer', 'Returned Items', 'Reason', 'Return Status', 'Return Amount', 'Condition', 'Restock Status', 'Refund Status', 'Date', 'Actions'].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading ? <tr><td className="px-4 py-12 text-center text-gray-500" colSpan={12}>Loading sales returns...</td></tr> : returns.length === 0 ? <tr><td className="px-4 py-12 text-center text-gray-500" colSpan={12}>No sales returns found</td></tr> : returns.map((ret) => (
                      <tr key={ret.id} className="hover:bg-indigo-50/30">
                        <td className="px-4 py-3 font-semibold text-indigo-700">{returnCode(ret.id)}</td>
                        <td className="px-4 py-3">{invoiceCode(ret.salesInvoiceId)}</td>
                        <td className="px-4 py-3">{ret.customer?.name ?? 'N/A'}</td>
                        <td className="px-4 py-3">{ret.items?.length ?? 0} items</td>
                        <td className="px-4 py-3">{ret.reason}</td>
                        <td className="px-4 py-3"><Badge variant={badgeFor(ret.returnStatus)}>{ret.returnStatus ?? 'PENDING_REVIEW'}</Badge></td>
                        <td className="px-4 py-3 font-semibold">{formatCurrency(ret.totalPrice)}</td>
                        <td className="px-4 py-3">{ret.items?.[0]?.condition ?? '-'}</td>
                        <td className="px-4 py-3"><Badge variant={badgeFor(ret.restockStatus)}>{ret.restockStatus ?? 'PENDING_RESTOCK'}</Badge></td>
                        <td className="px-4 py-3"><Badge variant={badgeFor(ret.refundStatus)}>{ret.refundStatus ?? 'PENDING_REFUND'}</Badge></td>
                        <td className="px-4 py-3">{formatDate(ret.returnedAt)}</td>
                        <td className="px-4 py-3"><div className="flex gap-2"><button title="View" onClick={() => setSelected(ret)}><Eye className="h-4 w-4" /></button><button title="Print" onClick={printPage}><Printer className="h-4 w-4" /></button><button title={ret.returnStatus === 'PENDING_REVIEW' ? 'Approve this return' : 'Approval unavailable'} disabled={ret.returnStatus !== 'PENDING_REVIEW' || actionReturnId === ret.id} onClick={() => void runReturnAction(ret.id, 'Return approved', approveReturn.mutateAsync)}><Check className="h-4 w-4 text-green-600" /></button><button title="Reject this return" disabled={ret.returnStatus !== 'PENDING_REVIEW' || actionReturnId === ret.id} onClick={() => void runReturnAction(ret.id, 'Return rejected', rejectReturn.mutateAsync)}><X className="h-4 w-4 text-red-500" /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={filters.page ?? 0} totalPages={data?.totalPages ?? 0} totalElements={data?.totalElements} isFirst={data?.first} isLast={data?.last} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
            </Card>
          </div>
        )}
      </div>

      {selected && (
        <ReturnDrawer
          item={selected}
          onClose={() => setSelected(null)}
          onPrint={printPage}
          onApprove={() => void runReturnAction(selected.id, 'Return approved', approveReturn.mutateAsync)}
          onRestock={() => void runReturnAction(selected.id, 'Items restocked', restockReturn.mutateAsync)}
          onRefund={() => void runReturnAction(selected.id, 'Refund issued', refundReturn.mutateAsync)}
          isBusy={actionReturnId === selected.id}
        />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Return" size="xl">
        <form className="space-y-4" onSubmit={submitReturn}>
          <select required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={form.salesInvoiceId} onChange={(e) => setForm({ ...form, salesInvoiceId: e.target.value, productId: '' })}><option value="">Select original sales invoice</option>{invoiceRows.map((inv) => <option key={inv.id} value={inv.id}>{invoiceCode(inv.id)} - {inv.customer?.name}</option>)}</select>
          <select required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}><option value="">Select returned item</option>{selectedInvoice?.items?.map((item) => <option key={item.product?.id ?? item.productId} value={item.product?.id ?? item.productId}>{item.product?.name} ({item.amount} sold)</option>)}</select>
          <div className="grid gap-3 md:grid-cols-2">
            <Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>{['Damaged on delivery', 'Defective', 'Wrong item', 'Overstock', 'Customer changed mind', 'Other'].map((reason) => <option key={reason}>{reason}</option>)}</select>
            <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>{['GOOD', 'DAMAGED', 'MIXED', 'NEEDS_INSPECTION'].map((value) => <option key={value}>{value}</option>)}</select>
            <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={form.restockDecision} onChange={(e) => setForm({ ...form, restockDecision: e.target.value })}>{['PENDING_REVIEW', 'RESTOCKABLE', 'NOT_RESTOCKABLE'].map((value) => <option key={value}>{value}</option>)}</select>
            <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={form.refundMethod} onChange={(e) => setForm({ ...form, refundMethod: e.target.value })}>{['Original payment', 'Store credit', 'No refund yet'].map((value) => <option key={value}>{value}</option>)}</select>
          </div>
          <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit" isLoading={createReturn.isPending}>Create Return</Button></div>
        </form>
      </Modal>
    </>
  );
}

function ReturnDrawer({ item, onClose, onPrint, onApprove, onRestock, onRefund, isBusy }: { item: ReturnInvoice; onClose: () => void; onPrint: () => void; onApprove: () => void; onRestock: () => void; onRefund: () => void; isBusy: boolean }) {
  return (
    <aside className="fixed right-0 top-0 z-40 h-screen w-full max-w-md overflow-y-auto border-l border-gray-200 bg-white p-6 shadow-xl">
      <div className="mb-6 flex items-center justify-between"><div><h2 className="text-lg font-bold">Return Details</h2><div className="mt-4 flex gap-3"><span className="font-semibold">{returnCode(item.id)}</span><Badge variant={badgeFor(item.returnStatus)}>{item.returnStatus ?? 'PENDING_REVIEW'}</Badge></div></div><button onClick={onClose}><X className="h-5 w-5" /></button></div>
      <section className="border-t py-4"><p className="text-xs font-semibold text-gray-500">Customer</p><h3 className="mt-2 font-bold">{item.customer?.name}</h3><p className="mt-2 text-sm text-gray-600">{item.customer?.phone ?? 'No phone'}</p><p className="text-sm text-gray-600">{item.customer?.address}</p></section>
      <section className="grid grid-cols-2 gap-4 border-t py-4 text-sm"><div><p className="text-xs text-gray-500">Original Invoice</p>{invoiceCode(item.salesInvoiceId)}</div><div><p className="text-xs text-gray-500">Return Date</p>{formatDate(item.returnedAt)}</div><div><p className="text-xs text-gray-500">Warehouse</p>{item.warehouse?.address}</div><div><p className="text-xs text-gray-500">Processed By</p>{item.user?.username ?? 'Warehouse Manager'}</div><div><p className="text-xs text-gray-500">Refund Method</p>{item.refundMethod ?? '-'}</div><div><p className="text-xs text-gray-500">Reason</p>{item.reason}</div><div className="col-span-2"><p className="text-xs text-gray-500">Notes</p>{item.notes ?? '-'}</div></section>
      <section className="border-t py-4"><h3 className="mb-3 font-semibold">Returned Items ({item.items?.length ?? 0})</h3>{item.items?.map((row) => <div key={row.product?.id ?? row.productId} className="grid grid-cols-4 gap-2 py-2 text-sm"><span className="col-span-2">{row.product?.name}</span><span>{row.amount}</span><span>{formatCurrency((row.priceAtReturn ?? 0) * row.amount)}</span></div>)}</section>
      <section className="space-y-2 border-t py-4 text-sm"><div className="flex justify-between"><span>Subtotal Refund</span><span>{formatCurrency(item.totalPrice)}</span></div><div className="flex justify-between font-bold text-gray-900"><span>Total Refund</span><span>{formatCurrency(item.totalPrice)}</span></div></section>
      <section className="grid grid-cols-2 gap-3 border-t py-4 text-sm"><div><p className="text-xs text-gray-500">Restock Decision</p><Badge variant={badgeFor(item.restockStatus)}>{item.restockStatus ?? 'PENDING_RESTOCK'}</Badge></div><div><p className="text-xs text-gray-500">Refund Status</p><Badge variant={badgeFor(item.refundStatus)}>{item.refundStatus ?? 'PENDING_REFUND'}</Badge></div></section>
      <div className="grid grid-cols-2 gap-2 border-t pt-4"><Button size="sm" isLoading={isBusy} disabled={item.returnStatus !== 'PENDING_REVIEW'} onClick={onApprove}><Check className="h-4 w-4" />Approve</Button><Button size="sm" variant="outline" isLoading={isBusy} disabled={item.returnStatus !== 'APPROVED'} onClick={onRestock}><Package className="h-4 w-4" />Restock</Button><Button size="sm" variant="outline" isLoading={isBusy} disabled={item.returnStatus !== 'APPROVED'} onClick={onRefund}><Wallet className="h-4 w-4" />Refund</Button><Button size="sm" variant="outline" onClick={onPrint}><Printer className="h-4 w-4" />Print</Button></div>
    </aside>
  );
}
