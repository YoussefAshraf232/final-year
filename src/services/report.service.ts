import api from "./api";
import { ApiResponse } from "@/types/api.types";
import {
  ReportFilterParams,
  ReportKey,
  ReportResult,
  ReportRowByKey,
} from "@/types/report.types";

const REPORT_ENDPOINTS: Record<ReportKey, string> = {
  stockOnHand: "/reports/stock-on-hand",
  lowStock: "/reports/low-stock",
  salesSummary: "/reports/sales-summary",
  purchaseSummary: "/reports/purchase-summary",
  returns: "/reports/returns",
  productPerformance: "/reports/product-performance",
  warehouse: "/reports/warehouse",
  supplierPerformance: "/reports/supplier-performance",
  customerPurchaseHistory: "/reports/customer-purchase-history",
};

export const reportService = {
  getReport: <K extends ReportKey>(key: K, params?: ReportFilterParams) =>
    api.get<ApiResponse<ReportResult<ReportRowByKey[K]>>>(REPORT_ENDPOINTS[key], {
      params,
    }),
};
