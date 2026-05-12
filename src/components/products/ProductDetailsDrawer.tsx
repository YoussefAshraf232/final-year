'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Edit, Ban, Boxes } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/ui/LoadingState';
import { useProductDetail } from '@/hooks/useProducts';
import { Product, StockStatus } from '@/types/product.types';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { ROUTES } from '@/constants/routes';

interface ProductDetailsDrawerProps {
  productId: number | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDeactivate: (product: Product) => void;
  canManage: boolean;
}

function stockBadge(status?: StockStatus) {
  if (status === 'IN_STOCK') return <Badge variant="success">In Stock</Badge>;
  if (status === 'LOW_STOCK') return <Badge variant="warning">Low Stock</Badge>;
  if (status === 'OUT_OF_STOCK') return <Badge variant="danger">Out of Stock</Badge>;
  return <Badge variant="default">Unknown</Badge>;
}

function statusBadge(status?: string) {
  if (status === 'ACTIVE') return <Badge variant="success">Active</Badge>;
  if (status === 'INACTIVE') return <Badge variant="default">Inactive</Badge>;
  if (status === 'DISCONTINUED') return <Badge variant="danger">Discontinued</Badge>;
  return null;
}

export default function ProductDetailsDrawer({
  productId,
  onClose,
  onEdit,
  onDeactivate,
  canManage,
}: ProductDetailsDrawerProps) {
  const router = useRouter();
  const { data, isLoading } = useProductDetail(productId, { enabled: !!productId });

  useEffect(() => {
    if (!productId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [productId, onClose]);

  if (!productId) return null;

  const product = data?.product;
  const stockByWarehouse = data?.stockByWarehouse ?? [];

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />
      <aside
        className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Product details"
      >
        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-gray-100"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </header>

        {isLoading || !product ? (
          <div className="p-6">
            <LoadingState label="Loading product..." />
          </div>
        ) : (
          <div className="space-y-6 p-6">
            <section className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                {statusBadge(product.status)}
              </div>
              <p className="text-sm text-gray-500">SKU: <span className="font-mono">{product.sku ?? 'N/A'}</span></p>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {product.description || 'No description'}
              </p>
            </section>

            <section className="space-y-2 border-t border-gray-100 pt-4">
              <h4 className="text-sm font-semibold text-gray-900">Product Information</h4>
              <DetailRow label="Category" value={product.categories?.[0]?.name ?? 'N/A'} />
              <DetailRow label="Supplier" value={product.supplier?.name ?? 'N/A'} />
              <DetailRow label="Selling Price" value={formatCurrency(product.currentPrice)} />
              <DetailRow
                label="Cost Price"
                value={product.costPrice != null ? formatCurrency(product.costPrice) : 'N/A'}
              />
              <DetailRow label="Reorder Level" value={String(product.reorderLevel ?? 0)} />
              <DetailRow
                label="Stock Status"
                value={stockBadge(product.stockStatus)}
              />
              <DetailRow label="Total Stock" value={String(product.totalStock ?? 0)} />
              <DetailRow
                label="Created At"
                value={product.createdAt ? formatDateTime(product.createdAt) : 'N/A'}
              />
              <DetailRow
                label="Updated At"
                value={product.updatedAt ? formatDateTime(product.updatedAt) : 'N/A'}
              />
            </section>

            <section className="space-y-2 border-t border-gray-100 pt-4">
              <h4 className="text-sm font-semibold text-gray-900">Stock by Warehouse</h4>
              {stockByWarehouse.length === 0 ? (
                <p className="text-sm text-gray-500">No warehouse stock records.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {stockByWarehouse.map((row) => (
                    <li key={row.warehouseId} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-gray-700">{row.warehouseName}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{row.amount}</span>
                        {stockBadge(row.stockStatus)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-2 border-t border-gray-100 pt-4">
              <h4 className="text-sm font-semibold text-gray-900">Recent Activity</h4>
              <p className="text-sm text-gray-500">No recent activity found.</p>
            </section>

            <div className="space-y-2 border-t border-gray-100 pt-4">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => router.push(`${ROUTES.STOCK}?productId=${product.id}`)}
              >
                <Boxes className="h-4 w-4" /> View Stock
              </Button>
              {canManage && (
                <>
                  <Button type="button" fullWidth onClick={() => onEdit(product)}>
                    <Edit className="h-4 w-4" /> Edit Product
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    fullWidth
                    onClick={() => onDeactivate(product)}
                  >
                    <Ban className="h-4 w-4" /> Deactivate Product
                  </Button>
                </>
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
