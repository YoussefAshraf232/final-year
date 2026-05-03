import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { useAuth } from "./useAuth";

export function useUnreadNotifications() {
  const { isGuest, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () =>
      notificationService
        .getAll({ page: 0, size: 10, unreadOnly: true })
        .then((res) => res.data),
    enabled: isAuthenticated && !isGuest,
    staleTime: 60 * 1000,
  });
}
