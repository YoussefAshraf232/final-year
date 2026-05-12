import api from "./api";
import { ApiResponse, PaginatedResponse } from "@/types/api.types";
import {
  CreateWarehouseStockRequestPayload,
  ReviewWarehouseStockRequestPayload,
  WarehouseStockRequest,
  WarehouseStockRequestFilters,
  WarehouseStockRequestSummary,
} from "@/types/warehouse-stock-request.types";

function params(filters?: WarehouseStockRequestFilters) {
  if (!filters) return undefined;
  const out: Record<string, string | number> = {};
  if (filters.page !== undefined) out.page = filters.page;
  if (filters.size !== undefined) out.size = filters.size;
  if (filters.status) out.status = filters.status;
  return out;
}

export const warehouseStockRequestService = {
  outgoing: (filters?: WarehouseStockRequestFilters) =>
    api.get<PaginatedResponse<WarehouseStockRequest>>(
      "/warehouse-stock-requests/outgoing",
      { params: params(filters) }
    ),
  incoming: (filters?: WarehouseStockRequestFilters) =>
    api.get<PaginatedResponse<WarehouseStockRequest>>(
      "/warehouse-stock-requests/incoming",
      { params: params(filters) }
    ),
  getById: (id: number) =>
    api.get<ApiResponse<WarehouseStockRequest>>(`/warehouse-stock-requests/${id}`),
  summary: () =>
    api.get<ApiResponse<WarehouseStockRequestSummary>>(
      "/warehouse-stock-requests/summary"
    ),
  create: (data: CreateWarehouseStockRequestPayload) =>
    api.post<ApiResponse<WarehouseStockRequest>>("/warehouse-stock-requests", data),
  accept: (id: number, data: ReviewWarehouseStockRequestPayload) =>
    api.post<ApiResponse<WarehouseStockRequest>>(
      `/warehouse-stock-requests/${id}/accept`,
      data
    ),
  reject: (id: number, data: ReviewWarehouseStockRequestPayload) =>
    api.post<ApiResponse<WarehouseStockRequest>>(
      `/warehouse-stock-requests/${id}/reject`,
      data
    ),
  cancel: (id: number) =>
    api.post<ApiResponse<WarehouseStockRequest>>(
      `/warehouse-stock-requests/${id}/cancel`,
      {}
    ),
};
