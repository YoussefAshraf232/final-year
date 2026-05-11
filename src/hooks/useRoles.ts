import { useQuery } from "@tanstack/react-query";
import { roleService } from "@/services/role.service";
import { useAuth } from "@/hooks/useAuth";

export function useRoles(options?: { enabled?: boolean }) {
  const { isAuthenticated, isGuest } = useAuth();

  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await roleService.getAll();
      return response.data.content;
    },
    enabled: (options?.enabled ?? true) && isAuthenticated && !isGuest,
    staleTime: 5 * 60 * 1000,
  });
}
