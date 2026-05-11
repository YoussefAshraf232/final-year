import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { returnInvoiceService } from "@/services/return-invoice.service";
import { CreateReturnInvoiceRequest, ReturnInvoice, ReturnInvoiceFilters } from "@/types/return-invoice.types";

export function useReturnInvoices(params?: ReturnInvoiceFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["return-invoices", params],
    queryFn: () => returnInvoiceService.getAll(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });
}

export function useReturnInvoice(id?: number) {
  return useQuery({
    queryKey: ["return-invoices", id],
    queryFn: () => returnInvoiceService.getById(id as number).then((res) => res.data.data),
    enabled: !!id,
  });
}

export function useReturnSalesSummary(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["return-invoices", "summary"],
    queryFn: () => returnInvoiceService.getSummary().then((res) => res.data.data),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateReturnInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReturnInvoiceRequest) => returnInvoiceService.create(data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["return-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] });
    },
  });
}

function useReturnAction(action: (id: number) => Promise<ReturnInvoice>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => action(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["return-invoices"] }),
        queryClient.invalidateQueries({ queryKey: ["sales-invoices"] }),
        queryClient.invalidateQueries({ queryKey: ["stock"] }),
      ]);
    },
  });
}

export function useApproveReturnInvoice() {
  return useReturnAction((id) => returnInvoiceService.approve(id).then((res) => res.data.data));
}

export function useRejectReturnInvoice() {
  return useReturnAction((id) => returnInvoiceService.reject(id).then((res) => res.data.data));
}

export function useRestockReturnInvoice() {
  return useReturnAction((id) => returnInvoiceService.restock(id).then((res) => res.data.data));
}

export function useRefundReturnInvoice() {
  return useReturnAction((id) => returnInvoiceService.refund(id).then((res) => res.data.data));
}

export function useDeleteReturnInvoice() {
  return useRejectReturnInvoice();
}
