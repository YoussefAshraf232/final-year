import { Supplier } from "./supplier.types";
import { User } from "./user.types";
import { Warehouse } from "./warehouse.types";
import { Product } from "./product.types";
import { Payment, PurchaseInvoiceStatus } from "./payment.types";

// purchase_invoice_items (M:M)
export interface PurchaseInvoiceItem {
  purchaseInvoiceId: number;
  productId: number;
  amount: number;
  price: number;
  discountPercent?: number;
  taxRate?: number;
  taxAmount?: number;
  total?: number;
  product?: Product;
}

export interface PurchaseInvoice {
  id: number;
  supplierId: number;
  userId: number;
  warehouseId: number;
  createdAt: string;
  status?: PurchaseInvoiceStatus;
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
