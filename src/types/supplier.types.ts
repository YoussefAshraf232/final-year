export type SupplierStatus = "ACTIVE" | "INACTIVE";

export interface Supplier {
  id: number;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  contactPerson?: string | null;
  status?: SupplierStatus;
  notes?: string | null;
  productsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierPurchaseOrder {
  id: number;
  createdAt: string;
  totalAmount: number;
  receiptStatus: string;
}

export interface SupplierDetail {
  supplier: Supplier;
  purchaseOrdersCount: number;
  recentPurchaseOrders: SupplierPurchaseOrder[];
}

export interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  linkedProducts: number;
  purchaseOrdersThisMonth: number;
}

export interface CreateSupplierRequest {
  name: string;
  phone?: string;
  address?: string;
  email?: string;
  contactPerson?: string;
  status?: SupplierStatus;
  notes?: string;
}

export interface UpdateSupplierRequest extends CreateSupplierRequest {}

export interface SupplierFilterParams {
  page?: number;
  size?: number;
  search?: string;
  status?: SupplierStatus;
  hasProducts?: "true" | "false";
  sort?: string;
}
