import api from "./api";
import { ApiResponse, PaginatedResponse } from "@/types/api.types";
import {
  CreateStockEditRequestPayload,
  ReviewStockEditRequestPayload,
  StockEditRequest,
  StockEditRequestFilters,
  StockEditRequestSummary,
} from "@/types/stock-edit-request.types";

function buildParams(filters?: StockEditRequestFilters) {
  if (!filters) return undefined;
  const out: Record<string, string | number> = {};
  if (filters.page !== undefined) out.page = filters.page;
  if (filters.size !== undefined) out.size = filters.size;
  if (filters.search) out.search = filters.search;
  if (filters.status) out.status = filters.status;
  if (filters.productId !== "" && filters.productId !== undefined) out.productId = filters.productId;
  if (filters.warehouseId !== "" && filters.warehouseId !== undefined) out.warehouseId = filters.warehouseId;
  if (filters.dateFrom) out.dateFrom = filters.dateFrom;
  if (filters.dateTo) out.dateTo = filters.dateTo;
  return out;
}

export const stockEditRequestService = {
  list: (filters?: StockEditRequestFilters) =>
    api.get<PaginatedResponse<StockEditRequest>>("/stock-edit-requests", {
      params: buildParams(filters),
    }),

  getById: (id: number) =>
    api.get<ApiResponse<StockEditRequest>>(`/stock-edit-requests/${id}`),

  summary: () =>
    api.get<ApiResponse<StockEditRequestSummary>>("/stock-edit-requests/summary"),

  create: (data: CreateStockEditRequestPayload) =>
    api.post<ApiResponse<StockEditRequest>>("/stock-edit-requests", data),

  approve: (id: number, data: ReviewStockEditRequestPayload) =>
    api.post<ApiResponse<StockEditRequest>>(`/stock-edit-requests/${id}/approve`, data),

  reject: (id: number, data: ReviewStockEditRequestPayload) =>
    api.post<ApiResponse<StockEditRequest>>(`/stock-edit-requests/${id}/reject`, data),

  cancel: (id: number) =>
    api.post<ApiResponse<StockEditRequest>>(`/stock-edit-requests/${id}/cancel`, {}),

  comment: (id: number, data: ReviewStockEditRequestPayload) =>
    api.post<ApiResponse<StockEditRequest>>(`/stock-edit-requests/${id}/comment`, data),
};
