import api from "./api";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
} from "@/types/user.types";
import { ApiResponse } from "@/types/api.types";
import { tokenStorage } from "@/lib/tokenStorage";

export const authService = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<LoginResponse>>("/auth/login", data),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<User>>("/auth/register", data),

  me: () =>
    api.get<ApiResponse<User>>("/auth/me"),

  logout: () => {
    tokenStorage.clear();
  },
};
