import api from "./api";
import { ApiResponse } from "@/types/api.types";
import { User } from "@/types/user.types";

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const profileService = {
  get: () => api.get<ApiResponse<User>>("/profile"),
  update: (data: UpdateProfileRequest) =>
    api.put<ApiResponse<User>>("/profile", data),
  changePassword: (data: ChangePasswordRequest) =>
    api.put<ApiResponse<void>>("/profile/password", data),
};
