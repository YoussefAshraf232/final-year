'use client';

import { useState, useMemo } from 'react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import SupplierTable from '@/components/suppliers/SupplierTable';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { Supplier } from '@/types/supplier.types';

const fallbackSuppliers: Supplier[] = [
  {
    id: 1,
    name: 'Tech Supplies Inc',
    address: '123 Industrial Way',
    phoneNumber: '(555) 123-4567',
  },
  {
    id: 2,
    name: 'Cable World',
    address: '456 Market Street',
    phoneNumber: '(555) 234-5678',
  },
  {
    id: 3,
    name: 'Retail Gear',
    address: '789 Supply Ave',
    phoneNumber: '(555) 345-6789',
  },
];

export default function SuppliersPage() {
  const { isGuest } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);

  const { data, isLoading, error } = useSuppliers(
    { page: 0, size: 100, search: debouncedSearch || undefined },
    { enabled: !isGuest }
  );

  const showDemoData = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || isGuest;
  const backendSuppliers = data?.content ?? [];
  const baseSuppliers = showDemoData ? fallbackSuppliers : backendSuppliers;

  const filteredSuppliers = useMemo(() => {
    if (!debouncedSearch) return baseSuppliers;
    const query = debouncedSearch.toLowerCase();
    return baseSuppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.address.toLowerCase().includes(query)
    );
  }, [baseSuppliers, debouncedSearch]);

  return (
    <>
      <Topbar title="Suppliers" subtitle="Manage supplier relationships" />

      <div className="p-6">
        <BreadCrumb items={[{ label: 'Suppliers' }]} />

        {showDemoData && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Showing demo suppliers because demo mode is enabled.
          </div>
        )}

        <Card>
          <div className="mb-4 max-w-md">
            <Input
              id="supplier-search"
              label="Search"
              placeholder="Search suppliers"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <SupplierTable
            suppliers={filteredSuppliers}
            isLoading={!showDemoData && isLoading}
          />
        </Card>
      </div>
    </>
  );
}
