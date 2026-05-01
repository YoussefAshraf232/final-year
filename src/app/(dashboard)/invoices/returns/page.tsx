'use client';

import { useState, useMemo } from 'react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import { useReturnInvoices } from '@/hooks/useReturnInvoices';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { ReturnInvoice } from '@/types/return-invoice.types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Eye } from 'lucide-react';

const fallbackInvoices: ReturnInvoice[] = [
  {
    id: 301,
    customerId: 1,
    salesInvoiceId: 101,
    userId: 1,
    returnedAt: '2024-01-15T11:00:00Z',
    totalPrice: 99.99,
    reason: 'Defective item',
    customer: { id: 1, name: 'John Doe', address: '123 Main St' },
  },
];

export default function ReturnInvoicesPage() {
  const { isGuest } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);

  const { data, isLoading, error } = useReturnInvoices(
    { page: 0, size: 100, search: debouncedSearch || undefined },
    { enabled: !isGuest }
  );

  const showDemoData = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || isGuest;
  const backendInvoices = data?.content ?? [];
  const baseInvoices = showDemoData ? fallbackInvoices : backendInvoices;

  const filteredInvoices = useMemo(() => {
    if (!debouncedSearch) return baseInvoices;
    const query = debouncedSearch.toLowerCase();
    return baseInvoices.filter(
      (inv) =>
        inv.id.toString().includes(query) ||
        inv.customer?.name.toLowerCase().includes(query)
    );
  }, [baseInvoices, debouncedSearch]);

  const columns = [
    {
      key: 'id',
      label: 'Return ID',
      render: (inv: ReturnInvoice) => (
        <span className="font-semibold text-gray-900">#{inv.id}</span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (inv: ReturnInvoice) => (
        <span className="text-gray-600">{inv.customer?.name || 'N/A'}</span>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (inv: ReturnInvoice) => (
        <span className="text-gray-600 text-sm">{inv.reason}</span>
      ),
    },
    {
      key: 'totalPrice',
      label: 'Amount',
      render: (inv: ReturnInvoice) => (
        <span className="font-semibold">{formatCurrency(inv.totalPrice)}</span>
      ),
    },
    {
      key: 'returnedAt',
      label: 'Date',
      render: (inv: ReturnInvoice) => (
        <span className="text-gray-600 text-sm">{formatDate(inv.returnedAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-12',
      render: () => <Eye className="h-4 w-4 text-gray-400" />,
    },
  ];

  return (
    <>
      <Topbar title="Customer Returns" subtitle="View and manage customer returns" />

      <div className="p-6">
        <BreadCrumb
          items={[
            { label: 'Invoices', href: '/invoices' },
            { label: 'Returns' },
          ]}
        />

        {showDemoData && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Showing demo invoices because demo mode is enabled.
          </div>
        )}

        <Card>
          <div className="mb-4 max-w-md">
            <Input
              id="invoice-search"
              label="Search"
              placeholder="Search by ID or customer"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <Table
            columns={columns}
            data={filteredInvoices}
            keyExtractor={(inv) => inv.id}
            isLoading={!showDemoData && isLoading}
            emptyMessage="No return invoices found"
          />
        </Card>
      </div>
    </>
  );
}
