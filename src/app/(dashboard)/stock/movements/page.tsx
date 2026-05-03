'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import DemoModeBanner from '@/components/ui/DemoModeBanner';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { useStockMovements } from '@/hooks/useStock';
import { StockMovement, StockMovementType } from '@/types/inventory.types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { downloadCsv } from '@/lib/exportCsv';
import { Download, ExternalLink } from 'lucide-react';

const movementTypes: StockMovementType[] = [
  'OPENING_STOCK',
  'PURCHASE',
  'SALE',
  'CUSTOMER_RETURN',
  'SUPPLIER_RETURN',
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'ADJUSTMENT_IN',
  'ADJUSTMENT_OUT',
  'DAMAGE',
  'LOSS',
  'CORRECTION',
];

const movementTone = (type: StockMovementType) => {
  if (['PURCHASE', 'CUSTOMER_RETURN', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'OPENING_STOCK'].includes(type)) {
    return 'success' as const;
  }
  if (['DAMAGE', 'LOSS', 'ADJUSTMENT_OUT', 'SUPPLIER_RETURN'].includes(type)) {
    return 'danger' as const;
  }
  if (type.startsWith('TRANSFER')) return 'info' as const;
  return 'warning' as const;
};

const referenceHref = (movement: StockMovement) => {
  switch (movement.referenceType) {
    case 'SALES_INVOICE':
      return `/invoices/sales/${movement.referenceId}`;
    case 'PURCHASE_INVOICE':
      return `/invoices/purchases/${movement.referenceId}`;
    case 'RETURN_INVOICE':
      return `/invoices/returns/${movement.referenceId}`;
    case 'RETURN_PURCHASE_INVOICE':
      return `/invoices/purchase-returns/${movement.referenceId}`;
    case 'TRANSFER':
      return `/invoices/transfers/${movement.referenceId}`;
    default:
      return null;
  }
};

const demoMovements: StockMovement[] = [
  {
    id: 1,
    productId: 1,
    productName: 'Wireless Mouse',
    sku: 'SKU-WM-001',
    warehouseId: 1,
    warehouseName: 'Main Warehouse',
    movementType: 'PURCHASE',
    quantity: 40,
    unitCost: 18,
    totalValue: 720,
    referenceType: 'PURCHASE_INVOICE',
    referenceId: 201,
    note: 'Received from supplier',
    createdByUserId: 1,
    createdByUsername: 'admin',
    createdAt: '2026-04-22T09:30:00Z',
  },
  {
    id: 2,
    productId: 2,
    productName: 'USB-C Cable',
    sku: 'SKU-USB-C-1M',
    warehouseId: 2,
    warehouseName: 'Tech Store',
    movementType: 'SALE',
    quantity: -12,
    unitCost: 3.2,
    totalValue: -38.4,
    referenceType: 'SALES_INVOICE',
    referenceId: 101,
    note: 'Sold to customer',
    createdByUserId: 2,
    createdByUsername: 'manager1',
    createdAt: '2026-04-24T11:10:00Z',
  },
];

