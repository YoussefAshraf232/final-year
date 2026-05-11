import { Customer } from "./customer.types";
import { User } from "./user.types";
import { Warehouse } from "./warehouse.types";
import { Product } from "./product.types";

export type SalesInvoiceStatus = "PENDING" | "COMPLETED" | "PAID" | "CANCELLED" | "RETURNED";

export interface SalesInvoiceItem {
  salesInvoiceId?: number;
  productId?: number;
  amount: number;
  sellingPrice: number;
  product?: Product;
}

export interface SalesInvoice {
  id: number;
  customerId?: number;
  userId?: number;
  warehouseId?: number;
  createdAt: string;
  status?: SalesInvoiceStatus;
  totalPrice: number;
  discount: number;
  paymentMethod?: string;
  paidAmount?: number;
  balanceDue?: number;
  notes?: string;
  customer?: Customer;
  user?: User;
  warehouse?: Warehouse;
  items?: SalesInvoiceItem[];
}

export interface SalesInvoiceFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  warehouseId?: number;
  customerId?: number;
}

export interface SalesManagementSummary {
  todaySalesAmount: number;
  pendingOrdersCount: number;
  returnsTodayAmount: number;
  lowStockAlertsCount: number;
}

export interface CreateSalesInvoiceItemRequest {
  productId: number;
  amount: number;
  sellingPrice: number;
}

export interface CreateSalesInvoiceRequest {
  customerId: number;
  warehouseId: number;
  discount: number;
  paymentMethod?: string;
  paidAmount?: number;
  status?: SalesInvoiceStatus;
  notes?: string;
  items: CreateSalesInvoiceItemRequest[];
}
