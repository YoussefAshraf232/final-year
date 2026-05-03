import api from "./api";
import { PaginatedResponse } from "@/types/api.types";
import { AuditLog, AuditLogFilterParams } from "@/types/audit.types";

export const auditService = {
  getAll: (params?: AuditLogFilterParams) =>
    api.get<PaginatedResponse<AuditLog>>("/audit-logs", { params }),
};
