'use client';

import { useState, useMemo } from 'react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import DemoModeBanner from '@/components/ui/DemoModeBanner';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import CustomerTable from '@/components/customers/CustomerTable';
import { useCustomers } from '@/hooks/useCustomers';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { Customer } from '@/types/customer.types';

const fallbackCustomers: Customer[] = [
  { id: 1, name: 'John Doe', address: '123 Main St' },
  { id: 2, name: 'Jane Smith', address: '456 Oak Ave' },
  { id: 3, name: 'ABC Corp', address: '789 Business Blvd' },
];

export default function CustomersPage() {
  const { isGuest } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);

  const { data, isLoading, error, refetch } = useCustomers(
    { page: 0, size: 100, search: debouncedSearch || undefined },
    { enabled: !isGuest }
  );

  const showDemoData = isGuest;
  const showError = !showDemoData && !!error;
  const backendCustomers = data?.content ?? [];
  const baseCustomers = showDemoData ? fallbackCustomers : backendCustomers;

  const filteredCustomers = useMemo(() => {
    if (!debouncedSearch) return baseCustomers;
    const query = debouncedSearch.toLowerCase();
    return baseCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.address.toLowerCase().includes(query)
    );
  }, [baseCustomers, debouncedSearch]);

  return (
    <>
      <Topbar title="Customers" subtitle="Manage customer accounts" />

      <div className="p-6">
        <BreadCrumb items={[{ label: 'Customers' }]} />

        {showDemoData && <DemoModeBanner resource="customers" />}

        {showError ? (
          <ErrorState
            title="Could not load customers"
            message="Authenticated users are not shown demo customers when the API fails."
            onRetry={() => void refetch()}
          />
        ) : (
          <Card>
            <div className="mb-4 max-w-md">
              <Input
                id="customer-search"
                label="Search"
                placeholder="Search customers"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <CustomerTable
              customers={filteredCustomers}
              isLoading={!showDemoData && isLoading}
            />
          </Card>
        )}
      </div>
    </>
  );
}
