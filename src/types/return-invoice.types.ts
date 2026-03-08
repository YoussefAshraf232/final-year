import { Customer } from "./customer.types";
import { User } from "./user.types";
import { SalesInvoice } from "./sales-invoice.types";
import { Product } from "./product.types";

// return_invoice_items (M:M)
export interface ReturnInvoiceItem {
  returnInvoiceId: number;
  productId: number;
  amount: number;
  product?: Product;
}

export interface ReturnInvoice {
  id: number;
  customerId: number;
  salesInvoiceId: number;
  userId: number;
  reason: string;
  returnedAt: string;
  totalPrice: number;
  customer?: Customer;
  salesInvoice?: SalesInvoice;
  user?: User;
  items?: ReturnInvoiceItem[];
}

export interface CreateReturnInvoiceItemRequest {
  productId: number;
  amount: number;
}

export interface CreateReturnInvoiceRequest {
  customerId: number;
  salesInvoiceId: number;
  reason: string;
  items: CreateReturnInvoiceItemRequest[];
}
