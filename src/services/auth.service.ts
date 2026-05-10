import api from "./api";
import {
  LoginPayload,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
} from "@/types/user.types";
import { ApiResponse } from "@/types/api.types";
import { tokenStorage } from "@/lib/tokenStorage";

function toLoginPayload(data: LoginRequest): LoginPayload {
  const trimmed = data.identifier.trim();
  // The backend `LoginRequest` accepts either `email` or `username`.
  // Pick by whether the identifier looks like an email address.
  if (trimmed.includes("@")) {
    return { email: trimmed, password: data.password };
  }
  return { username: trimmed, password: data.password };
}

export const authService = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<LoginResponse>>("/auth/login", toLoginPayload(data)),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<User>>("/auth/register", data),

  me: () =>
    api.get<ApiResponse<User>>("/auth/me"),

  logout: () => {
    tokenStorage.clear();
  },
};
