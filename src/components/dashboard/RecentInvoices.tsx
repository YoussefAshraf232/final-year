'use client';

import { FileText } from 'lucide-react';
import Card, { CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/formatters';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

interface RecentInvoice {
  id: number;
  type: 'sale' | 'purchase';
  customerOrSupplier: string;
  totalPrice: number;
  createdAt: string;
}

interface RecentInvoicesProps {
  invoices: RecentInvoice[];
  isLoading?: boolean;
}

export default function RecentInvoices({ invoices, isLoading }: RecentInvoicesProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <CardTitle>Recent Invoices</CardTitle>
        <Link
          href={ROUTES.SALES_INVOICES}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-2 bg-gray-100 rounded w-1/3" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No recent invoices</p>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div
              key={`${inv.type}-${inv.id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {inv.customerOrSupplier}
                </p>
                <p className="text-xs text-gray-400">{formatDate(inv.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(inv.totalPrice)}
                </p>
                <Badge variant={inv.type === 'sale' ? 'success' : 'info'}>
                  {inv.type === 'sale' ? 'Sale' : 'Purchase'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}