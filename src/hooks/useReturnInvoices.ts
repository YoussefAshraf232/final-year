import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { returnInvoiceService } from "@/services/return-invoice.service";
import { CreateReturnInvoiceRequest } from "@/types/return-invoice.types";
import { PaginationParams } from "@/types/api.types";

export function useReturnInvoices(
  params?: PaginationParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["return-invoices", params],
    queryFn: () => returnInvoiceService.getAll(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });
}

export function useReturnInvoice(id: number) {
  return useQuery({
    queryKey: ["return-invoices", id],
    queryFn: () =>
      returnInvoiceService.getById(id).then((res) => res.data.data),
    enabled: !!id,
  });
}

export function useCreateReturnInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReturnInvoiceRequest) =>
      returnInvoiceService.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["return-invoices"] });
    },
  });
}

export function useDeleteReturnInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      returnInvoiceService.delete(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["return-invoices"] });
    },
  });
}
