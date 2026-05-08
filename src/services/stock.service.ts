import api from "./api";
import { ApiResponse, PaginatedResponse } from "@/types/api.types";
import {
  CreateStockAdjustmentRequest,
  CreateStockCountRequest,
  StockAdjustment,
  StockCount,
  StockMovement,
  StockMovementFilterParams,
  WarehouseStock,
  WarehouseStockFilterParams,
} from "@/types/inventory.types";

export const stockService = {
  getStock: (params?: WarehouseStockFilterParams) =>
    api.get<PaginatedResponse<WarehouseStock>>("/stock", { params }),

  getWarehouseStock: (warehouseId: number, params?: WarehouseStockFilterParams) =>
    api.get<PaginatedResponse<WarehouseStock>>(`/stock/warehouse/${warehouseId}`, {
      params,
    }),

  getProductStock: (productId: number, params?: WarehouseStockFilterParams) =>
    api.get<PaginatedResponse<WarehouseStock>>(`/stock/product/${productId}`, {
      params,
    }),

  getMovements: (params?: StockMovementFilterParams) =>
    api.get<PaginatedResponse<StockMovement>>("/stock/movements", { params }),

  createAdjustment: (data: CreateStockAdjustmentRequest) =>
    api.post<ApiResponse<StockAdjustment>>("/stock/adjustments", data),

  createStockCount: (data: CreateStockCountRequest) =>
    api.post<ApiResponse<StockCount>>("/stock/counts", data),
};
