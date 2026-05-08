import api from "./api";
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/types/user.types";
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api.types";

export const userService = {
  getAll: (params?: PaginationParams) =>
    api.get<PaginatedResponse<User>>("/users", { params }),

  getById: (id: number) =>
    api.get<ApiResponse<User>>(`/users/${id}`),

  create: (data: CreateUserRequest) =>
    api.post<ApiResponse<User>>("/users", data),

  update: (id: number, data: UpdateUserRequest) =>
    api.put<ApiResponse<User>>(`/users/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/users/${id}`),
};