export default function StockMovementsPage() {
  const { isGuest } = useAuth();
  const [search, setSearch] = useState('');
  const [movementType, setMovementType] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);
  const { page, setPage, resetPage, paginationParams } = usePagination({
    initialSize: 20,
  });

  const { data, isLoading, error, refetch } = useStockMovements(
    {
      ...paginationParams,
      search: debouncedSearch || undefined,
      movementType: movementType ? (movementType as StockMovementType) : undefined,
      warehouseId: warehouseId ? Number(warehouseId) : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    { enabled: !isGuest }
  );

  const showDemoData = isGuest;
  const showError = !showDemoData && !!error;
  const rows = useMemo(
    () => (showDemoData ? demoMovements : data?.content ?? []),
    [data?.content, showDemoData]
  );

  const visibleRows = useMemo(() => {
    if (!showDemoData) return rows;

    const query = debouncedSearch.toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        !query ||
        row.productName.toLowerCase().includes(query) ||
        row.warehouseName.toLowerCase().includes(query) ||
        row.referenceId.toString().includes(query);
      const matchesType = !movementType || row.movementType === movementType;
      const matchesWarehouse = !warehouseId || row.warehouseId === Number(warehouseId);
      const movedAt = new Date(row.createdAt).getTime();
      const matchesFrom = !dateFrom || movedAt >= new Date(dateFrom).getTime();
      const matchesTo = !dateTo || movedAt <= new Date(dateTo).getTime();

      return matchesSearch && matchesType && matchesWarehouse && matchesFrom && matchesTo;
    });
  }, [dateFrom, dateTo, debouncedSearch, movementType, rows, showDemoData, warehouseId]);

  const columns = [
    {
      key: 'createdAt',
      label: 'Date',
      render: (row: StockMovement) => (
        <span className="text-sm text-gray-600">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'productName',
      label: 'Product',
      render: (row: StockMovement) => (
        <div>
          <p className="font-medium text-gray-900">{row.productName}</p>
          <p className="text-xs text-gray-400">{row.sku || 'No SKU'}</p>
        </div>
      ),
    },
    {
      key: 'warehouseName',
      label: 'Warehouse',
      render: (row: StockMovement) => (
        <span className="text-gray-600">{row.warehouseName}</span>
      ),
    },
    {
      key: 'movementType',
      label: 'Movement',
      render: (row: StockMovement) => (
        <Badge variant={movementTone(row.movementType)}>
          {row.movementType.replaceAll('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'quantity',
      label: 'Qty',
      render: (row: StockMovement) => (
        <span className={row.quantity < 0 ? 'font-semibold text-red-600' : 'font-semibold text-emerald-700'}>
          {row.quantity > 0 ? '+' : ''}{row.quantity}
        </span>
      ),
    },
    {
      key: 'totalValue',
      label: 'Value',
      render: (row: StockMovement) => (
        <span className="font-semibold">{formatCurrency(row.totalValue)}</span>
      ),
    },
    {
      key: 'referenceId',
      label: 'Reference',
      render: (row: StockMovement) => {
        const href = referenceHref(row);
        const label = `${row.referenceType.replaceAll('_', ' ')} #${row.referenceId}`;

        return href ? (
          <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
            {label}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span className="text-sm text-gray-600">{label}</span>
        );
      },
    },
    {
      key: 'createdByUsername',
      label: 'User',
      render: (row: StockMovement) => (
        <span className="text-sm text-gray-600">{row.createdByUsername}</span>
      ),
    },
  ];

  return (
    <>
      <Topbar
        title="Stock Movements"
        subtitle="Trace every stock-changing transaction by product, warehouse, reference, and user"
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              downloadCsv(
                'stock-movements.csv',
                [
                  { label: 'Date', value: (row) => row.createdAt },
                  { label: 'Product', value: (row) => row.productName },
                  { label: 'SKU', value: (row) => row.sku },
                  { label: 'Warehouse', value: (row) => row.warehouseName },
                  { label: 'Movement', value: (row) => row.movementType },
                  { label: 'Quantity', value: (row) => row.quantity },
                  { label: 'Unit Cost', value: (row) => row.unitCost },
                  { label: 'Total Value', value: (row) => row.totalValue },
                  { label: 'Reference Type', value: (row) => row.referenceType },
                  { label: 'Reference ID', value: (row) => row.referenceId },
                  { label: 'User', value: (row) => row.createdByUsername },
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
        <BreadCrumb items={[{ label: 'Stock' }, { label: 'Movements' }]} />
        {showDemoData && <DemoModeBanner resource="stock movements" />}

        {showError ? (
          <ErrorState
            title="Could not load stock movements"
            message="Stock movement history requires the backend /stock/movements endpoint. No demo movements are shown to authenticated users."
            onRetry={() => void refetch()}
          />
        ) : (
          <Card>
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <Input
                id="movement-search"
                label="Search"
                placeholder="Product, warehouse, reference"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetPage();
                }}
              />
              <Select
                id="movement-type"
                label="Movement Type"
                placeholder="All movements"
                value={movementType}
                options={movementTypes.map((type) => ({
                  value: type,
                  label: type.replaceAll('_', ' '),
                }))}
                onChange={(event) => {
                  setMovementType(event.target.value);
                  resetPage();
                }}
              />
              <Input
                id="warehouse-id"
                label="Warehouse ID"
                placeholder="Any"
                type="number"
                min="1"
                value={warehouseId}
                onChange={(event) => {
                  setWarehouseId(event.target.value);
                  resetPage();
                }}
              />
              <Input
                id="date-from"
                label="From"
                type="date"
                value={dateFrom}
                onChange={(event) => {
                  setDateFrom(event.target.value);
                  resetPage();
                }}
              />
              <Input
                id="date-to"
                label="To"
                type="date"
                value={dateTo}
                onChange={(event) => {
                  setDateTo(event.target.value);
                  resetPage();
                }}
              />
            </div>

            <Table
              columns={columns}
              data={visibleRows}
              keyExtractor={(row) => row.id}
              isLoading={!showDemoData && isLoading}
              emptyMessage="No stock movements found"
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
