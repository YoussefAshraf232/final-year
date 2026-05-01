'use client';

import { useMemo, useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import ProductTable from '@/components/products/ProductTable';
import { useProducts } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/types/product.types';

const fallbackProducts: Product[] = [
  {
    id: 1,
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with adjustable DPI.',
    photo: '',
    currentPrice: 29.99,
    categoryId: 1,
    supplierId: 1,
    userId: 1,
    category: { id: 1, name: 'Accessories' },
    supplier: {
      id: 1,
      name: 'Tech Supplies Inc',
      address: '123 Industrial Way',
      phoneNumber: '000-000-0000',
    },
  },
  {
    id: 2,
    name: 'USB-C Cable',
    description: 'Durable 1m USB-C to USB-C cable.',
    photo: '',
    currentPrice: 9.5,
    categoryId: 1,
    supplierId: 2,
    userId: 1,
    category: { id: 1, name: 'Accessories' },
    supplier: {
      id: 2,
      name: 'Cable World',
      address: '456 Market Street',
      phoneNumber: '000-000-0000',
    },
  },
  {
    id: 3,
    name: 'Barcode Scanner',
    description: 'Handheld barcode scanner with USB connection.',
    photo: '',
    currentPrice: 119.0,
    categoryId: 2,
    supplierId: 3,
    userId: 1,
    category: { id: 2, name: 'Devices' },
    supplier: {
      id: 3,
      name: 'Retail Gear',
      address: '789 Supply Ave',
      phoneNumber: '000-000-0000',
    },
  },
];

export default function ProductsPage() {
  const { isGuest } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);

  const { data, isLoading, error } = useProducts(
    { page: 0, size: 50, search: debouncedSearch || undefined },
    { enabled: !isGuest }
  );

  const showDemoData = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || isGuest;
  const backendProducts = data?.content ?? [];
  const baseProducts = showDemoData ? fallbackProducts : backendProducts;

  const filteredProducts = useMemo(() => {
    if (!debouncedSearch) return baseProducts;
    const query = debouncedSearch.toLowerCase();
    return baseProducts.filter((product) => {
      const categoryName = product.category?.name?.toLowerCase() ?? '';
      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        categoryName.includes(query)
      );
    });
  }, [baseProducts, debouncedSearch]);

  return (
    <>
      <Topbar title="Products" subtitle="Manage your inventory items" />

      <div className="p-6">
        <BreadCrumb items={[{ label: 'Products' }]} />

        {showDemoData && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Showing demo products because demo mode is enabled.
          </div>
        )}

        <Card>
          <div className="mb-4 max-w-md">
            <Input
              id="product-search"
              label="Search"
              placeholder="Search products"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <ProductTable
            products={filteredProducts}
            isLoading={!showDemoData && isLoading}
          />
        </Card>
      </div>
    </>
  );
}
