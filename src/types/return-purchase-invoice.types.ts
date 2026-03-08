import { Supplier } from "./supplier.types";
import { User } from "./user.types";
import { PurchaseInvoice } from "./purchase-invoice.types";
import { Product } from "./product.types";

// return_purchase_invoice_items (M:M)
export interface ReturnPurchaseInvoiceItem {
  returnPurchaseInvoiceId: number;
  productId: number;
  amount: number;
  price: number;
  product?: Product;
}

export interface ReturnPurchaseInvoice {
  id: number;
  supplierId: number;
  purchaseInvoiceId: number;
  userId: number;
  reason: string;
  createdAt: string;
  totalPrice: number;
  supplier?: Supplier;
  purchaseInvoice?: PurchaseInvoice;
  user?: User;
  items?: ReturnPurchaseInvoiceItem[];
}

export interface CreateReturnPurchaseInvoiceItemRequest {
  productId: number;
  amount: number;
  price: number;
}

export interface CreateReturnPurchaseInvoiceRequest {
  supplierId: number;
  purchaseInvoiceId: number;
  reason: string;
  items: CreateReturnPurchaseInvoiceItemRequest[];
}
