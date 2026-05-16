'use client';

import { useMemo, useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import DemoModeBanner from '@/components/ui/DemoModeBanner';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useReportData } from '@/hooks/useReports';
import { ReportKey } from '@/types/report.types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { downloadCsv } from '@/lib/exportCsv';
import { Download } from 'lucide-react';

type ReportTableRow = Record<string, unknown> & { _rowId: number };

interface ReportColumn {
  key: string;
  label: string;
  render?: (row: ReportTableRow) => React.ReactNode;
  csvValue?: (row: ReportTableRow) => string | number | null | undefined;
}

const reportOptions: { key: ReportKey; title: string; description: string; endpoint: string }[] = [
  {
    key: 'stockOnHand',
    title: 'Stock On Hand',
    description: 'Product, SKU, warehouse, available quantity, average cost, and stock value.',
    endpoint: 'GET /reports/stock-on-hand',
  },
  {
    key: 'lowStock',
    title: 'Low Stock',
    description: 'Reorder exceptions by warehouse with supplier and suggested reorder quantity.',
    endpoint: 'GET /reports/low-stock',
  },
  {
    key: 'salesSummary',
    title: 'Sales Summary',
    description: 'Sales totals, invoice count, average order value, and top customers.',
    endpoint: 'GET /reports/sales-summary',
  },
  {
    key: 'purchaseSummary',
    title: 'Purchase Summary',
    description: 'Purchase totals, invoice count, and supplier breakdown.',
    endpoint: 'GET /reports/purchase-summary',
  },
  {
    key: 'returns',
    title: 'Returns',
    description: 'Customer and supplier returns by reason, value, damaged, and restocked quantity.',
    endpoint: 'GET /reports/returns',
  },
  {
    key: 'productPerformance',
    title: 'Product Performance',
    description: 'Units sold, revenue, gross profit, and slow-moving product signals.',
    endpoint: 'GET /reports/product-performance',
  },
  {
    key: 'warehouse',
    title: 'Warehouse',
    description: 'Warehouse stock value, transfers in/out, and low-stock exposure.',
    endpoint: 'GET /reports/warehouse',
  },
  {
    key: 'supplierPerformance',
    title: 'Supplier Performance',
    description: 'Purchase totals, return rate, and delivery performance when purchase orders exist.',
    endpoint: 'GET /reports/supplier-performance',
  },
  {
    key: 'customerPurchaseHistory',
    title: 'Customer History',
    description: 'Customer sales, returns, outstanding balance, and last purchase date.',
    endpoint: 'GET /reports/customer-purchase-history',
  },
];

const text = (row: ReportTableRow, key: string) => String(row[key] ?? 'N/A');
const numberValue = (row: ReportTableRow, key: string) => Number(row[key] ?? 0);
const dateText = (row: ReportTableRow, key: string) => {
  const value = row[key];
  return typeof value === 'string' && value ? formatDate(value) : 'N/A';
};

