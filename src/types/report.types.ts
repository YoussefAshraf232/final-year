import { WarehouseStock } from "./inventory.types";
import { PaginationParams } from "./api.types";

export type ReportKey =
  | "stockOnHand"
  | "lowStock"
  | "salesSummary"
  | "purchaseSummary"
  | "returns"
  | "productPerformance"
  | "warehouse"
  | "supplierPerformance"
  | "customerPurchaseHistory";

export interface ReportFilterParams extends PaginationParams {
  dateFrom?: string;
  dateTo?: string;
  productId?: number;
  warehouseId?: number;
  categoryId?: number;
  supplierId?: number;
  customerId?: number;
}

export interface ReportResult<T> {
  rows: T[];
  totals?: Record<string, string | number>;
  generatedAt: string;
}

export type StockOnHandReportRow = WarehouseStock;

export interface LowStockReportRow extends WarehouseStock {
  suggestedReorderQuantity: number;
  preferredSupplierName?: string;
}

export interface SalesSummaryReportRow {
  period: string;
  totalSales: number;
  invoiceCount: number;
  averageOrderValue: number;
  topCustomerName?: string;
}

export interface PurchaseSummaryReportRow {
  period: string;
  totalPurchases: number;
  invoiceCount: number;
  supplierName?: string;
}

export interface ReturnsReportRow {
  period: string;
  customerReturns: number;
  supplierReturns: number;
  returnValue: number;
  reason?: string;
  damagedQuantity?: number;
  restockedQuantity?: number;
}

export interface ProductPerformanceReportRow {
  productId: number;
  productName: string;
  sku: string;
  unitsSold: number;
  revenue: number;
  grossProfit?: number;
  lastSoldAt?: string;
}

export interface WarehouseReportRow {
  warehouseId: number;
  warehouseName: string;
  stockValue: number;
  transfersIn: number;
  transfersOut: number;
  lowStockItems: number;
}

export interface SupplierPerformanceReportRow {
  supplierId: number;
  supplierName: string;
  totalPurchases: number;
  returnRate: number;
  onTimeDeliveryRate?: number;
}

export interface CustomerPurchaseHistoryReportRow {
  customerId: number;
  customerName: string;
  totalSales: number;
  returnValue: number;
  outstandingBalance: number;
  lastPurchaseAt?: string;
}

export interface ReportRowByKey {
  stockOnHand: StockOnHandReportRow;
  lowStock: LowStockReportRow;
  salesSummary: SalesSummaryReportRow;
  purchaseSummary: PurchaseSummaryReportRow;
  returns: ReturnsReportRow;
  productPerformance: ProductPerformanceReportRow;
  warehouse: WarehouseReportRow;
  supplierPerformance: SupplierPerformanceReportRow;
  customerPurchaseHistory: CustomerPurchaseHistoryReportRow;
}
