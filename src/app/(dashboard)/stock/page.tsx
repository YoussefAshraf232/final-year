'use client';

import { useMemo, useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import DemoModeBanner from '@/components/ui/DemoModeBanner';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import Pagination from '@/components/ui/Pagination';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { useWarehouseStock } from '@/hooks/useStock';
import { WarehouseStock } from '@/types/inventory.types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { downloadCsv } from '@/lib/exportCsv';
import { Download } from 'lucide-react';

const demoStock: WarehouseStock[] = [
  {
    productId: 1,
    productName: 'Wireless Mouse',
    sku: 'SKU-WM-001',
    warehouseId: 1,
    warehouseName: 'Main Warehouse',
    quantityOnHand: 32,
    reservedQuantity: 6,
    availableQuantity: 26,
    averageCost: 18,
    totalValue: 576,
    reorderLevel: 10,
    reorderQuantity: 40,
    preferredSupplierName: 'Tech Supplies Inc',
    lastMovementAt: '2026-04-22T09:30:00Z',
    updatedAt: '2026-04-22T09:30:00Z',
  },
  {
    productId: 2,
    productName: 'USB-C Cable',
    sku: 'SKU-USB-C-1M',
    warehouseId: 2,
    warehouseName: 'Tech Store',
    quantityOnHand: 4,
    reservedQuantity: 1,
    availableQuantity: 3,
    averageCost: 3.2,
    totalValue: 12.8,
    reorderLevel: 15,
    reorderQuantity: 50,
    preferredSupplierName: 'Cable World',
    lastMovementAt: '2026-04-24T11:10:00Z',
    updatedAt: '2026-04-24T11:10:00Z',
  },
];

export default function StockOnHandPage() {
  const { isGuest } = useAuth();
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const debouncedSearch = useDebounce(search.trim(), 300);
  const { page, setPage, resetPage, paginationParams } = usePagination({
    initialSize: 20,
  });

  const { data, isLoading, error, refetch } = useWarehouseStock(
    {
      ...paginationParams,
      search: debouncedSearch || undefined,
      lowStockOnly,
    },
    { enabled: !isGuest }
  );

  const showDemoData = isGuest;
  const showError = !showDemoData && !!error;
  const rows = useMemo(
    () => (showDemoData ? demoStock : data?.content ?? []),
    [data?.content, showDemoData]
  );

  const filteredRows = useMemo(() => {
    if (!showDemoData || !debouncedSearch) return rows;
    const query = debouncedSearch.toLowerCase();
    return rows.filter(
      (row) =>
        row.productName.toLowerCase().includes(query) ||
        row.sku.toLowerCase().includes(query) ||
        row.warehouseName.toLowerCase().includes(query)
    );
  }, [debouncedSearch, rows, showDemoData]);

  const visibleRows = showDemoData && lowStockOnly
    ? filteredRows.filter((row) => row.availableQuantity <= row.reorderLevel)
    : filteredRows;

  const columns = [
    {
      key: 'productName',
      label: 'Product',
      render: (row: WarehouseStock) => (
        <div>
          <p className="font-medium text-gray-900">{row.productName}</p>
          <p className="text-xs text-gray-400">{row.sku}</p>
        </div>
      ),
    },
    {
      key: 'warehouseName',
      label: 'Warehouse',
      render: (row: WarehouseStock) => (
        <span className="text-gray-600">{row.warehouseName}</span>
      ),
    },
    {
      key: 'quantityOnHand',
      label: 'On Hand',
      render: (row: WarehouseStock) => (
        <span className="font-semibold text-gray-900">{row.quantityOnHand}</span>
      ),
    },
    {
      key: 'availableQuantity',
      label: 'Available',
      render: (row: WarehouseStock) => (
        <span className="font-semibold text-gray-900">{row.availableQuantity}</span>
      ),
    },
    {
      key: 'reservedQuantity',
      label: 'Reserved',
      render: (row: WarehouseStock) => (
        <span className="text-gray-600">{row.reservedQuantity}</span>
      ),
    },
    {
      key: 'reorderLevel',
      label: 'Status',
      render: (row: WarehouseStock) => (
        <Badge variant={row.availableQuantity <= row.reorderLevel ? 'warning' : 'success'}>
          {row.availableQuantity <= row.reorderLevel ? 'Low stock' : 'OK'}
        </Badge>
      ),
    },
    {
      key: 'totalValue',
      label: 'Value',
      render: (row: WarehouseStock) => (
        <span className="font-semibold">{formatCurrency(row.totalValue)}</span>
      ),
    },
    {
      key: 'lastMovementAt',
      label: 'Last Movement',
      render: (row: WarehouseStock) => (
        <span className="text-sm text-gray-600">
          {row.lastMovementAt ? formatDate(row.lastMovementAt) : 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <>
      <Topbar
        title="Stock On Hand"
        subtitle="Warehouse-level quantity, availability, reorder status, and valuation"
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              downloadCsv(
                'stock-on-hand.csv',
                [
                  { label: 'Product', value: (row) => row.productName },
                  { label: 'SKU', value: (row) => row.sku },
                  { label: 'Warehouse', value: (row) => row.warehouseName },
                  { label: 'On Hand', value: (row) => row.quantityOnHand },
                  { label: 'Reserved', value: (row) => row.reservedQuantity },
                  { label: 'Available', value: (row) => row.availableQuantity },
                  { label: 'Average Cost', value: (row) => row.averageCost },
                  { label: 'Total Value', value: (row) => row.totalValue },
                ],
                visibleRows
              )
            }
            disabled={visibleRows.length === 0}
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
        }
      />

      <div className="p-6">
        <BreadCrumb items={[{ label: 'Stock On Hand' }]} />
        {showDemoData && <DemoModeBanner resource="stock records" />}

        {showError ? (
          <ErrorState
            title="Could not load stock"
            message="Stock on hand requires the backend /stock endpoint. No demo stock is shown to authenticated users."
            onRetry={() => void refetch()}
          />
        ) : (
          <Card>
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end">
              <div className="md:w-80">
                <Input
                  id="stock-search"
                  label="Search"
                  placeholder="Product, SKU, or warehouse"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    resetPage();
                  }}
                />
              </div>
              <label className="flex items-center gap-2 pb-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={lowStockOnly}
                  onChange={(event) => {
                    setLowStockOnly(event.target.checked);
                    resetPage();
                  }}
                />
                Low stock only
              </label>
            </div>

            <Table
              columns={columns}
              data={visibleRows}
              keyExtractor={(row) => `${row.productId}-${row.warehouseId}`}
              isLoading={!showDemoData && isLoading}
              emptyMessage="No stock records found"
            />

            {!showDemoData && data && (
              <Pagination
                page={page}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                isFirst={data.first}
                isLast={data.last}
                onPageChange={setPage}
              />
            )}
          </Card>
        )}
      </div>
    </>
  );
}
