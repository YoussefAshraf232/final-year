package com.john.inflow.service;

import com.john.inflow.dto.response.DashboardStatsResponse;
import com.john.inflow.dto.response.MonthlyTotalResponse;
import com.john.inflow.repository.CustomerRepository;
import com.john.inflow.repository.ProductRepository;
import com.john.inflow.repository.ProductWarehouseRepository;
import com.john.inflow.repository.PurchaseInvoiceRepository;
import com.john.inflow.repository.ReturnPurchaseInvoiceRepository;
import com.john.inflow.repository.ReturnSalesInvoiceRepository;
import com.john.inflow.repository.SalesInvoiceRepository;
import com.john.inflow.repository.SupplierRepository;
import com.john.inflow.repository.WarehouseRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DashboardService {
    private static final int LOW_STOCK_THRESHOLD = 10;
    private final ProductRepository productRepository;
    private final ProductWarehouseRepository productWarehouseRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final SalesInvoiceRepository salesInvoiceRepository;
    private final PurchaseInvoiceRepository purchaseInvoiceRepository;
    private final ReturnSalesInvoiceRepository returnSalesInvoiceRepository;
    private final ReturnPurchaseInvoiceRepository returnPurchaseInvoiceRepository;

    public DashboardService(
            ProductRepository productRepository,
            ProductWarehouseRepository productWarehouseRepository,
            CustomerRepository customerRepository,
            SupplierRepository supplierRepository,
            WarehouseRepository warehouseRepository,
            SalesInvoiceRepository salesInvoiceRepository,
            PurchaseInvoiceRepository purchaseInvoiceRepository,
            ReturnSalesInvoiceRepository returnSalesInvoiceRepository,
            ReturnPurchaseInvoiceRepository returnPurchaseInvoiceRepository
    ) {
        this.productRepository = productRepository;
        this.productWarehouseRepository = productWarehouseRepository;
        this.customerRepository = customerRepository;
        this.supplierRepository = supplierRepository;
        this.warehouseRepository = warehouseRepository;
        this.salesInvoiceRepository = salesInvoiceRepository;
        this.purchaseInvoiceRepository = purchaseInvoiceRepository;
        this.returnSalesInvoiceRepository = returnSalesInvoiceRepository;
        this.returnPurchaseInvoiceRepository = returnPurchaseInvoiceRepository;
    }

    public DashboardStatsResponse getStats() {
        return new DashboardStatsResponse(
                productRepository.count(),
                customerRepository.count(),
                supplierRepository.count(),
                warehouseRepository.count(),
                nullToZero(salesInvoiceRepository.sumTotalPrice()),
                nullToZero(purchaseInvoiceRepository.sumTotalPrice()),
                nullToZero(returnSalesInvoiceRepository.sumTotalPrice()).add(nullToZero(returnPurchaseInvoiceRepository.sumTotalPrice())),
                productWarehouseRepository.countLowStock(LOW_STOCK_THRESHOLD),
                salesInvoiceRepository.count(),
                purchaseInvoiceRepository.count(),
                toMonthlyTotals(salesInvoiceRepository.monthlyTotalsLast12Months()),
                toMonthlyTotals(purchaseInvoiceRepository.monthlyTotalsLast12Months())
        );
    }

    private BigDecimal nullToZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private List<MonthlyTotalResponse> toMonthlyTotals(List<Object[]> rows) {
        return rows.stream()
                .map(row -> new MonthlyTotalResponse(
                        String.valueOf(row[0]),
                        row[1] instanceof BigDecimal total ? total : new BigDecimal(String.valueOf(row[1]))
                ))
                .toList();
    }
}
