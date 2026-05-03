import { Customer } from "./customer.types";
import { User } from "./user.types";
import { Warehouse } from "./warehouse.types";
import { Product } from "./product.types";
import { Payment, SalesInvoiceStatus } from "./payment.types";

// sales_invoice_items (M:M)
export interface SalesInvoiceItem {
  salesInvoiceId: number;
  productId: number;
  amount: number;
  sellingPrice: number;
  discountPercent?: number;
  taxRate?: number;
  taxAmount?: number;
  total?: number;
  product?: Product;
}

export interface SalesInvoice {
  id: number;
  customerId: number;
  userId: number;
  warehouseId: number;
  createdAt: string;
  status?: SalesInvoiceStatus;
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  totalPrice: number;
  discount: number;
  amountPaid?: number;
  balanceDue?: number;
  customer?: Customer;
  user?: User;
  warehouse?: Warehouse;
  items?: SalesInvoiceItem[];
  payments?: Payment[];
}

export interface CreateSalesInvoiceItemRequest {
  productId: number;
  amount: number;
  sellingPrice: number;
  discountPercent?: number;
  taxRate?: number;
  serialNumbers?: string[];
  batchId?: number;
}

export interface CreateSalesInvoiceRequest {
  customerId: number;
  warehouseId: number;
  discount: number;
  invoiceDiscountPercent?: number;
  status?: SalesInvoiceStatus;
  items: CreateSalesInvoiceItemRequest[];
}
