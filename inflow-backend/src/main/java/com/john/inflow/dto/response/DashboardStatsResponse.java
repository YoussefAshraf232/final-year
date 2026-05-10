package com.john.inflow.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record DashboardStatsResponse(
        long totalProducts,
        long totalCustomers,
        long totalSuppliers,
        long totalWarehouses,
        BigDecimal totalSales,
        BigDecimal totalPurchases,
        BigDecimal totalReturns,
        long lowStockProducts,
        long recentSalesInvoices,
        long recentPurchaseInvoices,
        List<MonthlyTotalResponse> monthlySalesData,
        List<MonthlyTotalResponse> monthlyPurchaseData
) {}
