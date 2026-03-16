'use client';

import Card, { CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import InvoiceItemsTable from './InvoiceItemsTable';
import { formatCurrency, formatDateTime } from '@/lib/formatters';

interface InvoiceDetailsProps {
  invoice: {
    id: number;
    createdAt: string;
    totalPrice: number;
    discount?: number;
    reason?: string;
    items?: any[];
  };
  type: 'sale' | 'purchase' | 'return' | 'return-purchase' | 'transfer';
  parties?: { label: string; value: string }[];
  priceField?: 'price' | 'sellingPrice';
}

const typeLabels = {
  sale: { label: 'Sales Invoice', variant: 'success' as const },
  purchase: { label: 'Purchase Invoice', variant: 'info' as const },
  return: { label: 'Return Invoice', variant: 'warning' as const },
  'return-purchase': { label: 'Return Purchase Invoice', variant: 'warning' as const },
  transfer: { label: 'Transfer Invoice', variant: 'default' as const },
};

export default function InvoiceDetails({ invoice, type, parties, priceField = 'sellingPrice' }: InvoiceDetailsProps) {
  const typeInfo = typeLabels[type];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CardTitle>Invoice #{invoice.id}</CardTitle>
              <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
            </div>
            <p className="text-sm text-gray-500">
              Created: {formatDateTime(invoice.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(invoice.totalPrice)}
            </p>
            {invoice.discount !== undefined && invoice.discount > 0 && (
              <p className="text-sm text-green-600">
                Discount: {formatCurrency(invoice.discount)}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Parties info */}
      {parties && parties.length > 0 && (
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parties.map((p) => (
              <div key={p.label}>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{p.label}</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{p.value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Reason (for returns) */}
      {invoice.reason && (
        <Card>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reason</p>
          <p className="text-sm text-gray-700">{invoice.reason}</p>
        </Card>
      )}

      {/* Items */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-gray-100">
          <CardTitle>Items</CardTitle>
        </div>
        <InvoiceItemsTable
          items={invoice.items || []}
          showPrice={type !== 'transfer'}
          priceField={priceField}
        />
      </Card>
    </div>
  );
}