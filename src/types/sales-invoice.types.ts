import { Customer } from "./customer.types";
import { User } from "./user.types";
import { Warehouse } from "./warehouse.types";
import { Product } from "./product.types";

// sales_invoice_items (M:M)
export interface SalesInvoiceItem {
  salesInvoiceId: number;
  productId: number;
  amount: number;
  sellingPrice: number;
  product?: Product;
}

export interface SalesInvoice {
  id: number;
  customerId: number;
  userId: number;
  warehouseId: number;
  createdAt: string;
  totalPrice: number;
  discount: number;
  customer?: Customer;
  user?: User;
  warehouse?: Warehouse;
  items?: SalesInvoiceItem[];
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
  items: CreateSalesInvoiceItemRequest[];
}
