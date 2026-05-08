import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaginationParams } from "@/types/api.types";
import { orderService } from "@/services/order.service";
import { PurchaseOrder, SalesOrder } from "@/types/order.types";

export function usePurchaseOrders(params?: PaginationParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["purchase-orders", params],
    queryFn: () => orderService.getPurchaseOrders(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });
}

export function useSalesOrders(params?: PaginationParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["sales-orders", params],
    queryFn: () => orderService.getSalesOrders(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<PurchaseOrder, "id" | "createdAt">) =>
      orderService.createPurchaseOrder(data).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
  });
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<SalesOrder, "id" | "createdAt">) =>
      orderService.createSalesOrder(data).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sales-orders"] }),
  });
}
