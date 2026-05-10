import { Warehouse } from "./warehouse.types";
import { Product } from "./product.types";
import { User } from "./user.types";

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
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  status?: InternalTransferStatus;
  createdAt: string;
  user?: User;
  sourceWarehouse?: Warehouse;
  destinationWarehouse?: Warehouse;
  items?: InternalInvoiceItem[];
}

export interface CreateInternalInvoiceItemRequest {
  productId: number;
  amount: number;
}

export interface CreateInternalInvoiceRequest {
  sourceWarehouseId: number;
  destinationWarehouseId: number;
  items: CreateInternalInvoiceItemRequest[];
}
