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
    sku: 'SKU-WM-001',
    barcode: '100000000001',
    description: 'Ergonomic wireless mouse with adjustable DPI.',
    photo: '',
    currentPrice: 29.99,
    costPrice: 18,
    openingStock: 40,
    reorderLevel: 10,
    unitOfMeasure: 'pcs',
    status: 'ACTIVE',
    isSerialTracked: false,
    isBatchTracked: false,
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
    sku: 'SKU-USB-C-1M',
    barcode: '100000000002',
    description: 'Durable 1m USB-C to USB-C cable.',
    photo: '',
    currentPrice: 9.5,
    costPrice: 3.2,
    openingStock: 25,
    reorderLevel: 15,
    unitOfMeasure: 'pcs',
    status: 'ACTIVE',
    isSerialTracked: false,
    isBatchTracked: true,
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
    sku: 'SKU-SCAN-USB',
    barcode: '100000000003',
    description: 'Handheld barcode scanner with USB connection.',
    photo: '',
    currentPrice: 119.0,
    costPrice: 78,
    openingStock: 8,
    reorderLevel: 4,
    unitOfMeasure: 'pcs',
    status: 'ACTIVE',
    isSerialTracked: true,
    isBatchTracked: false,
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
      const categoryName = product.category?.name?.toLowerCase() ?? '';
      return (
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        (product.barcode?.toLowerCase().includes(query) ?? false) ||
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
