import api from "./api";
import {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "@/types/customer.types";
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api.types";

export const customerService = {
  getAll: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Customer>>("/customers", { params }),

  getById: (id: number) =>
    api.get<ApiResponse<Customer>>(`/customers/${id}`),

  create: (data: CreateCustomerRequest) =>
    api.post<ApiResponse<Customer>>("/customers", data),

  update: (id: number, data: UpdateCustomerRequest) =>
    api.put<ApiResponse<Customer>>(`/customers/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/customers/${id}`),
};
