import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { warehouseStockRequestService } from "@/services/warehouse-stock-request.service";
import {
  CreateWarehouseStockRequestPayload,
  ReviewWarehouseStockRequestPayload,
  WarehouseStockRequestFilters,
} from "@/types/warehouse-stock-request.types";

export function useOutgoingWarehouseStockRequests(
  filters?: WarehouseStockRequestFilters,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["warehouse-stock-requests", "outgoing", filters],
    queryFn: () =>
      warehouseStockRequestService.outgoing(filters).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });
}

export function useIncomingWarehouseStockRequests(
  filters?: WarehouseStockRequestFilters,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["warehouse-stock-requests", "incoming", filters],
    queryFn: () =>
      warehouseStockRequestService.incoming(filters).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });
}

export function useWarehouseStockRequestSummary(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["warehouse-stock-requests", "summary"],
    queryFn: () =>
      warehouseStockRequestService.summary().then((res) => res.data.data),
    enabled: options?.enabled ?? true,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["warehouse-stock-requests"] });
}

export function useCreateWarehouseStockRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWarehouseStockRequestPayload) =>
      warehouseStockRequestService.create(data).then((res) => res.data.data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useAcceptWarehouseStockRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: ReviewWarehouseStockRequestPayload;
    }) => warehouseStockRequestService.accept(id, data).then((res) => res.data.data),
    onSuccess: () => {
      invalidateAll(qc);
      qc.invalidateQueries({ queryKey: ["stock"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRejectWarehouseStockRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: ReviewWarehouseStockRequestPayload;
    }) => warehouseStockRequestService.reject(id, data).then((res) => res.data.data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useCancelWarehouseStockRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      warehouseStockRequestService.cancel(id).then((res) => res.data.data),
    onSuccess: () => invalidateAll(qc),
  });
}
