'use client';

import { useState, useMemo } from 'react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { Category } from '@/types/category.types';
import { Edit, Trash2 } from 'lucide-react';

const fallbackCategories: Category[] = [
  { id: 1, name: 'Accessories' },
  { id: 2, name: 'Devices' },
  { id: 3, name: 'Software' },
  { id: 4, name: 'Components' },
];

export default function CategoriesPage() {
  const { isGuest } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);

  const { data, isLoading, error } = useCategories(
    { page: 0, size: 100, search: debouncedSearch || undefined },
    { enabled: !isGuest }
  );

  const showDemoData = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || isGuest;
  const backendCategories = data?.content ?? [];
  const baseCategories = showDemoData ? fallbackCategories : backendCategories;

  const filteredCategories = useMemo(() => {
    if (!debouncedSearch) return baseCategories;
    const query = debouncedSearch.toLowerCase();
    return baseCategories.filter((cat) =>
      cat.name.toLowerCase().includes(query)
    );
  }, [baseCategories, debouncedSearch]);

  const columns = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-16',
      render: (cat: Category) => (
        <span className="text-gray-400 font-mono text-xs">#{cat.id}</span>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (cat: Category) => (
        <span className="font-medium text-gray-900">{cat.name}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-24',
      render: (cat: Category) => (
        <div className="flex items-center gap-1">
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
      <Topbar title="Categories" subtitle="Manage product categories" />

      <div className="p-6">
        <BreadCrumb items={[{ label: 'Categories' }]} />

        {showDemoData && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Showing demo categories because demo mode is enabled.
          </div>
        )}

        <Card>
          <div className="mb-4 max-w-md">
            <Input
              id="category-search"
              label="Search"
              placeholder="Search categories"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <Table
            columns={columns}
            data={filteredCategories}
            keyExtractor={(cat) => cat.id}
            isLoading={!showDemoData && isLoading}
            emptyMessage="No categories found"
          />
        </Card>
      </div>
    </>
  );
}
