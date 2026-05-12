import { Product } from "./product.types";
import { User } from "./user.types";

export type WarehouseStatus = "ACTIVE" | "INACTIVE";

export interface WarehouseManager {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface Warehouse {
  id: number;
  address: string;
  isCentral: boolean;
  status?: WarehouseStatus;
  phone?: string | null;
  notes?: string | null;
  manager?: WarehouseManager | null;
  productsCount?: number;
  totalStock?: number;
  lowStockItems?: number;
  createdAt: string;
  deactivatedAt?: string | null;
}

export interface CreateWarehouseRequest {
  address: string;
  isCentral: boolean;
  status?: WarehouseStatus;
  phone?: string | null;
  notes?: string | null;
  managerUserId?: number | null;
}

export interface UpdateWarehouseRequest {
  address?: string;
  isCentral?: boolean;
  status?: WarehouseStatus;
  phone?: string | null;
  notes?: string | null;
  managerUserId?: number | null;
}

export interface WarehousesSummary {
  totalWarehouses: number;
  centralWarehouses: number;
  branchWarehouses: number;
  activeManagers: number;
}

// warehouse_products (M:M)
export interface WarehouseProduct {
  warehouseId: number;
  productId: number;
  amount: number;
  product?: Product;
  warehouse?: Warehouse;
}

// warehouse_users (M:M)
export interface WarehouseUser {
  warehouseId: number;
  userId: number;
  assignmentDate: string;
  leaveDate: string | null;
  user?: User;
  warehouse?: Warehouse;
}

export interface AssignUserToWarehouseRequest {
  warehouseId: number;
  userId: number;
  assignmentDate: string;
}
