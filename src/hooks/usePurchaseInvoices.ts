import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseInvoiceService } from "@/services/purchase-invoice.service";
import { CreatePurchaseInvoiceRequest } from "@/types/purchase-invoice.types";
import { PaginationParams } from "@/types/api.types";

export function usePurchaseInvoices(params?: PaginationParams) {
  return useQuery({
    queryKey: ["purchase-invoices", params],
    queryFn: () =>
      purchaseInvoiceService.getAll(params).then((res) => res.data),
  });
}

export function usePurchaseInvoice(id: number) {
  return useQuery({
    queryKey: ["purchase-invoices", id],
    queryFn: () =>
      purchaseInvoiceService.getById(id).then((res) => res.data.data),
    enabled: !!id,
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
