import { useQuery } from "@tanstack/react-query";
import { auditService } from "@/services/audit.service";
import { AuditLogFilterParams } from "@/types/audit.types";

export function useAuditLogs(
  params?: AuditLogFilterParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => auditService.getAll(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });
}
