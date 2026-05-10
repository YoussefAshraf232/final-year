'use client';

import { useMemo, useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import DemoModeBanner from '@/components/ui/DemoModeBanner';
import ErrorState from '@/components/ui/ErrorState';
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
    pictureUrl: '',
    currentPrice: 29.99,
    categories: [{ id: 1, name: 'Accessories' }],
    supplier: {
      id: 1,
      name: 'Tech Supplies Inc',
      address: '123 Industrial Way',
      phone: '000-000-0000',
    },
  },
  {
    id: 2,
    name: 'USB-C Cable',
    description: 'Durable 1m USB-C to USB-C cable.',
    pictureUrl: '',
    currentPrice: 9.5,
    categories: [{ id: 1, name: 'Accessories' }],
    supplier: {
      id: 2,
      name: 'Cable World',
      address: '456 Market Street',
      phone: '000-000-0000',
    },
  },
  {
    id: 3,
    name: 'Barcode Scanner',
    description: 'Handheld barcode scanner with USB connection.',
    pictureUrl: '',
    currentPrice: 119.0,
    categories: [{ id: 2, name: 'Devices' }],
    supplier: {
      id: 3,
      name: 'Retail Gear',
      address: '789 Supply Ave',
      phone: '000-000-0000',
    },
  },
];

export default function ProductsPage() {
  const { isGuest } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);

  const { data, isLoading, error, refetch } = useProducts(
    { page: 0, size: 50, search: debouncedSearch || undefined },
    { enabled: !isGuest }
  );

  const showDemoData = isGuest;
  const showError = !showDemoData && !!error;
  const backendProducts = data?.content ?? [];
  const baseProducts = showDemoData ? fallbackProducts : backendProducts;

  const filteredProducts = useMemo(() => {
    if (!debouncedSearch) return baseProducts;
    const query = debouncedSearch.toLowerCase();
    return baseProducts.filter((product) => {
      const categoryName = product.categories?.map((category) => category.name.toLowerCase()).join(' ') ?? '';
      return (
        product.name.toLowerCase().includes(query) ||
        (product.description?.toLowerCase().includes(query) ?? false) ||
        categoryName.includes(query)
      );
    });
  }, [baseProducts, debouncedSearch]);

  return (
    <>
      <Topbar title="Products" subtitle="Manage your inventory items" />

      <div className="p-6">
        <BreadCrumb items={[{ label: 'Products' }]} />

        {showDemoData && <DemoModeBanner resource="products" />}

        {showError ? (
          <ErrorState
            title="Could not load products"
            message="Authenticated users are not shown demo products when the API fails."
            onRetry={() => void refetch()}
          />
        ) : (
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
        )}
      </div>
    </>
  );
}
