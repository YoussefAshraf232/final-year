import api from "./api";
import {
  InternalInvoice,
  CreateInternalInvoiceRequest,
} from "@/types/internal-invoice.types";
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api.types";

export const internalInvoiceService = {
  getAll: (params?: PaginationParams) =>
    api.get<PaginatedResponse<InternalInvoice>>("/internal-invoices", {
      params,
    }),

  getSummary: () =>
    api.get<ApiResponse<{
      pendingCount: number;
      inTransitCount: number;
      completedThisWeekCount: number;
      destinationWarehousesCount: number;
    }>>("/internal-invoices/summary"),

  getById: (id: number) =>
    api.get<ApiResponse<InternalInvoice>>(`/internal-invoices/${id}`),

  create: (data: CreateInternalInvoiceRequest) =>
    api.post<ApiResponse<InternalInvoice>>("/internal-invoices", data),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/internal-invoices/${id}`),
};
