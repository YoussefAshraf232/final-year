import api from "./api";
import {
  PurchaseInvoice,
  CreatePurchaseInvoiceRequest,
} from "@/types/purchase-invoice.types";
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api.types";

export const purchaseInvoiceService = {
  getAll: (params?: PaginationParams) =>
    api.get<PaginatedResponse<PurchaseInvoice>>("/purchase-invoices", {
      params,
    }),

  getById: (id: number) =>
    api.get<ApiResponse<PurchaseInvoice>>(`/purchase-invoices/${id}`),

  create: (data: CreatePurchaseInvoiceRequest) =>
    api.post<ApiResponse<PurchaseInvoice>>("/purchase-invoices", data),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/purchase-invoices/${id}`),
};
