import api from "./api";
import {
  Warehouse,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  WarehouseProduct,
  WarehouseUser,
  AssignUserToWarehouseRequest,
  WarehousesSummary,
} from "@/types/warehouse.types";
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api.types";

export const warehouseService = {
  getAll: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Warehouse>>("/warehouses", { params }),

  getSummary: () =>
    api.get<ApiResponse<WarehousesSummary>>("/warehouses/summary"),

  getById: (id: number) =>
    api.get<ApiResponse<Warehouse>>(`/warehouses/${id}`),

  create: (data: CreateWarehouseRequest) =>
    api.post<ApiResponse<Warehouse>>("/warehouses", data),

  update: (id: number, data: UpdateWarehouseRequest) =>
    api.put<ApiResponse<Warehouse>>(`/warehouses/${id}`, data),

  deactivate: (id: number) =>
    api.post<ApiResponse<void>>(`/warehouses/${id}/deactivate`),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/warehouses/${id}`),

  getStock: (warehouseId: number) =>
    api.get<ApiResponse<WarehouseProduct[]>>(
      `/warehouses/${warehouseId}/products`
    ),

  getStaff: (warehouseId: number) =>
    api.get<ApiResponse<WarehouseUser[]>>(
      `/warehouses/${warehouseId}/users`
    ),

  assignUser: (data: AssignUserToWarehouseRequest) =>
    api.post<ApiResponse<WarehouseUser>>(
      `/warehouses/${data.warehouseId}/users`,
      data
    ),

  removeUser: (warehouseId: number, userId: number) =>
    api.delete<ApiResponse<void>>(
      `/warehouses/${warehouseId}/users/${userId}`
    ),
};
