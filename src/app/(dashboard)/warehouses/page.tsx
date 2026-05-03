'use client';

import { useState, useMemo } from 'react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import DemoModeBanner from '@/components/ui/DemoModeBanner';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { Warehouse } from '@/types/warehouse.types';
import { formatDate } from '@/lib/formatters';
import { Edit, Trash2, Eye } from 'lucide-react';

const fallbackWarehouses: Warehouse[] = [
  {
    id: 1,
    address: 'Main Warehouse, 123 Industrial Way',
    isCentral: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    address: 'Tech Store, 456 Market Street',
    isCentral: false,
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 3,
    address: 'Electronics Hub, 789 Supply Ave',
    isCentral: false,
    createdAt: '2024-03-01T00:00:00Z',
  },
];

export default function WarehousesPage() {
  const { isGuest } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);

  const { data, isLoading, error, refetch } = useWarehouses(
    { page: 0, size: 100, search: debouncedSearch || undefined },
    { enabled: !isGuest }
  );

  const showDemoData = isGuest;
  const showError = !showDemoData && !!error;
  const backendWarehouses = data?.content ?? [];
  const baseWarehouses = showDemoData ? fallbackWarehouses : backendWarehouses;

  const filteredWarehouses = useMemo(() => {
    if (!debouncedSearch) return baseWarehouses;
    const query = debouncedSearch.toLowerCase();
    return baseWarehouses.filter((w) =>
      w.address.toLowerCase().includes(query)
    );
  }, [baseWarehouses, debouncedSearch]);

  const columns = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-16',
      render: (w: Warehouse) => (
        <span className="text-gray-400 font-mono text-xs">#{w.id}</span>
      ),
    },
    {
      key: 'address',
      label: 'Address',
      render: (w: Warehouse) => (
        <span className="font-medium text-gray-900">{w.address}</span>
      ),
    },
    {
      key: 'isCentral',
      label: 'Type',
      render: (w: Warehouse) => (
        <Badge variant={w.isCentral ? 'success' : 'info'}>
          {w.isCentral ? 'Central' : 'Branch'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (w: Warehouse) => (
        <span className="text-gray-600 text-sm">{formatDate(w.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-24',
      render: (w: Warehouse) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Topbar title="Warehouses" subtitle="Manage warehouse locations" />

      <div className="p-6">
        <BreadCrumb items={[{ label: 'Warehouses' }]} />

        {showDemoData && <DemoModeBanner resource="warehouses" />}

        {showError ? (
          <ErrorState
            title="Could not load warehouses"
            message="Authenticated users are not shown demo warehouses when the API fails."
            onRetry={() => void refetch()}
          />
        ) : (
          <Card>
            <div className="mb-4 max-w-md">
              <Input
                id="warehouse-search"
                label="Search"
                placeholder="Search warehouses"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <Table
              columns={columns}
              data={filteredWarehouses}
              keyExtractor={(w) => w.id}
              isLoading={!showDemoData && isLoading}
              emptyMessage="No warehouses found"
            />
          </Card>
        )}
      </div>
    </>
  );
}
