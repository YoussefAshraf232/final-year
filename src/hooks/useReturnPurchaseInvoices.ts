import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { returnPurchaseInvoiceService } from "@/services/return-purchase-invoice.service";
import { CreateReturnPurchaseInvoiceRequest } from "@/types/return-purchase-invoice.types";
import { PaginationParams } from "@/types/api.types";

export function useReturnPurchaseInvoices(params?: PaginationParams) {
  return useQuery({
    queryKey: ["return-purchase-invoices", params],
    queryFn: () =>
      returnPurchaseInvoiceService.getAll(params).then((res) => res.data),
  });
}

export function useReturnPurchaseInvoice(id: number) {
  return useQuery({
    queryKey: ["return-purchase-invoices", id],
    queryFn: () =>
      returnPurchaseInvoiceService.getById(id).then((res) => res.data.data),
    enabled: !!id,
  });
}

export function useCreateReturnPurchaseInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReturnPurchaseInvoiceRequest) =>
      returnPurchaseInvoiceService.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["return-purchase-invoices"],
      });
    },
  });
}

export function useDeleteReturnPurchaseInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      returnPurchaseInvoiceService.delete(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["return-purchase-invoices"],
      });
    },
  });
}
