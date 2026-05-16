import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { stockService } from "@/services/stock.service";
import {
  CreateStockAdjustmentRequest,
  CreateStockCountRequest,
  WarehouseStockFilterParams,
} from "@/types/inventory.types";

export function useWarehouseStock(
  params?: WarehouseStockFilterParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["stock", "on-hand", params],
    queryFn: () => stockService.getStock(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });
}

export function useStockSummary(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["stock", "summary"],
    queryFn: () => stockService.getSummary().then((res) => res.data.data),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockAdjustmentRequest) =>
      stockService.createAdjustment(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useCreateStockCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockCountRequest) =>
      stockService.createStockCount(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
