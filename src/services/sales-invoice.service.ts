import api from "./api";
import {
  SalesInvoice,
  CreateSalesInvoiceRequest,
} from "@/types/sales-invoice.types";
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api.types";

export const salesInvoiceService = {
  getAll: (params?: PaginationParams) =>
    api.get<PaginatedResponse<SalesInvoice>>("/sales-invoices", { params }),

  getById: (id: number) =>
    api.get<ApiResponse<SalesInvoice>>(`/sales-invoices/${id}`),

  create: (data: CreateSalesInvoiceRequest) =>
    api.post<ApiResponse<SalesInvoice>>("/sales-invoices", data),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/sales-invoices/${id}`),
};
