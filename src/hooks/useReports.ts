import { useQuery } from "@tanstack/react-query";
import { reportService } from "@/services/report.service";
import { ReportFilterParams, ReportKey } from "@/types/report.types";

export function useReportData<K extends ReportKey>(
  reportKey: K,
  params?: ReportFilterParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["reports", reportKey, params],
    queryFn: () =>
      reportService.getReport(reportKey, params).then((res) => res.data.data),
    enabled: options?.enabled ?? true,
  });
}
