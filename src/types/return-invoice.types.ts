import { Customer } from "./customer.types";
import { User } from "./user.types";
import { Warehouse } from "./warehouse.types";
import { SalesInvoice } from "./sales-invoice.types";
import { Product } from "./product.types";

export type ReturnStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "COMPLETED" | "CANCELLED" | "REJECTED" | "REFUNDED" | "CREDIT_ISSUED";
export type ReturnRestockStatus = "PENDING_RESTOCK" | "AWAITING_INSPECTION" | "RESTOCKED" | "NOT_RESTOCKED";
export type ReturnRefundStatus = "PENDING_REFUND" | "APPROVED" | "REFUNDED" | "CREDIT_ISSUED" | "NO_REFUND";
export type ReturnRestockDecision = "PENDING_REVIEW" | "RESTOCKABLE" | "NOT_RESTOCKABLE";
export type ReturnItemCondition = "GOOD" | "DAMAGED" | "MIXED" | "NEEDS_INSPECTION";

export interface ReturnInvoiceItem {
  returnInvoiceId?: number;
  productId?: number;
  amount: number;
  priceAtReturn?: number;
  restockDecision?: ReturnRestockDecision;
  condition?: ReturnItemCondition;
  restockedQuantity?: number;
  product?: Product;
}

export interface ReturnInvoice {
  id: number;
  customerId?: number;
  salesInvoiceId: number;
  userId?: number;
  warehouseId?: number;
  reason: string;
  returnedAt: string;
  returnStatus?: ReturnStatus;
  restockStatus?: ReturnRestockStatus;
  refundStatus?: ReturnRefundStatus;
  refundMethod?: string;
  notes?: string;
  totalPrice: number;
  customer?: Customer;
  salesInvoice?: SalesInvoice;
  user?: User;
  warehouse?: Warehouse;
  items?: ReturnInvoiceItem[];
}

export interface ReturnInvoiceFilters {
  page?: number;
  size?: number;
  search?: string;
  returnStatus?: string;
  restockStatus?: string;
  refundStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  warehouseId?: number;
  customerId?: number;
}

export interface ReturnSalesSummary {
  returnsTodayAmount: number;
  pendingApprovalCount: number;
  refundedAmount: number;
  pendingRestockCount: number;
}

export interface CreateReturnInvoiceItemRequest {
  productId: number;
  amount: number;
  priceAtReturn: number;
  condition?: ReturnItemCondition;
  restockDecision?: ReturnRestockDecision;
}

export interface CreateReturnInvoiceRequest {
  customerId: number;
  warehouseId: number;
  salesInvoiceId: number;
  reason: string;
  refundMethod?: string;
  notes?: string;
  items: CreateReturnInvoiceItemRequest[];
}
