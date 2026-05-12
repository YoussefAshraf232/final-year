import { Supplier } from "./supplier.types";
import { User } from "./user.types";
import { Warehouse } from "./warehouse.types";
import { Product } from "./product.types";
import { Payment, PurchaseInvoiceStatus } from "./payment.types";

export type ReceiptStatus =
  | "PENDING_APPROVAL"
  | "PENDING_RECEIPT"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "DAMAGED_ITEMS"
  | "REJECTED";

// purchase_invoice_items (M:M)
export interface PurchaseInvoiceItem {
  purchaseInvoiceId?: number;
  productId?: number;
  amount: number;
  price: number;
  receivedQuantity?: number;
  damagedQuantity?: number;
  missingQuantity?: number;
  receivingNotes?: string;
  discountPercent?: number;
  taxRate?: number;
  taxAmount?: number;
  total?: number;
  product?: Product;
}

export interface PurchaseInvoice {
  id: number;
  supplierId?: number;
  userId?: number;
  warehouseId?: number;
  createdAt: string;
  status?: PurchaseInvoiceStatus;
  receiptStatus?: ReceiptStatus;
  receivedAt?: string | null;
  receivedByUser?: User | null;
  receivingNotes?: string | null;
  totalOrderedQuantity?: number;
  totalReceivedQuantity?: number;
  totalDamagedQuantity?: number;
  totalMissingQuantity?: number;
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  totalPrice: number;
  amountPaid?: number;
  balanceDue?: number;
  supplier?: Supplier;
  user?: User;
  warehouse?: Warehouse;
  items?: PurchaseInvoiceItem[];
  payments?: Payment[];
}

export interface CreatePurchaseInvoiceItemRequest {
  productId: number;
  amount: number;
  price: number;
  discountPercent?: number;
  taxRate?: number;
  batchId?: number;
  serialNumbers?: string[];
}

export interface CreatePurchaseInvoiceRequest {
  supplierId: number;
  warehouseId: number;
  invoiceDiscountPercent?: number;
  status?: PurchaseInvoiceStatus;
  items: CreatePurchaseInvoiceItemRequest[];
}

export type ReceiveMode = "CONFIRM" | "PARTIAL" | "DAMAGED";

export interface ReceiveOrderItemRequest {
  productId: number;
  receivedQuantity: number;
  damagedQuantity: number;
  notes?: string;
}

export interface ReceiveOrderRequest {
  mode: ReceiveMode;
  receivingDate?: string;
  notes?: string;
  items: ReceiveOrderItemRequest[];
}

export interface RejectOrderRequest {
  reason: string;
  notes?: string;
}

export interface ReceiveSummaryResponse {
  pendingReceiptsCount: number;
  receivedTodayCount: number;
  partiallyReceivedCount: number;
  damagedItemsCount: number;
}

export interface ReceiveOrderFilters {
  page?: number;
  size?: number;
  search?: string;
  receiptStatus?: ReceiptStatus | "";
  supplierId?: number | "";
  warehouseId?: number | "";
  dateFrom?: string;
  dateTo?: string;
}
