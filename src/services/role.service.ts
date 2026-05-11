import api from "./api";
import { PaginatedResponse } from "@/types/api.types";
import { Role } from "@/types/user.types";

export const roleService = {
  getAll: () => api.get<PaginatedResponse<Role>>("/roles"),
};
