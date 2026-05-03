import api from "./api";
import { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api.types";
import { CreatePaymentRequest, Payment } from "@/types/payment.types";

export const paymentService = {
  getPayments: (params?: PaginationParams & { invoiceId?: number; invoiceType?: string }) =>
    api.get<PaginatedResponse<Payment>>("/payments", { params }),

  recordPayment: (data: CreatePaymentRequest) =>
    api.post<ApiResponse<Payment>>("/payments", data),
};
