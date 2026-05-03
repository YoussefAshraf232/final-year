import api from "./api";
import { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api.types";
import {
  Package,
  PurchaseOrder,
  SalesOrder,
  Shipment,
} from "@/types/order.types";

export const orderService = {
  getPurchaseOrders: (params?: PaginationParams) =>
    api.get<PaginatedResponse<PurchaseOrder>>("/purchase-orders", { params }),

  createPurchaseOrder: (data: Omit<PurchaseOrder, "id" | "createdAt">) =>
    api.post<ApiResponse<PurchaseOrder>>("/purchase-orders", data),

  receivePurchaseOrder: (id: number) =>
    api.post<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/receive`),

  convertPurchaseOrderToInvoice: (id: number) =>
    api.post<ApiResponse<unknown>>(`/purchase-orders/${id}/convert-to-invoice`),

  getSalesOrders: (params?: PaginationParams) =>
    api.get<PaginatedResponse<SalesOrder>>("/sales-orders", { params }),

  createSalesOrder: (data: Omit<SalesOrder, "id" | "createdAt">) =>
    api.post<ApiResponse<SalesOrder>>("/sales-orders", data),

  packSalesOrder: (id: number, data?: Partial<Package>) =>
    api.post<ApiResponse<Package>>(`/sales-orders/${id}/pack`, data),

  shipSalesOrder: (id: number, data?: Partial<Shipment>) =>
    api.post<ApiResponse<Shipment>>(`/sales-orders/${id}/ship`, data),

  convertSalesOrderToInvoice: (id: number) =>
    api.post<ApiResponse<unknown>>(`/sales-orders/${id}/convert-to-invoice`),
};
