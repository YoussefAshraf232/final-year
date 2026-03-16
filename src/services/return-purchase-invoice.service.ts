import api from "./api";
import {
  ReturnPurchaseInvoice,
  CreateReturnPurchaseInvoiceRequest,
} from "@/types/return-purchase-invoice.types";
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api.types";

export const returnPurchaseInvoiceService = {
  getAll: (params?: PaginationParams) =>
    api.get<PaginatedResponse<ReturnPurchaseInvoice>>( 
      "/return-purchase-invoices",
      { params }
    ),

  getById: (id: number) =>
    api.get<ApiResponse<ReturnPurchaseInvoice>>( 
      `/return-purchase-invoices/${id}`
    ),

  create: (data: CreateReturnPurchaseInvoiceRequest) =>
    api.post<ApiResponse<ReturnPurchaseInvoice>>( 
      "/return-purchase-invoices",
      data
    ),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>( `/return-purchase-invoices/${id}` ),
};
