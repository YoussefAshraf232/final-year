import api from "./api";
import {
  PurchaseInvoice,
  CreatePurchaseInvoiceRequest,
  ReceiveOrderRequest,
  RejectOrderRequest,
  ReceiveSummaryResponse,
  ReceiveOrderFilters,
} from "@/types/purchase-invoice.types";
import {
  ApiResponse,
  PaginatedResponse,
} from "@/types/api.types";

function buildParams(filters?: ReceiveOrderFilters) {
  if (!filters) return undefined;
  const out: Record<string, string | number> = {};
  if (filters.page !== undefined) out.page = filters.page;
  if (filters.size !== undefined) out.size = filters.size;
  if (filters.search) out.search = filters.search;
  if (filters.receiptStatus) out.receiptStatus = filters.receiptStatus;
  if (filters.supplierId !== "" && filters.supplierId !== undefined) out.supplierId = filters.supplierId;
  if (filters.warehouseId !== "" && filters.warehouseId !== undefined) out.warehouseId = filters.warehouseId;
  if (filters.dateFrom) out.dateFrom = filters.dateFrom;
  if (filters.dateTo) out.dateTo = filters.dateTo;
  return out;
}

export const purchaseInvoiceService = {
  getAll: (params?: ReceiveOrderFilters) =>
    api.get<PaginatedResponse<PurchaseInvoice>>("/purchase-invoices", {
      params: buildParams(params),
    }),

  getById: (id: number) =>
    api.get<ApiResponse<PurchaseInvoice>>(`/purchase-invoices/${id}`),

  create: (data: CreatePurchaseInvoiceRequest) =>
    api.post<ApiResponse<PurchaseInvoice>>("/purchase-invoices", data),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/purchase-invoices/${id}`),

  approve: (id: number) =>
    api.post<ApiResponse<PurchaseInvoice>>(`/purchase-invoices/${id}/approve`, {}),

  receive: (id: number, data: ReceiveOrderRequest) =>
    api.post<ApiResponse<PurchaseInvoice>>(`/purchase-invoices/${id}/receive`, data),

  reject: (id: number, data: RejectOrderRequest) =>
    api.post<ApiResponse<PurchaseInvoice>>(`/purchase-invoices/${id}/reject`, data),

  getReceiveSummary: () =>
    api.get<ApiResponse<ReceiveSummaryResponse>>("/purchase-invoices/receive-summary"),
};