const reportColumns: Record<ReportKey, ReportColumn[]> = {
  stockOnHand: [
    { key: 'productName', label: 'Product', csvValue: (row) => text(row, 'productName') },
    { key: 'sku', label: 'SKU', csvValue: (row) => text(row, 'sku') },
    { key: 'warehouseName', label: 'Warehouse', csvValue: (row) => text(row, 'warehouseName') },
    { key: 'quantityOnHand', label: 'On Hand', csvValue: (row) => numberValue(row, 'quantityOnHand') },
    { key: 'availableQuantity', label: 'Available', csvValue: (row) => numberValue(row, 'availableQuantity') },
    { key: 'averageCost', label: 'Avg Cost', render: (row) => formatCurrency(numberValue(row, 'averageCost')), csvValue: (row) => numberValue(row, 'averageCost') },
    { key: 'totalValue', label: 'Value', render: (row) => formatCurrency(numberValue(row, 'totalValue')), csvValue: (row) => numberValue(row, 'totalValue') },
  ],
  lowStock: [
    { key: 'productName', label: 'Product', csvValue: (row) => text(row, 'productName') },
    { key: 'warehouseName', label: 'Warehouse', csvValue: (row) => text(row, 'warehouseName') },
    { key: 'availableQuantity', label: 'Available', csvValue: (row) => numberValue(row, 'availableQuantity') },
    { key: 'reorderLevel', label: 'Reorder Level', csvValue: (row) => numberValue(row, 'reorderLevel') },
    { key: 'preferredSupplierName', label: 'Supplier', csvValue: (row) => text(row, 'preferredSupplierName') },
    { key: 'suggestedReorderQuantity', label: 'Suggested Qty', render: (row) => <Badge variant="warning">{numberValue(row, 'suggestedReorderQuantity')}</Badge>, csvValue: (row) => numberValue(row, 'suggestedReorderQuantity') },
  ],
  salesSummary: [
    { key: 'period', label: 'Period', csvValue: (row) => text(row, 'period') },
    { key: 'totalSales', label: 'Sales', render: (row) => formatCurrency(numberValue(row, 'totalSales')), csvValue: (row) => numberValue(row, 'totalSales') },
    { key: 'invoiceCount', label: 'Invoices', csvValue: (row) => numberValue(row, 'invoiceCount') },
    { key: 'averageOrderValue', label: 'AOV', render: (row) => formatCurrency(numberValue(row, 'averageOrderValue')), csvValue: (row) => numberValue(row, 'averageOrderValue') },
    { key: 'topCustomerName', label: 'Top Customer', csvValue: (row) => text(row, 'topCustomerName') },
  ],
  purchaseSummary: [
    { key: 'period', label: 'Period', csvValue: (row) => text(row, 'period') },
    { key: 'totalPurchases', label: 'Purchases', render: (row) => formatCurrency(numberValue(row, 'totalPurchases')), csvValue: (row) => numberValue(row, 'totalPurchases') },
    { key: 'invoiceCount', label: 'Invoices', csvValue: (row) => numberValue(row, 'invoiceCount') },
    { key: 'supplierName', label: 'Supplier', csvValue: (row) => text(row, 'supplierName') },
  ],
  returns: [
    { key: 'period', label: 'Period', csvValue: (row) => text(row, 'period') },
    { key: 'customerReturns', label: 'Customer Returns', csvValue: (row) => numberValue(row, 'customerReturns') },
    { key: 'supplierReturns', label: 'Supplier Returns', csvValue: (row) => numberValue(row, 'supplierReturns') },
    { key: 'returnValue', label: 'Return Value', render: (row) => formatCurrency(numberValue(row, 'returnValue')), csvValue: (row) => numberValue(row, 'returnValue') },
    { key: 'reason', label: 'Top Reason', csvValue: (row) => text(row, 'reason') },
  ],
  productPerformance: [
    { key: 'productName', label: 'Product', csvValue: (row) => text(row, 'productName') },
    { key: 'sku', label: 'SKU', csvValue: (row) => text(row, 'sku') },
    { key: 'unitsSold', label: 'Units Sold', csvValue: (row) => numberValue(row, 'unitsSold') },
    { key: 'revenue', label: 'Revenue', render: (row) => formatCurrency(numberValue(row, 'revenue')), csvValue: (row) => numberValue(row, 'revenue') },
    { key: 'grossProfit', label: 'Gross Profit', render: (row) => formatCurrency(numberValue(row, 'grossProfit')), csvValue: (row) => numberValue(row, 'grossProfit') },
    { key: 'lastSoldAt', label: 'Last Sold', render: (row) => dateText(row, 'lastSoldAt'), csvValue: (row) => text(row, 'lastSoldAt') },
  ],
  warehouse: [
    { key: 'warehouseName', label: 'Warehouse', csvValue: (row) => text(row, 'warehouseName') },
    { key: 'stockValue', label: 'Stock Value', render: (row) => formatCurrency(numberValue(row, 'stockValue')), csvValue: (row) => numberValue(row, 'stockValue') },
    { key: 'transfersIn', label: 'Transfers In', csvValue: (row) => numberValue(row, 'transfersIn') },
    { key: 'transfersOut', label: 'Transfers Out', csvValue: (row) => numberValue(row, 'transfersOut') },
    { key: 'lowStockItems', label: 'Low Stock', render: (row) => <Badge variant={numberValue(row, 'lowStockItems') > 0 ? 'warning' : 'success'}>{numberValue(row, 'lowStockItems')}</Badge>, csvValue: (row) => numberValue(row, 'lowStockItems') },
  ],
  supplierPerformance: [
    { key: 'supplierName', label: 'Supplier', csvValue: (row) => text(row, 'supplierName') },
    { key: 'totalPurchases', label: 'Purchases', render: (row) => formatCurrency(numberValue(row, 'totalPurchases')), csvValue: (row) => numberValue(row, 'totalPurchases') },
    { key: 'returnRate', label: 'Return Rate', render: (row) => `${numberValue(row, 'returnRate')}%`, csvValue: (row) => numberValue(row, 'returnRate') },
    { key: 'onTimeDeliveryRate', label: 'On-Time', render: (row) => `${numberValue(row, 'onTimeDeliveryRate')}%`, csvValue: (row) => numberValue(row, 'onTimeDeliveryRate') },
  ],
  customerPurchaseHistory: [
    { key: 'customerName', label: 'Customer', csvValue: (row) => text(row, 'customerName') },
    { key: 'totalSales', label: 'Sales', render: (row) => formatCurrency(numberValue(row, 'totalSales')), csvValue: (row) => numberValue(row, 'totalSales') },
    { key: 'returnValue', label: 'Returns', render: (row) => formatCurrency(numberValue(row, 'returnValue')), csvValue: (row) => numberValue(row, 'returnValue') },
    { key: 'outstandingBalance', label: 'Outstanding', render: (row) => formatCurrency(numberValue(row, 'outstandingBalance')), csvValue: (row) => numberValue(row, 'outstandingBalance') },
    { key: 'lastPurchaseAt', label: 'Last Purchase', render: (row) => dateText(row, 'lastPurchaseAt'), csvValue: (row) => text(row, 'lastPurchaseAt') },
  ],
};

