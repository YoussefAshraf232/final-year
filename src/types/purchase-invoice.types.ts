import { Supplier } from "./supplier.types";
import { User } from "./user.types";
import { Warehouse } from "./warehouse.types";
import { Product } from "./product.types";

// purchase_invoice_items (M:M)
export interface PurchaseInvoiceItem {
  purchaseInvoiceId: number;
  productId: number;
  amount: number;
  price: number;
  product?: Product;
}

export interface PurchaseInvoice {
  id: number;
  supplierId: number;
  userId: number;
  warehouseId: number;
  createdAt: string;
  totalPrice: number;
  supplier?: Supplier;
  user?: User;
  warehouse?: Warehouse;
  items?: PurchaseInvoiceItem[];
}

export interface CreatePurchaseInvoiceItemRequest {
  productId: number;
  amount: number;
  price: number;
}

export interface CreatePurchaseInvoiceRequest {
  supplierId: number;
  warehouseId: number;
  items: CreatePurchaseInvoiceItemRequest[];
}
