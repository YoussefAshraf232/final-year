import api from "./api";
import {
  ReturnInvoice,
  CreateReturnInvoiceRequest,
} from "@/types/return-invoice.types";
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api.types";

export const returnInvoiceService = {
  getAll: (params?: PaginationParams) =>
    api.get<PaginatedResponse<ReturnInvoice>>("/return-invoices", { params }),

  getById: (id: number) =>
    api.get<ApiResponse<ReturnInvoice>>(`/return-invoices/${id}`),

  create: (data: CreateReturnInvoiceRequest) =>
    api.post<ApiResponse<ReturnInvoice>>("/return-invoices", data),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/return-invoices/${id}`),
};
