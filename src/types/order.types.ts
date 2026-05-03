import { StockReferenceType } from "./inventory.types";

export type PurchaseOrderStatus =
  | "DRAFT"
  | "SENT"
  | "APPROVED"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED"
  | "CLOSED";

export interface PurchaseOrderItem {
  productId: number;
  productName?: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  taxRate: number;
  discountPercent?: number;
  total: number;
}

export interface PurchaseOrder {
  id: number;
  supplierId: number;
  supplierName?: string;
  warehouseId: number;
  warehouseName?: string;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDeliveryDate?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  createdBy: number;
  createdAt: string;
}

export type SalesOrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "PACKED"
  | "SHIPPED"
  | "INVOICED"
  | "PAID"
  | "CANCELLED"
  | "CLOSED";

export interface SalesOrderItem {
  productId: number;
  productName?: string;
  quantityOrdered: number;
  quantityPacked: number;
  quantityShipped: number;
  sellingPrice: number;
  taxRate: number;
  discountPercent?: number;
  total: number;
  serialNumbers?: string[];
  batchId?: number;
}

export interface SalesOrder {
  id: number;
  customerId: number;
  customerName?: string;
  warehouseId: number;
  warehouseName?: string;
  status: SalesOrderStatus;
  orderDate: string;
  expectedShipmentDate?: string;
  items: SalesOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  createdBy: number;
  createdAt: string;
}

export type PackageStatus = "CREATED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface PackageItem {
  productId: number;
  productName?: string;
  quantity: number;
  serialNumbers?: string[];
  batchId?: number;
}

export interface Package {
  id: number;
  salesOrderId: number;
  packageNumber: string;
  status: PackageStatus;
  items: PackageItem[];
  createdAt: string;
}

export type ShipmentStatus =
  | "PENDING"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED"
  | "RETURNED";

export interface Shipment {
  id: number;
  salesOrderId: number;
  packageId: number;
  carrier?: string;
  trackingNumber?: string;
  shipmentDate?: string;
  deliveryDate?: string;
  status: ShipmentStatus;
}

export interface OrderReference {
  referenceType: StockReferenceType;
  referenceId: number | string;
}
