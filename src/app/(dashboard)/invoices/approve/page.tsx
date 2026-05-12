'use client';

import toast from 'react-hot-toast';
import { CheckCircle2, ClipboardCheck } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import ErrorState from '@/components/ui/ErrorState';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import { useAuth } from '@/hooks/useAuth';
import { useApprovePurchaseOrder, usePurchaseInvoices } from '@/hooks/usePurchaseInvoices';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { receiptStatusBadge, receiptStatusLabel } from '@/lib/receipt-status';
import type { PurchaseInvoice, ReceiveOrderFilters } from '@/types/purchase-invoice.types';

export default function ApproveOrdersPage() {
  const { isGuest, isOperationalManager } = useAuth();
  const canApprove = !isGuest && isOperationalManager;

  const pendingApprovalFilters: ReceiveOrderFilters = {
    page: 0,
    size: 100,
    receiptStatus: 'PENDING_APPROVAL',
  };
  const pendingReceiptFilters: ReceiveOrderFilters = {
    page: 0,
    size: 100,
    receiptStatus: 'PENDING_RECEIPT',
  };

  const pendingApprovalQuery = usePurchaseInvoices(pendingApprovalFilters, { enabled: canApprove });
  const pendingReceiptQuery = usePurchaseInvoices(pendingReceiptFilters, { enabled: canApprove });
  const approveMutation = useApprovePurchaseOrder();
  const pendingApprovalOrders = pendingApprovalQuery.data?.content ?? [];
  const approvedUnstockedOrders = (pendingReceiptQuery.data?.content ?? []).filter((order) => {
    return !order.receivedAt && (order.totalReceivedQuantity ?? 0) === 0;
  });
  const orders = [...pendingApprovalOrders, ...approvedUnstockedOrders];
  const isLoading = pendingApprovalQuery.isLoading || pendingReceiptQuery.isLoading;
  const loadError = pendingApprovalQuery.error || pendingReceiptQuery.error;

  const handleApprove = (order: PurchaseInvoice) => {
    approveMutation.mutate(order.id, {
      onSuccess: () => toast.success(`PO-${String(order.id).padStart(4, '0')} approved and added to stock`),
      onError: () => toast.error('Could not approve order'),
    });
  };

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (order: PurchaseInvoice) => (
        <span className="font-semibold text-indigo-600">
          PO-{String(order.id).padStart(4, '0')}
        </span>
      ),
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (order: PurchaseInvoice) => (
        <span className="text-gray-700">{order.supplier?.name ?? '-'}</span>
      ),
    },
    {
      key: 'warehouse',
      label: 'Warehouse',
      render: (order: PurchaseInvoice) => (
        <span className="text-sm text-gray-600">{order.warehouse?.address ?? '-'}</span>
      ),
    },
    {
      key: 'items',
      label: 'Items',
      render: (order: PurchaseInvoice) => (
        <span className="text-gray-700">{order.items?.length ?? 0}</span>
      ),
    },
    {
      key: 'ordered',
      label: 'Ordered',
      render: (order: PurchaseInvoice) => (
        <span className="text-gray-700">{order.totalOrderedQuantity ?? 0}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (order: PurchaseInvoice) => (
        <span className="font-semibold text-gray-900">{formatCurrency(order.totalPrice)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (order: PurchaseInvoice) => {
        const status = receiptStatusBadge(order.receiptStatus);
        return <Badge variant={status.variant}>{receiptStatusLabel(order.receiptStatus)}</Badge>;
      },
    },
    {
      key: 'date',
      label: 'Date',
      render: (order: PurchaseInvoice) => (
        <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-32',
      render: (order: PurchaseInvoice) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => handleApprove(order)}
            isLoading={approveMutation.isPending}
            disabled={order.receiptStatus !== 'PENDING_APPROVAL' && order.receiptStatus !== 'PENDING_RECEIPT'}
          >
            <CheckCircle2 className="h-4 w-4" />
            {order.receiptStatus === 'PENDING_RECEIPT' ? 'Add stock' : 'Approve'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Topbar title="Approve" subtitle="Approve warehouse manager orders and add them to stock" />

      <div className="p-6 space-y-6">
        <BreadCrumb
          items={[
            { label: 'Orders' },
            { label: 'Approve' },
          ]}
        />

        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Pending approval</p>
              <p className="mt-1 text-sm text-gray-500">
                Orders approved here are added directly to the selected warehouse stock.
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <ClipboardCheck className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card>
          {!canApprove ? (
            <ErrorState
              title="Approval page unavailable"
              message="Only operational managers can approve warehouse orders."
            />
          ) : loadError ? (
            <ErrorState
              title="Could not load orders"
              message="Check that the backend is running and your session is valid."
              onRetry={() => {
                void pendingApprovalQuery.refetch();
                void pendingReceiptQuery.refetch();
              }}
            />
          ) : (
            <Table
              columns={columns}
              data={orders}
              keyExtractor={(order) => order.id}
              isLoading={isLoading}
              emptyMessage="No orders are waiting for approval or stock update."
            />
          )}
        </Card>
      </div>
    </>
  );
}
