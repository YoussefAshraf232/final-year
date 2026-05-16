'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { useStockSummary, useWarehouseStock } from '@/hooks/useStock';
import { useWarehouses } from '@/hooks/useWarehouses';
import { WarehouseStock, StockStatus } from '@/types/inventory.types';
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/formatters';
import { downloadCsv } from '@/lib/exportCsv';
import { ROUTES } from '@/constants/routes';
import { AlertTriangle, Boxes, Download, FilePenLine, OctagonX, Warehouse } from 'lucide-react';

const statusLabel: Record<StockStatus, string> = {
  OK: 'OK',
  LOW_STOCK: 'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
};

const statusVariant: Record<StockStatus, 'success' | 'warning' | 'danger'> = {
  OK: 'success',
  LOW_STOCK: 'warning',
  OUT_OF_STOCK: 'danger',
};

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function rowStatus(row: WarehouseStock): StockStatus {
  if (row.status) return row.status;
  const available = numberValue(row.availableQuantity, numberValue(row.quantityOnHand, row.amount));
  const reorderLevel = numberValue(row.reorderLevel, 10);
  if (available <= 0) return 'OUT_OF_STOCK';
  if (available <= reorderLevel) return 'LOW_STOCK';
  return 'OK';
}

function stockValue(row: WarehouseStock) {
  const totalValue = Number(row.totalValue);
  if (Number.isFinite(totalValue)) return totalValue;
  const available = numberValue(row.availableQuantity, numberValue(row.quantityOnHand, row.amount));
  const unitValue = numberValue(row.unitValue ?? row.averageCost, 0);
  return available * unitValue;
}

