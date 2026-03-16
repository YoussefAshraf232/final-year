import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { salesInvoiceService } from "@/services/sales-invoice.service";
import { CreateSalesInvoiceRequest } from "@/types/sales-invoice.types";
import { PaginationParams } from "@/types/api.types";

export function useSalesInvoices(params?: PaginationParams) {
  return useQuery({
    queryKey: ["sales-invoices", params],
    queryFn: () => salesInvoiceService.getAll(params).then((res) => res.data),
  });
}

export function useSalesInvoice(id: number) {
  return useQuery({
    queryKey: ["sales-invoices", id],
    queryFn: () =>
      salesInvoiceService.getById(id).then((res) => res.data.data),
    enabled: !!id,
  });
}

export function useCreateSalesInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSalesInvoiceRequest) =>
      salesInvoiceService.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteSalesInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      salesInvoiceService.delete(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] });
    },
  });
}
