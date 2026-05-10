'use client';

import { useState, useMemo } from 'react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import DemoModeBanner from '@/components/ui/DemoModeBanner';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { useInternalInvoices } from '@/hooks/useInternalInvoices';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { InternalInvoice } from '@/types/internal-invoice.types';
import { formatDate } from '@/lib/formatters';
import { Eye } from 'lucide-react';

const fallbackInvoices: InternalInvoice[] = [
  {
    id: 501,
    sourceWarehouseId: 1,
    destinationWarehouseId: 2,
    createdAt: '2024-01-15T12:30:00Z',
    sourceWarehouse: {
      id: 1,
      address: 'Main Warehouse',
      isCentral: true,
      createdAt: '2024-01-01T00:00:00Z',
    },
    destinationWarehouse: {
      id: 2,
      address: 'Tech Store',
      isCentral: false,
      createdAt: '2024-02-01T00:00:00Z',
    },
    items: [
      {
        internalInvoiceId: 501,
        productId: 1,
        amount: 12,
      },
    ],
  },
];

export default function InternalInvoicesPage() {
  const { isGuest } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);

  const { data, isLoading, error, refetch } = useInternalInvoices(
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
    return baseInvoices.filter((inv) =>
      inv.id.toString().includes(query)
    );
  }, [baseInvoices, debouncedSearch]);

  const columns = [
    {
      key: 'id',
      label: 'Transfer ID',
      render: (inv: InternalInvoice) => (
        <span className="font-semibold text-gray-900">#{inv.id}</span>
      ),
    },
    {
      key: 'sourceWarehouse',
      label: 'From',
      render: (inv: InternalInvoice) => (
        <span className="text-gray-600 text-sm">
          {inv.sourceWarehouse?.address || 'N/A'}
        </span>
      ),
    },
    {
      key: 'destinationWarehouse',
      label: 'To',
      render: (inv: InternalInvoice) => (
        <span className="text-gray-600 text-sm">
          {inv.destinationWarehouse?.address || 'N/A'}
        </span>
      ),
    },
    {
      key: 'items',
      label: 'Items',
      render: (inv: InternalInvoice) => (
        <span className="font-semibold">{inv.items?.length ?? 0}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (inv: InternalInvoice) => (
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
      <Topbar title="Transfers" subtitle="View and manage warehouse transfers" />

      <div className="p-6">
        <BreadCrumb
          items={[
            { label: 'Invoices', href: '/invoices' },
            { label: 'Transfers' },
          ]}
        />

        {showDemoData && <DemoModeBanner resource="warehouse transfers" />}

        {showError ? (
          <ErrorState
            title="Could not load transfers"
            message="Authenticated users are not shown demo transfers when the API fails."
            onRetry={() => void refetch()}
          />
        ) : (
          <Card>
            <div className="mb-4 max-w-md">
              <Input
                id="invoice-search"
                label="Search"
                placeholder="Search by transfer ID"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <Table
              columns={columns}
              data={filteredInvoices}
              keyExtractor={(inv) => inv.id}
              isLoading={!showDemoData && isLoading}
              emptyMessage="No transfer invoices found"
            />
          </Card>
        )}
      </div>
    </>
  );
}
