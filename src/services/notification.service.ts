import api from "./api";
import { PaginatedResponse, PaginationParams } from "@/types/api.types";
import { Notification } from "@/types/notification.types";

export const notificationService = {
  getAll: (params?: PaginationParams & { unreadOnly?: boolean }) =>
    api.get<PaginatedResponse<Notification>>("/notifications", { params }),
};
