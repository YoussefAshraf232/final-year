import api from "./api";
import {
  Product,
  ProductDetail,
  ProductStats,
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilterParams,
} from "@/types/product.types";
import { ApiResponse, PaginatedResponse } from "@/types/api.types";

export const productService = {
  getAll: (params?: ProductFilterParams) =>
    api.get<PaginatedResponse<Product>>("/products", { params }),

  getById: (id: number) =>
    api.get<ApiResponse<Product>>(`/products/${id}`),

  getDetail: (id: number) =>
    api.get<ApiResponse<ProductDetail>>(`/products/${id}/detail`),

  getStats: () =>
    api.get<ApiResponse<ProductStats>>("/products/summary"),

  create: (data: CreateProductRequest) =>
    api.post<ApiResponse<Product>>("/products", data),

  update: (id: number, data: UpdateProductRequest) =>
    api.put<ApiResponse<Product>>(`/products/${id}`, data),

  deactivate: (id: number) =>
    api.post<void>(`/products/${id}/deactivate`),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/products/${id}`),
};
