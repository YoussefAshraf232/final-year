'use client';

import { useState, useMemo } from 'react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { useSalesInvoices } from '@/hooks/useSalesInvoices';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { SalesInvoice } from '@/types/sales-invoice.types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Eye } from 'lucide-react';

const fallbackInvoices: SalesInvoice[] = [
  {
    id: 101,
    customerId: 1,
    userId: 1,
    warehouseId: 1,
    createdAt: '2024-01-15T10:30:00Z',
    totalPrice: 299.99,
    discount: 0,
    customer: { id: 1, name: 'John Doe', address: '123 Main St' },
  },
  {
    id: 102,
    customerId: 2,
    userId: 1,
    warehouseId: 1,
    createdAt: '2024-01-14T14:20:00Z',
    totalPrice: 899.50,
    discount: 50,
    customer: { id: 2, name: 'Jane Smith', address: '456 Oak Ave' },
  },
];

export default function SalesInvoicesPage() {
  const { isGuest } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);

  const { data, isLoading, error } = useSalesInvoices(
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
      label: 'Invoice ID',
      render: (inv: SalesInvoice) => (
        <span className="font-semibold text-gray-900">#{inv.id}</span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (inv: SalesInvoice) => (
        <span className="text-gray-600">{inv.customer?.name || 'N/A'}</span>
      ),
    },
    {
      key: 'totalPrice',
      label: 'Amount',
      render: (inv: SalesInvoice) => (
        <span className="font-semibold">{formatCurrency(inv.totalPrice)}</span>
      ),
    },
    {
      key: 'discount',
      label: 'Discount',
      render: (inv: SalesInvoice) => (
        <span className="text-green-600">
          {inv.discount ? formatCurrency(inv.discount) : '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (inv: SalesInvoice) => (
        <span className="text-gray-600 text-sm">{formatDate(inv.createdAt)}</span>
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
      <Topbar title="Sales Invoices" subtitle="View and manage sales transactions" />

      <div className="p-6">
        <BreadCrumb
          items={[
            { label: 'Invoices', href: '/invoices' },
            { label: 'Sales' },
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
            emptyMessage="No sales invoices found"
          />
        </Card>
      </div>
    </>
  );
}
