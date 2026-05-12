'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Edit, Ban, FileText } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/ui/LoadingState';
import { useSupplierDetail } from '@/hooks/useSuppliers';
import { Supplier } from '@/types/supplier.types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { ROUTES } from '@/constants/routes';

interface SupplierDetailsDrawerProps {
  supplierId: number | null;
  onClose: () => void;
  onEdit: (supplier: Supplier) => void;
  onDeactivate: (supplier: Supplier) => void;
  canManage: boolean;
}

function statusBadge(status?: string) {
  if (status === 'ACTIVE') return <Badge variant="success">Active</Badge>;
  if (status === 'INACTIVE') return <Badge variant="default">Inactive</Badge>;
  return null;
}

export default function SupplierDetailsDrawer({
  supplierId,
  onClose,
  onEdit,
  onDeactivate,
  canManage,
}: SupplierDetailsDrawerProps) {
  const router = useRouter();
  const { data, isLoading } = useSupplierDetail(supplierId, { enabled: !!supplierId });

  useEffect(() => {
    if (!supplierId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [supplierId, onClose]);

  if (!supplierId) return null;

  const supplier = data?.supplier;
  const recent = data?.recentPurchaseOrders ?? [];

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />
      <aside
        className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Supplier details"
      >
        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Supplier Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-gray-100"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </header>

        {isLoading || !supplier ? (
          <div className="p-6">
            <LoadingState label="Loading supplier..." />
          </div>
        ) : (
          <div className="space-y-6 p-6">
            <section className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-semibold text-gray-900">{supplier.name}</h3>
                {statusBadge(supplier.status)}
              </div>
            </section>

            <section className="space-y-2 border-t border-gray-100 pt-4">
              <DetailRow label="Supplier ID" value={`#${supplier.id}`} />
              <DetailRow label="Contact Person" value={supplier.contactPerson || 'N/A'} />
              <DetailRow label="Phone" value={supplier.phone || 'N/A'} />
              <DetailRow label="Email" value={supplier.email || 'N/A'} />
              <DetailRow label="Address" value={supplier.address || 'N/A'} />
              <DetailRow
                label="Products Supplied"
                value={`${supplier.productsCount ?? 0} products`}
              />
              <DetailRow
                label="Created Date"
                value={supplier.createdAt ? formatDate(supplier.createdAt) : 'N/A'}
              />
            </section>

            {supplier.notes && (
              <section className="space-y-2 border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-gray-900">Notes</h4>
                <p className="whitespace-pre-line text-sm text-gray-600">{supplier.notes}</p>
              </section>
            )}

            <section className="space-y-2 border-t border-gray-100 pt-4">
              <h4 className="text-sm font-semibold text-gray-900">Recent Purchase Orders</h4>
              {recent.length === 0 ? (
                <p className="text-sm text-gray-500">No purchase orders found.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {recent.map((po) => (
                    <li key={po.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="font-mono text-xs text-gray-700">PO-{po.id}</span>
                      <span className="text-gray-500">{formatDate(po.createdAt)}</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(po.totalAmount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                onClick={() =>
                  router.push(`${ROUTES.PURCHASE_INVOICES}?supplierId=${supplier.id}`)
                }
              >
                View all purchase orders
              </button>
            </section>

            <div className="space-y-2 border-t border-gray-100 pt-4">
              {canManage && (
                <Button type="button" fullWidth onClick={() => onEdit(supplier)}>
                  <Edit className="h-4 w-4" /> Edit Supplier
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() =>
                  router.push(
                    `${ROUTES.PURCHASE_INVOICES}?supplierId=${supplier.id}&newPurchase=true`,
                  )
                }
              >
                <FileText className="h-4 w-4" /> Create Purchase Order
              </Button>
              {canManage && (
                <Button
                  type="button"
                  variant="danger"
                  fullWidth
                  onClick={() => onDeactivate(supplier)}
                >
                  <Ban className="h-4 w-4" /> Deactivate
                </Button>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{value}</span>
    </div>
  );
}
