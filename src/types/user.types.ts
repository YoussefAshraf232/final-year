export type UserRole =
  | "ADMIN"
  | "MANAGER"
  | "EMPLOYEE"
  | "SYSTEM_ADMIN"
  | "OPERATIONAL_MANAGER"
  | "WAREHOUSE_MANAGER";

export interface User {
  id: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  email: string;
  role: UserRole;
  roleId?: number;
  roleName?: string;
  createdAt?: string;
  joinedAt: string;
  leftAt: string | null;
  assignedWarehouse?: {
    id: number;
    address: string;
    name?: string;
  } | null;
  assignedWarehouses?: Array<{
    id: number;
    address: string;
    name?: string;
  }>;
  activeWarehouseId?: number | null;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

// Wire format sent to the backend. The backend accepts either email
// or username; we dispatch in auth.service based on whether the
// identifier contains '@'.
export interface LoginPayload {
  email?: string;
  username?: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

// Wire format for POST /users. Matches backend CreateUserRequest.java —
// roleId and phoneNumber are required by the server.
export interface CreateUserRequest {
  username: string;
  firstName?: string;
  lastName?: string;
  phoneNumber: string;
  email: string;
  password: string;
  roleId: number;
}

// Wire format for PUT /users/{id}. Matches backend UpdateUserRequest.java.
export interface UpdateUserRequest {
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  roleId?: number;
  warehouseIds?: number[];
}

export interface Role {
  id: number;
  name: string;
}
