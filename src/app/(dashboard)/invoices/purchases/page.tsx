'use client';

import { useState, useMemo } from 'react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import DemoModeBanner from '@/components/ui/DemoModeBanner';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import { usePurchaseInvoices } from '@/hooks/usePurchaseInvoices';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { PurchaseInvoice } from '@/types/purchase-invoice.types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Eye } from 'lucide-react';

const fallbackInvoices: PurchaseInvoice[] = [
  {
    id: 201,
    supplierId: 1,
    userId: 1,
    warehouseId: 1,
    createdAt: '2024-01-14T14:20:00Z',
    totalPrice: 1500.0,
    supplier: {
      id: 1,
      name: 'Tech Supplies Inc',
      address: '123 Industrial Way',
      phone: '(555)123-4567',
    },
  },
  {
    id: 202,
    supplierId: 2,
    userId: 1,
    warehouseId: 1,
    createdAt: '2024-01-13T09:15:00Z',
    totalPrice: 750.5,
    supplier: {
      id: 2,
      name: 'Cable World',
      address: '456 Market Street',
      phone: '(555)234-5678',
    },
  },
];

export default function PurchaseInvoicesPage() {
  const { isGuest } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);

  const { data, isLoading, error, refetch } = usePurchaseInvoices(
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
      label: 'Invoice ID',
      render: (inv: PurchaseInvoice) => (
        <span className="font-semibold text-gray-900">#{inv.id}</span>
      ),
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (inv: PurchaseInvoice) => (
        <span className="text-gray-600">{inv.supplier?.name || 'N/A'}</span>
      ),
    },
    {
      key: 'totalPrice',
      label: 'Amount',
      render: (inv: PurchaseInvoice) => (
        <span className="font-semibold">{formatCurrency(inv.totalPrice)}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (inv: PurchaseInvoice) => (
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
      <Topbar title="Purchase Invoices" subtitle="View and manage purchase orders" />

      <div className="p-6">
        <BreadCrumb
          items={[
            { label: 'Invoices', href: '/invoices' },
            { label: 'Purchases' },
          ]}
        />

        {showDemoData && <DemoModeBanner resource="purchase invoices" />}

        {showError ? (
          <ErrorState
            title="Could not load purchase invoices"
            message="Authenticated users are not shown demo invoices when the API fails."
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
              emptyMessage="No purchase invoices found"
            />
          </Card>
        )}
      </div>
    </>
  );
}
