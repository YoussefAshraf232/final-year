import api from "./api";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category.types";
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api.types";

export const categoryService = {
  getAll: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Category>>("/categories", { params }),

  getById: (id: number) =>
    api.get<ApiResponse<Category>>(`/categories/${id}`),

  create: (data: CreateCategoryRequest) =>
    api.post<ApiResponse<Category>>("/categories", data),

  update: (id: number, data: UpdateCategoryRequest) =>
    api.put<ApiResponse<Category>>(`/categories/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/categories/${id}`),
};
