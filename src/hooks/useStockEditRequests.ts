import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { stockEditRequestService } from "@/services/stock-edit-request.service";
import {
  CreateStockEditRequestPayload,
  ReviewStockEditRequestPayload,
  StockEditRequestFilters,
} from "@/types/stock-edit-request.types";

export function useStockEditRequests(
  filters?: StockEditRequestFilters,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["stock-edit-requests", filters],
    queryFn: () => stockEditRequestService.list(filters).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });
}

export function useStockEditRequest(
  id: number | null | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["stock-edit-requests", id],
    queryFn: () =>
      stockEditRequestService.getById(id as number).then((res) => res.data.data),
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useStockEditRequestSummary(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["stock-edit-requests", "summary"],
    queryFn: () => stockEditRequestService.summary().then((res) => res.data.data),
    enabled: options?.enabled ?? true,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["stock-edit-requests"] });
}

export function useCreateStockEditRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStockEditRequestPayload) =>
      stockEditRequestService.create(data).then((res) => res.data.data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useApproveStockEditRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReviewStockEditRequestPayload }) =>
      stockEditRequestService.approve(id, data).then((res) => res.data.data),
    onSuccess: () => {
      invalidateAll(qc);
      qc.invalidateQueries({ queryKey: ["stock"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRejectStockEditRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReviewStockEditRequestPayload }) =>
      stockEditRequestService.reject(id, data).then((res) => res.data.data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useCancelStockEditRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      stockEditRequestService.cancel(id).then((res) => res.data.data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useAddStockEditRequestComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReviewStockEditRequestPayload }) =>
      stockEditRequestService.comment(id, data).then((res) => res.data.data),
    onSuccess: () => invalidateAll(qc),
  });
}
