import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseInvoiceService } from "@/services/purchase-invoice.service";
import {
  CreatePurchaseInvoiceRequest,
  ReceiveOrderFilters,
  ReceiveOrderRequest,
  RejectOrderRequest,
} from "@/types/purchase-invoice.types";

export function usePurchaseInvoices(
  params?: ReceiveOrderFilters,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["purchase-invoices", params],
    queryFn: () =>
      purchaseInvoiceService.getAll(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });
}

export function usePurchaseInvoice(
  id: number | null | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["purchase-invoices", id],
    queryFn: () =>
      purchaseInvoiceService.getById(id as number).then((res) => res.data.data),
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useReceiveOrderSummary(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["purchase-invoices", "receive-summary"],
    queryFn: () =>
      purchaseInvoiceService.getReceiveSummary().then((res) => res.data.data),
    enabled: options?.enabled ?? true,
  });
}

export function useCreatePurchaseInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePurchaseInvoiceRequest) =>
      purchaseInvoiceService.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeletePurchaseInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      purchaseInvoiceService.delete(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] });
    },
  });
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      purchaseInvoiceService.approve(id).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useReceiveOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReceiveOrderRequest }) =>
      purchaseInvoiceService.receive(id, data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRejectOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RejectOrderRequest }) =>
      purchaseInvoiceService.reject(id, data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] });
    },
  });
}
