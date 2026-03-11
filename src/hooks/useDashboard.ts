import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardService.getStats().then((res) => res.data.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
