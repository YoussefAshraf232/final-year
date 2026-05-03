import { Customer } from "./customer.types";
import { User } from "./user.types";
import { SalesInvoice } from "./sales-invoice.types";
import { Product } from "./product.types";

export type ReturnStatus = "DRAFT" | "APPROVED" | "COMPLETED" | "CANCELLED";
export type ReturnRestockDecision = "RESTOCK" | "DAMAGED";

// return_invoice_items (M:M)
export interface ReturnInvoiceItem {
  returnInvoiceId: number;
  productId: number;
  amount: number;
  restockDecision?: ReturnRestockDecision;
  refundAmount?: number;
  product?: Product;
}

export interface ReturnInvoice {
  id: number;
  customerId: number;
  salesInvoiceId: number;
  userId: number;
  reason: string;
  returnedAt: string;
  status?: ReturnStatus;
  totalPrice: number;
  refundAmount?: number;
  customer?: Customer;
  salesInvoice?: SalesInvoice;
  user?: User;
  items?: ReturnInvoiceItem[];
}

export interface CreateReturnInvoiceItemRequest {
  productId: number;
  amount: number;
  restockDecision?: ReturnRestockDecision;
  refundAmount?: number;
}

export interface CreateReturnInvoiceRequest {
  customerId: number;
  salesInvoiceId: number;
  reason: string;
  status?: ReturnStatus;
  items: CreateReturnInvoiceItemRequest[];
}