const demoRows: Record<ReportKey, Record<string, unknown>[]> = {
  stockOnHand: [
    { productName: 'Wireless Mouse', sku: 'SKU-WM-001', warehouseName: 'Main Warehouse', quantityOnHand: 32, availableQuantity: 26, averageCost: 18, totalValue: 576 },
  ],
  lowStock: [
    { productName: 'USB-C Cable', warehouseName: 'Tech Store', availableQuantity: 3, reorderLevel: 15, preferredSupplierName: 'Cable World', suggestedReorderQuantity: 50 },
  ],
  salesSummary: [
    { period: 'Apr 2026', totalSales: 18450, invoiceCount: 42, averageOrderValue: 439.29, topCustomerName: 'ABC Corp' },
  ],
  purchaseSummary: [
    { period: 'Apr 2026', totalPurchases: 12300, invoiceCount: 11, supplierName: 'Tech Supplies Inc' },
  ],
  returns: [
    { period: 'Apr 2026', customerReturns: 4, supplierReturns: 1, returnValue: 520, reason: 'Defective item' },
  ],
  productPerformance: [
    { productName: 'Wireless Mouse', sku: 'SKU-WM-001', unitsSold: 84, revenue: 2519.16, grossProfit: 1007.16, lastSoldAt: '2026-04-26T10:00:00Z' },
  ],
  warehouse: [
    { warehouseName: 'Main Warehouse', stockValue: 52800, transfersIn: 8, transfersOut: 5, lowStockItems: 2 },
  ],
  supplierPerformance: [
    { supplierName: 'Tech Supplies Inc', totalPurchases: 8800, returnRate: 2.4, onTimeDeliveryRate: 91 },
  ],
  customerPurchaseHistory: [
    { customerName: 'ABC Corp', totalSales: 12300, returnValue: 260, outstandingBalance: 1200, lastPurchaseAt: '2026-04-25T13:20:00Z' },
  ],
};

