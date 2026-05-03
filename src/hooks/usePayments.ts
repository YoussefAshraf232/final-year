import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "@/services/payment.service";
import { CreatePaymentRequest } from "@/types/payment.types";

export function usePayments(
  params?: { invoiceId?: number; invoiceType?: string; page?: number; size?: number },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => paymentService.getPayments(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentRequest) =>
      paymentService.recordPayment(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
