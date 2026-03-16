'use client';

import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { WarehouseProduct } from '@/types/warehouse.types';
import { formatCurrency } from '@/lib/formatters';

interface StockTableProps {
  stock: WarehouseProduct[];
  isLoading?: boolean;
}

export default function StockTable({ stock, isLoading }: StockTableProps) {
  const columns = [
    {
      key: 'product',
      label: 'Product',
      render: (item: WarehouseProduct) => (
        <span className="font-medium text-gray-900">
          {item.product?.name || `Product #${item.productId}`}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (item: WarehouseProduct) => (
        <Badge variant="info">
          {item.product?.category?.name || '—'}
        </Badge>
      ),
    },
    {
      key: 'price',
      label: 'Unit Price',
      render: (item: WarehouseProduct) => (
        <span className="text-gray-700">
          {item.product ? formatCurrency(item.product.currentPrice) : '—'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Quantity',
      render: (item: WarehouseProduct) => {
        const isLow = item.amount <= 10;
        return (
          <Badge variant={isLow ? 'danger' : 'success'}>
            {item.amount} units
          </Badge>
        );
      },
    },
    {
      key: 'totalValue',
      label: 'Total Value',
      render: (item: WarehouseProduct) => (
        <span className="font-semibold text-gray-900">
          {item.product
            ? formatCurrency(item.product.currentPrice * item.amount)
            : '—'}
        </span>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={stock}
      keyExtractor={(item) => `${item.warehouseId}-${item.productId}`}
      isLoading={isLoading}
      emptyMessage="No stock in this warehouse"
    />
  );
}