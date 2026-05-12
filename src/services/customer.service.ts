import api from "./api";
import {
  Customer,
  CustomerDetail,
  CustomerFilterParams,
  CustomerSummary,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "@/types/customer.types";
import { ApiResponse, PaginatedResponse } from "@/types/api.types";

export const customerService = {
  getAll: (params?: CustomerFilterParams) =>
    api.get<PaginatedResponse<Customer>>("/customers", { params }),
  getById: (id: number) =>
    api.get<ApiResponse<CustomerDetail>>(`/customers/${id}`),
  getSummary: () =>
    api.get<ApiResponse<CustomerSummary>>("/customers/summary"),
  create: (data: CreateCustomerRequest) =>
    api.post<ApiResponse<Customer>>("/customers", data),
  update: (id: number, data: UpdateCustomerRequest) =>
    api.put<ApiResponse<Customer>>(`/customers/${id}`, data),
  deactivate: (id: number) =>
    api.post<ApiResponse<Customer>>(`/customers/${id}/deactivate`),
  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/customers/${id}`),
};
