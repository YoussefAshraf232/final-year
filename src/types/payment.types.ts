export type SalesInvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "VOID"
  | "CANCELLED";

export type PurchaseInvoiceStatus =
  | "DRAFT"
  | "RECEIVED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "WALLET" | "OTHER";
export type PaymentInvoiceType = "SALES_INVOICE" | "PURCHASE_INVOICE";

export interface Payment {
  id: number;
  invoiceType: PaymentInvoiceType;
  invoiceId: number;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
  createdBy: number;
  createdAt: string;
}

export interface CreatePaymentRequest {
  invoiceType: PaymentInvoiceType;
  invoiceId: number;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
}
