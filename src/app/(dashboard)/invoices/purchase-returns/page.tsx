'use client';

import { useState, useMemo } from 'react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import DemoModeBanner from '@/components/ui/DemoModeBanner';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import { useReturnPurchaseInvoices } from '@/hooks/useReturnPurchaseInvoices';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { ReturnPurchaseInvoice } from '@/types/return-purchase-invoice.types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Eye } from 'lucide-react';

const fallbackInvoices: ReturnPurchaseInvoice[] = [
  {
    id: 401,
    supplierId: 1,
    purchaseInvoiceId: 201,
    userId: 1,
    createdAt: '2024-01-14T15:00:00Z',
    totalPrice: 199.99,
    reason: 'Wrong quantity',
    supplier: {
      id: 1,
      name: 'Tech Supplies Inc',
      address: '123 Industrial Way',
      phone: '(555) 123-4567',
    },
  },
];

export default function ReturnPurchaseInvoicesPage() {
  const { isGuest } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);

  const { data, isLoading, error, refetch } = useReturnPurchaseInvoices(
    { page: 0, size: 100, search: debouncedSearch || undefined },
    { enabled: !isGuest }
  );

  const showDemoData = isGuest;
  const showError = !showDemoData && !!error;
  const backendInvoices = data?.content ?? [];
  const baseInvoices = showDemoData ? fallbackInvoices : backendInvoices;

  const filteredInvoices = useMemo(() => {
    if (!debouncedSearch) return baseInvoices;
    const query = debouncedSearch.toLowerCase();
    return baseInvoices.filter(
      (inv) =>
        inv.id.toString().includes(query) ||
        inv.supplier?.name.toLowerCase().includes(query)
    );
  }, [baseInvoices, debouncedSearch]);

  const columns = [
    {
      key: 'id',
      label: 'Return ID',
      render: (inv: ReturnPurchaseInvoice) => (
        <span className="font-semibold text-gray-900">#{inv.id}</span>
      ),
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (inv: ReturnPurchaseInvoice) => (
        <span className="text-gray-600">{inv.supplier?.name || 'N/A'}</span>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (inv: ReturnPurchaseInvoice) => (
        <span className="text-gray-600 text-sm">{inv.reason}</span>
      ),
    },
    {
      key: 'totalPrice',
      label: 'Amount',
      render: (inv: ReturnPurchaseInvoice) => (
        <span className="font-semibold">{formatCurrency(inv.totalPrice)}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (inv: ReturnPurchaseInvoice) => (
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
      <Topbar title="Supplier Returns" subtitle="View and manage supplier returns" />

      <div className="p-6">
        <BreadCrumb
          items={[
            { label: 'Invoices', href: '/invoices' },
            { label: 'Supplier Returns' },
          ]}
        />

        {showDemoData && <DemoModeBanner resource="supplier returns" />}

        {showError ? (
          <ErrorState
            title="Could not load supplier returns"
            message="Authenticated users are not shown demo returns when the API fails."
            onRetry={() => void refetch()}
          />
        ) : (
          <Card>
            <div className="mb-4 max-w-md">
              <Input
                id="invoice-search"
                label="Search"
                placeholder="Search by ID or supplier"
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
        )}
      </div>
    </>
  );
}
