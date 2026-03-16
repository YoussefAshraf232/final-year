'use client';

import Table from '@/components/ui/Table';
import { formatCurrency } from '@/lib/formatters';

interface InvoiceItem {
  productId: number;
  amount: number;
  price?: number;
  sellingPrice?: number;
  product?: { name: string };
}

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  showPrice?: boolean;
  priceField?: 'price' | 'sellingPrice';
}

export default function InvoiceItemsTable({
  items,
  showPrice = true,
  priceField = 'sellingPrice',
}: InvoiceItemsTableProps) {
  const columns = [
    {
      key: 'product',
      label: 'Product',
      render: (item: InvoiceItem) => (
        <span className="font-medium text-gray-900">
          {item.product?.name || `Product #${item.productId}`}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Quantity',
      render: (item: InvoiceItem) => (
        <span className="text-gray-700">{item.amount}</span>
      ),
    },
    ...(showPrice
      ? [
          {
            key: 'unitPrice',
            label: 'Unit Price',
            render: (item: InvoiceItem) => {
              const price = priceField === 'sellingPrice' ? item.sellingPrice : item.price;
              return (
                <span className="text-gray-700">
                  {price !== undefined ? formatCurrency(price) : '—'}
                </span>
              );
            },
          },
          {
            key: 'total',
            label: 'Total',
            render: (item: InvoiceItem) => {
              const price = priceField === 'sellingPrice' ? item.sellingPrice : item.price;
              return (
                <span className="font-semibold text-gray-900">
                  {price !== undefined ? formatCurrency(price * item.amount) : '—'}
                </span>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <Table
      columns={columns}
      data={items}
      keyExtractor={(item) => item.productId}
      emptyMessage="No items"
    />
  );
}