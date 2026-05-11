import api from "./api";
import {
  CreateReturnInvoiceRequest,
  ReturnInvoice,
  ReturnInvoiceFilters,
  ReturnSalesSummary,
} from "@/types/return-invoice.types";
import { ApiResponse, PaginatedResponse } from "@/types/api.types";

export const returnInvoiceService = {
  getAll: (params?: ReturnInvoiceFilters) =>
    api.get<PaginatedResponse<ReturnInvoice>>("/return-invoices", { params }),

  getById: (id: number) =>
    api.get<ApiResponse<ReturnInvoice>>(`/return-invoices/${id}`),

  getSummary: () =>
    api.get<ApiResponse<ReturnSalesSummary>>("/return-invoices/summary"),

  create: (data: CreateReturnInvoiceRequest) =>
    api.post<ApiResponse<ReturnInvoice>>("/return-invoices", data),

  approve: (id: number) =>
    api.post<ApiResponse<ReturnInvoice>>(`/return-invoices/${id}/approve`),

  reject: (id: number) =>
    api.post<ApiResponse<ReturnInvoice>>(`/return-invoices/${id}/reject`),

  restock: (id: number) =>
    api.post<ApiResponse<ReturnInvoice>>(`/return-invoices/${id}/restock`),

  refund: (id: number) =>
    api.post<ApiResponse<ReturnInvoice>>(`/return-invoices/${id}/refund`),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/return-invoices/${id}`),
};
