import api from "./api";
import {
  Supplier,
  SupplierDetail,
  SupplierStats,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierFilterParams,
} from "@/types/supplier.types";
import { ApiResponse, PaginatedResponse } from "@/types/api.types";

export const supplierService = {
  getAll: (params?: SupplierFilterParams) =>
    api.get<PaginatedResponse<Supplier>>("/suppliers", { params }),

  getById: (id: number) =>
    api.get<ApiResponse<Supplier>>(`/suppliers/${id}`),

  getDetail: (id: number) =>
    api.get<ApiResponse<SupplierDetail>>(`/suppliers/${id}/detail`),

  getStats: () =>
    api.get<ApiResponse<SupplierStats>>("/suppliers/summary"),

  create: (data: CreateSupplierRequest) =>
    api.post<ApiResponse<Supplier>>("/suppliers", data),

  update: (id: number, data: UpdateSupplierRequest) =>
    api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data),

  deactivate: (id: number) =>
    api.post<void>(`/suppliers/${id}/deactivate`),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/suppliers/${id}`),
};