export default function StockPage() {
  const router = useRouter();
  const {
    isGuest,
    isLoading: isAuthLoading,
    isWarehouseManager,
    assignedWarehouse,
    assignedWarehouseId,
  } = useAuth();
  const [search, setSearch] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [status, setStatus] = useState<StockStatus | ''>('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const debouncedSearch = useDebounce(search.trim(), 300);
  const { page, setPage, resetPage, paginationParams } = usePagination({ initialSize: 8 });

  const filters = {
    ...paginationParams,
    search: debouncedSearch || undefined,
    warehouseId: isWarehouseManager ? assignedWarehouseId ?? undefined : warehouseId ? Number(warehouseId) : undefined,
    status: status || undefined,
    lowStockOnly,
  };

  const hasAssignedWarehouse = !isWarehouseManager || !!assignedWarehouseId;
  const canLoadStock = !isGuest && !isAuthLoading && hasAssignedWarehouse;
  const { data, isLoading, error, refetch } = useWarehouseStock(filters, { enabled: canLoadStock });
  const { data: summary } = useStockSummary({ enabled: canLoadStock });
  const { data: warehouses } = useWarehouses({ page: 0, size: 100 }, { enabled: !isGuest && !isWarehouseManager });
  const rows = data?.content ?? [];
  const isFiltered = !!debouncedSearch || !!warehouseId || !!status || lowStockOnly;

  const columns = [
    { key: 'productName', label: 'Product', render: (row: WarehouseStock) => <span className="font-medium text-gray-900">{row.productName}</span> },
    { key: 'sku', label: 'SKU', render: (row: WarehouseStock) => row.sku || `SKU-${row.productId}` },
    { key: 'warehouseName', label: 'Warehouse', render: (row: WarehouseStock) => row.warehouseName },
    { key: 'quantityOnHand', label: 'On Hand', render: (row: WarehouseStock) => formatNumber(numberValue(row.quantityOnHand, row.amount)) },
    { key: 'reservedQuantity', label: 'Reserved', render: (row: WarehouseStock) => formatNumber(numberValue(row.reservedQuantity, 0)) },
    { key: 'availableQuantity', label: 'Available', render: (row: WarehouseStock) => formatNumber(numberValue(row.availableQuantity, numberValue(row.quantityOnHand, row.amount))) },
    { key: 'reorderLevel', label: 'Reorder Level', render: (row: WarehouseStock) => formatNumber(numberValue(row.reorderLevel, 10)) },
    {
      key: 'status',
      label: 'Status',
      render: (row: WarehouseStock) => {
        const currentStatus = rowStatus(row);
        return <Badge variant={statusVariant[currentStatus]}>{statusLabel[currentStatus]}</Badge>;
      },
    },
    { key: 'totalValue', label: 'Value', render: (row: WarehouseStock) => <span className="font-semibold text-gray-900">{formatCurrency(stockValue(row))}</span> },
    { key: 'lastMovementAt', label: 'Last Movement', render: (row: WarehouseStock) => row.lastMovementAt ? formatDateTime(row.lastMovementAt) : 'N/A' },
    {
      key: 'actions',
      label: 'Actions',
      className: 'w-32',
      render: (row: WarehouseStock) => (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title="Request stock edit"
            onClick={() => router.push(`${ROUTES.STOCK_REQUEST_EDIT}?productId=${row.productId}&warehouseId=${row.warehouseId}`)}
          >
            <FilePenLine className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const exportRows = rows.map((row) => ({
    ...row,
    status: statusLabel[rowStatus(row)],
    totalValue: stockValue(row),
  }));
  const csvColumns = [
    { label: 'Product', value: (row: typeof exportRows[number]) => row.productName },
    { label: 'SKU', value: (row: typeof exportRows[number]) => row.sku },
    { label: 'Warehouse', value: (row: typeof exportRows[number]) => row.warehouseName },
    { label: 'On Hand', value: (row: typeof exportRows[number]) => row.quantityOnHand },
    { label: 'Reserved', value: (row: typeof exportRows[number]) => row.reservedQuantity },
    { label: 'Available', value: (row: typeof exportRows[number]) => row.availableQuantity },
    { label: 'Reorder Level', value: (row: typeof exportRows[number]) => row.reorderLevel },
    { label: 'Status', value: (row: typeof exportRows[number]) => row.status },
    { label: 'Value', value: (row: typeof exportRows[number]) => row.totalValue },
    { label: 'Last Movement', value: (row: typeof exportRows[number]) => row.lastMovementAt },
  ];

  return (
    <>
      <Topbar
        title="Stock"
        subtitle="Warehouse-level quantity, availability, reorder status, and valuation"
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              downloadCsv('stock.csv', csvColumns, exportRows)
            }
            disabled={rows.length === 0}
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
        }
      />
      <div className="bg-slate-50 p-6">
        <BreadCrumb items={[{ label: 'Stock' }]} />
        {isWarehouseManager && !assignedWarehouseId ? (
          <ErrorState
            title="No warehouse assigned"
            message="No warehouse assigned to this account. Please contact a system administrator."
          />
        ) : error ? (
          <ErrorState
            title="Could not load warehouse stock"
            message="Could not load warehouse stock. Check that the backend is running and your session is valid."
            onRetry={() => void refetch()}
          />
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard icon={<Boxes className="h-5 w-5" />} label="Total SKUs" value={summary?.totalSkus ?? 0} tone="indigo" />
              <KpiCard icon={<Warehouse className="h-5 w-5" />} label="Total Warehouses" value={summary?.totalWarehouses ?? 0} tone="emerald" />
              <KpiCard icon={<AlertTriangle className="h-5 w-5" />} label="Low Stock Items" value={summary?.lowStockItems ?? 0} tone="amber" />
              <KpiCard icon={<OctagonX className="h-5 w-5" />} label="Out of Stock" value={summary?.outOfStockItems ?? 0} tone="red" />
            </div>

            <Card>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Stock</h2>
              </div>
              <div className="mb-5 grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_auto_auto] lg:items-end">
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
                {isWarehouseManager ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Warehouse</label>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      {assignedWarehouse?.address ?? 'Assigned warehouse'}
                    </div>
                  </div>
                ) : (
                  <Select
                    id="stock-warehouse"
                    label="Warehouse"
                    value={warehouseId}
                    placeholder="All Warehouses"
                    options={(warehouses?.content ?? []).map((warehouse) => ({
                      value: warehouse.id,
                      label: warehouse.address,
                    }))}
                    onChange={(event) => {
                      setWarehouseId(event.target.value);
                      resetPage();
                    }}
                  />
                )}
                <Select
                  id="stock-status"
                  label="Status"
                  value={status}
                  placeholder="All Statuses"
                  options={[
                    { value: 'OK', label: 'OK' },
                    { value: 'LOW_STOCK', label: 'Low Stock' },
                    { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
                  ]}
                  onChange={(event) => {
                    setStatus(event.target.value as StockStatus | '');
                    resetPage();
                  }}
                />
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
                <Button type="button" variant="outline" size="sm" onClick={() => downloadCsv('stock.csv', csvColumns, exportRows)} disabled={rows.length === 0}>
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
              </div>
              {isLoading && <p className="pb-3 text-sm text-gray-500">Loading stock...</p>}
              <Table
                columns={columns}
                data={rows}
                keyExtractor={(row) => `${row.productId}-${row.warehouseId}`}
                isLoading={isLoading}
                emptyMessage={isFiltered ? 'No records match the current filters.' : 'No stock records found.'}
              />
              {data && (
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
          </div>
        )}
      </div>
    </>
  );
}

function KpiCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'indigo' | 'emerald' | 'amber' | 'red';
}) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <Card className="border border-gray-200 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`rounded-2xl p-3 ${tones[tone]}`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatNumber(value)}</p>
        </div>
      </div>
    </Card>
  );
}
