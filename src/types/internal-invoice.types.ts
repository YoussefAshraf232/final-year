import { Warehouse } from "./warehouse.types";
import { Product } from "./product.types";

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