export default function ReportsPage() {
  const { isGuest, canViewReports } = useAuth();
  const [selectedReport, setSelectedReport] = useState<ReportKey>('stockOnHand');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [warehouseId, setWarehouseId] = useState('');

  const selectedDefinition = reportOptions.find((report) => report.key === selectedReport)!;
  const columns = reportColumns[selectedReport];
  const query = useReportData(
    selectedReport,
    {
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      warehouseId: warehouseId ? Number(warehouseId) : undefined,
    },
    { enabled: !isGuest && canViewReports }
  );

  const rows = useMemo<ReportTableRow[]>(() => {
    const source = isGuest ? demoRows[selectedReport] : query.data?.rows ?? [];
    return source.map((row, index) => ({ ...row, _rowId: index }));
  }, [isGuest, query.data?.rows, selectedReport]);

  if (!isGuest && !canViewReports) {
    return (
      <>
        <Topbar title="Access Denied" />
        <div className="p-6">
          <Card>
            <div className="py-8 text-center">
              <p className="text-gray-600">You do not have permission to view reports.</p>
              <p className="mt-2 text-sm text-gray-400">Reports require the report.view permission.</p>
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar
        title="Reports"
        subtitle="Operational reports for stock, sales, purchases, returns, warehouses, suppliers, and customers"
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={rows.length === 0}
            onClick={() =>
              downloadCsv(
                `${selectedReport}.csv`,
                columns.map((column) => ({
                  label: column.label,
                  value: column.csvValue ?? ((row: ReportTableRow) => text(row, column.key)),
                })),
                rows
              )
            }
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
        }
      />

      <div className="p-6">
        <BreadCrumb items={[{ label: 'Reports' }]} />
        {isGuest && <DemoModeBanner resource="report rows" />}

        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-4">
          <Select
            id="report-selector"
            label="Report"
            value={selectedReport}
            options={reportOptions.map((report) => ({
              value: report.key,
              label: report.title,
            }))}
            onChange={(event) => setSelectedReport(event.target.value as ReportKey)}
          />
          <Input
            id="report-date-from"
            label="From"
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
          />
          <Input
            id="report-date-to"
            label="To"
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
          />
          <Input
            id="report-warehouse"
            label="Warehouse ID"
            type="number"
            min="1"
            placeholder="Any"
            value={warehouseId}
            onChange={(event) => setWarehouseId(event.target.value)}
          />
        </div>

        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
          {reportOptions.map((report) => (
            <button
              key={report.key}
              type="button"
              onClick={() => setSelectedReport(report.key)}
              className={`rounded-lg border px-3 py-3 text-left text-sm transition-colors ${
                selectedReport === report.key
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium">{report.title}</span>
            </button>
          ))}
        </div>

        {query.error && !isGuest ? (
          <ErrorState
            title={`Could not load ${selectedDefinition.title}`}
            message={`${selectedDefinition.endpoint} is required. The frontend is not substituting mock report data for authenticated users.`}
            onRetry={() => void query.refetch()}
          />
        ) : (
          <Card>
            <div className="mb-4 flex flex-col gap-2 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedDefinition.title}</h2>
                <p className="mt-1 text-sm text-gray-500">{selectedDefinition.description}</p>
              </div>
              <Badge variant="info">{selectedDefinition.endpoint}</Badge>
            </div>

            <Table
              columns={columns.map((column) => ({
                key: column.key,
                label: column.label,
                render: column.render,
              }))}
              data={rows}
              keyExtractor={(row) => `${selectedReport}-${row._rowId}`}
              isLoading={!isGuest && query.isLoading}
              emptyMessage="No report rows returned"
            />
          </Card>
        )}
      </div>
    </>
  );
}
