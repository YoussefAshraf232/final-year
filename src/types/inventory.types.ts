import { PaginationParams } from "./api.types";

export type StockReferenceType =
  | "SALES_INVOICE"
  | "PURCHASE_INVOICE"
  | "RETURN_INVOICE"
  | "RETURN_PURCHASE_INVOICE"
  | "TRANSFER"
  | "WAREHOUSE_STOCK_REQUEST"
  | "MANUAL_ADJUSTMENT"
  | "STOCK_COUNT"
  | "OPENING_BALANCE";

export interface WarehouseStock {
  productId: number;
  productName: string;
  sku: string;
  warehouseId: number;
  warehouseName: string;
  amount?: number;
  quantityOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
  averageCost?: number;
  unitValue?: number;
  totalValue: number;
  reorderLevel: number;
  status?: StockStatus;
  minimumStock?: number;
  maximumStock?: number;
  reorderQuantity?: number;
  preferredSupplierId?: number;
  preferredSupplierName?: string;
  lastMovementAt?: string;
  updatedAt: string;
}

export type StockStatus = "OK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface StockSummary {
  totalSkus: number;
  totalWarehouses: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export interface WarehouseStockFilterParams extends PaginationParams {
  productId?: number;
  warehouseId?: number;
  categoryId?: number;
  supplierId?: number;
  search?: string;
  status?: StockStatus | "";
  lowStockOnly?: boolean;
}

export type SerialNumberStatus =
  | "IN_STOCK"
  | "SOLD"
  | "RETURNED"
  | "TRANSFERRED"
  | "DAMAGED";

export interface SerialNumber {
  id: number;
  productId: number;
  productName?: string;
  serialNumber: string;
  warehouseId: number;
  warehouseName?: string;
  status: SerialNumberStatus;
  referenceType?: StockReferenceType;
  referenceId?: number | string;
  createdAt: string;
  updatedAt: string;
}

export type BatchStatus = "ACTIVE" | "EXPIRED" | "DEPLETED" | "BLOCKED";

export interface Batch {
  id: number;
  productId: number;
  productName?: string;
  batchNumber: string;
  warehouseId: number;
  warehouseName?: string;
  initialQuantity: number;
  currentQuantity: number;
  manufactureDate?: string;
  expiryDate?: string;
  status: BatchStatus;
  createdAt: string;
}

export type StockAdjustmentStatus = "DRAFT" | "APPROVED" | "POSTED" | "CANCELLED";

export interface StockAdjustmentItem {
  productId: number;
  productName?: string;
  quantityChange: number;
  unitCost: number;
  note?: string;
}

export interface StockAdjustment {
  id: number;
  warehouseId: number;
  warehouseName?: string;
  reason: string;
  status: StockAdjustmentStatus;
  items: StockAdjustmentItem[];
  createdBy: number;
  approvedBy?: number;
  createdAt: string;
  postedAt?: string;
}

export type StockCountStatus = "DRAFT" | "COUNTING" | "REVIEW" | "POSTED" | "CANCELLED";

export interface StockCountItem {
  productId: number;
  productName?: string;
  expectedQuantity: number;
  countedQuantity?: number;
  difference?: number;
  note?: string;
}

export interface StockCount {
  id: number;
  warehouseId: number;
  warehouseName?: string;
  status: StockCountStatus;
  startedAt: string;
  completedAt?: string;
  createdBy: number;
  items: StockCountItem[];
}

export interface CreateStockAdjustmentRequest {
  warehouseId: number;
  reason: string;
  items: StockAdjustmentItem[];
}

export interface CreateStockCountRequest {
  warehouseId: number;
  items?: StockCountItem[];
}
