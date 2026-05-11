import api from "./api";
import {
  CreateSalesInvoiceRequest,
  SalesInvoice,
  SalesInvoiceFilters,
  SalesManagementSummary,
} from "@/types/sales-invoice.types";
import { ApiResponse, PaginatedResponse } from "@/types/api.types";

export const salesInvoiceService = {
  getAll: (params?: SalesInvoiceFilters) =>
    api.get<PaginatedResponse<SalesInvoice>>("/sales-invoices", { params }),

  getById: (id: number) =>
    api.get<ApiResponse<SalesInvoice>>(`/sales-invoices/${id}`),

  getSummary: () =>
    api.get<ApiResponse<SalesManagementSummary>>("/sales-invoices/summary"),

  create: (data: CreateSalesInvoiceRequest) =>
    api.post<ApiResponse<SalesInvoice>>("/sales-invoices", data),

  void: (id: number) =>
    api.post<ApiResponse<SalesInvoice>>(`/sales-invoices/${id}/void`),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/sales-invoices/${id}`),
};
