'use client';

import { useRouter } from 'next/navigation';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Product } from '@/types/product.types';
import { formatCurrency } from '@/lib/formatters';
import { ROUTES } from '@/constants/routes';
import { Edit, Trash2, Eye } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  isLoading?: boolean;
  onDelete?: (product: Product) => void;
}

export default function ProductTable({ products, isLoading, onDelete }: ProductTableProps) {
  const router = useRouter();

  const columns = [
    {
      key: 'name',
      label: 'Product',
      render: (product: Product) => (
        <div className="flex items-center gap-3">
          {product.photo ? (
            <img
              src={product.photo}
              alt={product.name}
              className="w-10 h-10 rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-400">
              IMG
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{product.name}</p>
            <p className="text-xs text-gray-400 line-clamp-1">{product.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (product: Product) => (
        <Badge variant="info">{product.category?.name || '—'}</Badge>
      ),
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (product: Product) => (
        <span className="text-gray-600">{product.supplier?.name || '—'}</span>
      ),
    },
    {
      key: 'currentPrice',
      label: 'Price',
      render: (product: Product) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(product.currentPrice)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-24',
      render: (product: Product) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(ROUTES.PRODUCT_DETAIL(product.id));
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(ROUTES.PRODUCT_EDIT(product.id));
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(product);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={products}
      keyExtractor={(p) => p.id}
      isLoading={isLoading}
      emptyMessage="No products found"
      onRowClick={(p) => router.push(ROUTES.PRODUCT_DETAIL(p.id))}
    />
  );
}