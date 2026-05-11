import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { salesInvoiceService } from "@/services/sales-invoice.service";
import { CreateSalesInvoiceRequest, SalesInvoiceFilters } from "@/types/sales-invoice.types";

export function useSalesInvoices(params?: SalesInvoiceFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["sales-invoices", params],
    queryFn: () => salesInvoiceService.getAll(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });
}

export function useSalesInvoice(id?: number) {
  return useQuery({
    queryKey: ["sales-invoices", id],
    queryFn: () => salesInvoiceService.getById(id as number).then((res) => res.data.data),
    enabled: !!id,
  });
}

export function useSalesManagementSummary(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["sales-invoices", "summary"],
    queryFn: () => salesInvoiceService.getSummary().then((res) => res.data.data),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateSalesInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSalesInvoiceRequest) => salesInvoiceService.create(data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useVoidSalesInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => salesInvoiceService.void(id).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
    },
  });
}

export function useDeleteSalesInvoice() {
  return useVoidSalesInvoice();
}
