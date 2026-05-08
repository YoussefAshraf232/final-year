import { Product } from "./product.types";
import { User } from "./user.types";

export interface Warehouse {
  id: number;
  address: string;
  isCentral: boolean;
  createdAt: string;
}

export interface CreateWarehouseRequest {
  address: string;
  isCentral: boolean;
}

export interface UpdateWarehouseRequest {
  address?: string;
  isCentral?: boolean;
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
