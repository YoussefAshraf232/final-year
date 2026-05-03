import { PaginationParams } from "./api.types";

export type StockMovementType =
  | "OPENING_STOCK"
  | "PURCHASE"
  | "SALE"
  | "CUSTOMER_RETURN"
  | "SUPPLIER_RETURN"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "ADJUSTMENT_IN"
  | "ADJUSTMENT_OUT"
  | "DAMAGE"
  | "LOSS"
  | "CORRECTION";

export type StockReferenceType =
  | "SALES_INVOICE"
  | "PURCHASE_INVOICE"
  | "RETURN_INVOICE"
  | "RETURN_PURCHASE_INVOICE"
  | "TRANSFER"
  | "MANUAL_ADJUSTMENT"
  | "STOCK_COUNT"
  | "OPENING_BALANCE";

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  sku?: string;
  warehouseId: number;
  warehouseName: string;
  movementType: StockMovementType;
  quantity: number;
  unitCost: number;
  totalValue: number;
  referenceType: StockReferenceType;
  referenceId: number | string;
  note?: string;
  createdByUserId: number;
  createdByUsername: string;
  createdAt: string;
}

export interface StockMovementFilterParams extends PaginationParams {
  productId?: number;
  warehouseId?: number;
  movementType?: StockMovementType;
  referenceType?: StockReferenceType;
  dateFrom?: string;
  dateTo?: string;
}

export interface WarehouseStock {
  productId: number;
  productName: string;
  sku: string;
  warehouseId: number;
  warehouseName: string;
  quantityOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
  averageCost: number;
  totalValue: number;
  reorderLevel: number;
  minimumStock?: number;
  maximumStock?: number;
  reorderQuantity?: number;
  preferredSupplierId?: number;
  preferredSupplierName?: string;
  lastMovementAt?: string;
  updatedAt: string;
}

export interface WarehouseStockFilterParams extends PaginationParams {
  productId?: number;
  warehouseId?: number;
  categoryId?: number;
  supplierId?: number;
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
