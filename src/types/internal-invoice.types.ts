import { Warehouse } from "./warehouse.types";
import { Product } from "./product.types";

export type InternalTransferStatus = "DRAFT" | "APPROVED" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED";

// internal_invoice_items (M:M)
export interface InternalInvoiceItem {
  internalInvoiceId: number;
  productId: number;
  amount: number;
  product?: Product;
}

export interface InternalInvoice {
  id: number;
  fromWarehouseId: number;
  toWarehouseId: number;
  status?: InternalTransferStatus;
  createdAt: string;
  fromWarehouse?: Warehouse;
  toWarehouse?: Warehouse;
  items?: InternalInvoiceItem[];
}

export interface CreateInternalInvoiceItemRequest {
  productId: number;
  amount: number;
}

export interface CreateInternalInvoiceRequest {
  fromWarehouseId: number;
  toWarehouseId: number;
  items: CreateInternalInvoiceItemRequest[];
}
