import api from "./api";
import { ApiResponse } from "@/types/api.types";

export interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalWarehouses: number;
  totalSales: number;
  totalPurchases: number;
  totalReturns: number;
  lowStockProducts: number;
  recentSalesInvoices: number;
  recentPurchaseInvoices: number;
  monthlySalesData: { month: string; total: number }[];
  monthlyPurchaseData: { month: string; total: number }[];
}

export const dashboardService = {
  getStats: () =>
    api.get<ApiResponse<DashboardStats>>("/dashboard/stats"),
};
