import api from "./api";
import {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from "@/types/supplier.types";
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api.types";

export const supplierService = {
  getAll: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Supplier>>("/suppliers", { params }),

  getById: (id: number) =>
    api.get<ApiResponse<Supplier>>(`/suppliers/${id}`),

  create: (data: CreateSupplierRequest) =>
    api.post<ApiResponse<Supplier>>("/suppliers", data),

  update: (id: number, data: UpdateSupplierRequest) =>
    api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/suppliers/${id}`),
};
