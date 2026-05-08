import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import { useAuth } from "@/hooks/useAuth";

export function useDashboardStats() {
  const { isGuest } = useAuth();

  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardService.getStats().then((res) => res.data.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !isGuest,
  });
}
