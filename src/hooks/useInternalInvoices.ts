import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { internalInvoiceService } from "@/services/internal-invoice.service";
import { CreateInternalInvoiceRequest } from "@/types/internal-invoice.types";
import { PaginationParams } from "@/types/api.types";

export function useInternalInvoices(params?: PaginationParams) {
  return useQuery({
    queryKey: ["internal-invoices", params],
    queryFn: () =>
      internalInvoiceService.getAll(params).then((res) => res.data),
  });
}

export function useInternalInvoice(id: number) {
  return useQuery({
    queryKey: ["internal-invoices", id],
    queryFn: () =>
      internalInvoiceService.getById(id).then((res) => res.data.data),
    enabled: !!id,
  });
}

export function useCreateInternalInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInternalInvoiceRequest) =>
      internalInvoiceService.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internal-invoices"] });
    },
  });
}

export function useDeleteInternalInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      internalInvoiceService.delete(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internal-invoices"] });
    },
  });
}
