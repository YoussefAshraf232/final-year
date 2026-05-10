package com.john.inflow.service;

import com.john.inflow.dto.response.*;
import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.StockMovement;
import com.john.inflow.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReportService {
    private static final int LOW_STOCK_THRESHOLD = 10;
    private final ProductWarehouseRepository productWarehouseRepository;
    private final SalesInvoiceRepository salesInvoiceRepository;
    private final PurchaseInvoiceRepository purchaseInvoiceRepository;
    private final ReturnSalesInvoiceRepository returnSalesInvoiceRepository;
    private final ReturnPurchaseInvoiceRepository returnPurchaseInvoiceRepository;
    private final StockMovementRepository stockMovementRepository;
    private final SalesInvoiceProductRepository salesInvoiceProductRepository;
    private final PurchaseInvoiceProductRepository purchaseInvoiceProductRepository;

    public ReportService(ProductWarehouseRepository productWarehouseRepository,
                         SalesInvoiceRepository salesInvoiceRepository,
                         PurchaseInvoiceRepository purchaseInvoiceRepository,
                         ReturnSalesInvoiceRepository returnSalesInvoiceRepository,
                         ReturnPurchaseInvoiceRepository returnPurchaseInvoiceRepository,
                         StockMovementRepository stockMovementRepository,
                         SalesInvoiceProductRepository salesInvoiceProductRepository,
                         PurchaseInvoiceProductRepository purchaseInvoiceProductRepository) {
        this.productWarehouseRepository = productWarehouseRepository;
        this.salesInvoiceRepository = salesInvoiceRepository;
        this.purchaseInvoiceRepository = purchaseInvoiceRepository;
        this.returnSalesInvoiceRepository = returnSalesInvoiceRepository;
        this.returnPurchaseInvoiceRepository = returnPurchaseInvoiceRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.salesInvoiceProductRepository = salesInvoiceProductRepository;
        this.purchaseInvoiceProductRepository = purchaseInvoiceProductRepository;
    }

    public ReportResultResponse<Map<String, Object>> getStockOnHand() {
        List<Map<String, Object>> rows = productWarehouseRepository.findAll().stream()
                .map(this::stockRow)
                .toList();
        return result(rows, Map.of("rowCount", rows.size()));
    }

    public ReportResultResponse<Map<String, Object>> getLowStock() {
        List<Map<String, Object>> rows = productWarehouseRepository.findLowStock(LOW_STOCK_THRESHOLD).stream()
                .map(stock -> {
                    Map<String, Object> row = new LinkedHashMap<>(stockRow(stock));
                    row.put("suggestedReorderQuantity", Math.max(LOW_STOCK_THRESHOLD - stock.getAmount(), 0));
                    return row;
                })
                .toList();
        return result(rows, Map.of("rowCount", rows.size()));
    }

    public ReportResultResponse<Map<String, Object>> getStockMovements(Integer productId, Integer warehouseId, String movementType, OffsetDateTime dateFrom, OffsetDateTime dateTo, int page, int size) {
        List<Map<String, Object>> rows = stockMovementRepository.search(productId, warehouseId, movementType, dateFrom, dateTo, PageRequest.of(page, size)).stream()
                .map(this::stockMovementRow)
                .toList();
        return result(rows, Map.of("rowCount", rows.size()));
    }

    public ReportResultResponse<Map<String, Object>> getSalesSummary() {
        BigDecimal total = nullToZero(salesInvoiceRepository.sumTotalPrice());
        long count = salesInvoiceRepository.count();
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("period", "All time");
        row.put("totalSales", total);
        row.put("invoiceCount", count);
        row.put("averageOrderValue", count == 0 ? BigDecimal.ZERO : total.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP));
        row.put("topCustomerName", topCustomerName());
        return result(List.of(row), Map.of("totalSales", total, "invoiceCount", count));
    }

    public ReportResultResponse<Map<String, Object>> getPurchaseSummary() {
        BigDecimal total = nullToZero(purchaseInvoiceRepository.sumTotalPrice());
        long count = purchaseInvoiceRepository.count();
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("period", "All time");
        row.put("totalPurchases", total);
        row.put("invoiceCount", count);
        row.put("supplierName", topSupplierName());
        return result(List.of(row), Map.of("totalPurchases", total, "invoiceCount", count));
    }

    public ReportResultResponse<Map<String, Object>> getReturnsSummary() {
        BigDecimal salesReturns = nullToZero(returnSalesInvoiceRepository.sumTotalPrice());
        BigDecimal purchaseReturns = nullToZero(returnPurchaseInvoiceRepository.sumTotalPrice());
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("period", "All time");
        row.put("customerReturns", returnSalesInvoiceRepository.count());
        row.put("supplierReturns", returnPurchaseInvoiceRepository.count());
        row.put("returnValue", salesReturns.add(purchaseReturns));
        row.put("reason", topReturnReason());
        return result(List.of(row), Map.of("returnValue", salesReturns.add(purchaseReturns)));
    }

    public ReportResultResponse<Map<String, Object>> getProductPerformance() {
        Map<Integer, Map<String, Object>> byProduct = new LinkedHashMap<>();
        salesInvoiceProductRepository.findAll().forEach(item -> {
            Integer id = item.getProduct().getId();
            Map<String, Object> row = byProduct.computeIfAbsent(id, ignored -> {
                Map<String, Object> created = new LinkedHashMap<>();
                created.put("productId", id);
                created.put("productName", item.getProduct().getName());
                created.put("sku", "");
                created.put("unitsSold", 0);
                created.put("revenue", BigDecimal.ZERO);
                created.put("grossProfit", BigDecimal.ZERO);
                created.put("lastSoldAt", item.getSalesInvoice().getCreatedAt());
                return created;
            });
            int amount = (Integer) row.get("unitsSold") + item.getAmount();
            BigDecimal revenue = ((BigDecimal) row.get("revenue")).add(item.getSellingPrice().multiply(BigDecimal.valueOf(item.getAmount())));
            row.put("unitsSold", amount);
            row.put("revenue", revenue);
            row.put("grossProfit", revenue);
            row.put("lastSoldAt", item.getSalesInvoice().getCreatedAt());
        });
        List<Map<String, Object>> rows = new ArrayList<>(byProduct.values());
        return result(rows, Map.of("rowCount", rows.size()));
    }

    public ReportResultResponse<Map<String, Object>> getWarehouseReport() {
        Map<Integer, Map<String, Object>> rows = new LinkedHashMap<>();
        productWarehouseRepository.findAll().forEach(stock -> {
            Map<String, Object> row = rows.computeIfAbsent(stock.getWarehouse().getId(), id -> {
                Map<String, Object> created = new LinkedHashMap<>();
                created.put("warehouseId", id);
                created.put("warehouseName", stock.getWarehouse().getAddress());
                created.put("stockValue", BigDecimal.ZERO);
                created.put("transfersIn", 0);
                created.put("transfersOut", 0);
                created.put("lowStockItems", 0);
                return created;
            });
            BigDecimal value = ((BigDecimal) row.get("stockValue")).add(stock.getProduct().getCurrentPrice().multiply(BigDecimal.valueOf(stock.getAmount())));
            row.put("stockValue", value);
            if (stock.getAmount() <= LOW_STOCK_THRESHOLD) {
                row.put("lowStockItems", (Integer) row.get("lowStockItems") + 1);
            }
        });
        stockMovementRepository.findAll().forEach(movement -> {
            Map<String, Object> row = rows.get(movement.getWarehouse().getId());
            if (row == null) return;
            if ("TRANSFER_IN".equals(movement.getMovementType())) row.put("transfersIn", (Integer) row.get("transfersIn") + Math.abs(movement.getQuantity()));
            if ("TRANSFER_OUT".equals(movement.getMovementType())) row.put("transfersOut", (Integer) row.get("transfersOut") + Math.abs(movement.getQuantity()));
        });
        return result(new ArrayList<>(rows.values()), Map.of("rowCount", rows.size()));
    }

    public ReportResultResponse<Map<String, Object>> getSupplierPerformance() {
        Map<Integer, BigDecimal> purchases = purchaseInvoiceRepository.findAll().stream()
                .collect(Collectors.groupingBy(invoice -> invoice.getSupplier().getId(), Collectors.reducing(BigDecimal.ZERO, invoice -> invoice.getTotalPrice(), BigDecimal::add)));
        Map<Integer, BigDecimal> returns = returnPurchaseInvoiceRepository.findAll().stream()
                .collect(Collectors.groupingBy(invoice -> invoice.getSupplier().getId(), Collectors.reducing(BigDecimal.ZERO, invoice -> invoice.getTotalPrice(), BigDecimal::add)));
        List<Map<String, Object>> rows = purchaseInvoiceRepository.findAll().stream()
                .map(invoice -> invoice.getSupplier())
                .distinct()
                .map(supplier -> {
                    BigDecimal total = purchases.getOrDefault(supplier.getId(), BigDecimal.ZERO);
                    BigDecimal returned = returns.getOrDefault(supplier.getId(), BigDecimal.ZERO);
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("supplierId", supplier.getId());
                    row.put("supplierName", supplier.getName());
                    row.put("totalPurchases", total);
                    row.put("returnRate", total.signum() == 0 ? BigDecimal.ZERO : returned.multiply(BigDecimal.valueOf(100)).divide(total, 2, RoundingMode.HALF_UP));
                    row.put("onTimeDeliveryRate", null);
                    return row;
                })
                .toList();
        return result(rows, Map.of("rowCount", rows.size()));
    }

    public ReportResultResponse<Map<String, Object>> getCustomerPurchaseHistory() {
        List<Map<String, Object>> rows = salesInvoiceRepository.getCustomerPurchaseHistoryRaw().stream()
                .map(row -> {
                    Map<String, Object> mapped = new LinkedHashMap<>();
                    mapped.put("customerId", row[0]);
                    mapped.put("customerName", row[1]);
                    mapped.put("totalSales", row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO);
                    mapped.put("returnValue", BigDecimal.ZERO);
                    mapped.put("outstandingBalance", BigDecimal.ZERO);
                    mapped.put("lastPurchaseAt", null);
                    return mapped;
                })
                .toList();
        return result(rows, Map.of("rowCount", rows.size()));
    }

    private Map<String, Object> stockRow(ProductWarehouse stock) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("productId", stock.getProduct().getId());
        row.put("productName", stock.getProduct().getName());
        row.put("sku", "");
        row.put("warehouseId", stock.getWarehouse().getId());
        row.put("warehouseName", stock.getWarehouse().getAddress());
        row.put("quantityOnHand", stock.getAmount());
        row.put("reservedQuantity", 0);
        row.put("availableQuantity", stock.getAmount());
        row.put("averageCost", BigDecimal.ZERO);
        row.put("totalValue", stock.getProduct().getCurrentPrice().multiply(BigDecimal.valueOf(stock.getAmount())));
        row.put("reorderLevel", LOW_STOCK_THRESHOLD);
        row.put("preferredSupplierId", stock.getProduct().getSupplier() != null ? stock.getProduct().getSupplier().getId() : null);
        row.put("preferredSupplierName", stock.getProduct().getSupplier() != null ? stock.getProduct().getSupplier().getName() : null);
        row.put("updatedAt", OffsetDateTime.now());
        return row;
    }

    private Map<String, Object> stockMovementRow(StockMovement movement) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", movement.getId());
        row.put("productId", movement.getProduct().getId());
        row.put("productName", movement.getProduct().getName());
        row.put("warehouseId", movement.getWarehouse().getId());
        row.put("warehouseName", movement.getWarehouse().getAddress());
        row.put("movementType", movement.getMovementType());
        row.put("quantity", movement.getQuantity());
        row.put("unitCost", movement.getUnitCost());
        row.put("totalValue", movement.getTotalValue());
        row.put("referenceType", movement.getReferenceType());
        row.put("referenceId", movement.getReferenceId());
        row.put("note", movement.getNote());
        row.put("createdByUserId", movement.getActorUser() != null ? movement.getActorUser().getId() : null);
        row.put("createdByUsername", movement.getActorUser() != null ? movement.getActorUser().getUsername() : null);
        row.put("createdAt", movement.getCreatedAt());
        return row;
    }

    private String topCustomerName() {
        return salesInvoiceRepository.getCustomerPurchaseHistoryRaw().stream()
                .max(Comparator.comparing(row -> new BigDecimal(row[2].toString())))
                .map(row -> (String) row[1])
                .orElse(null);
    }

    private String topSupplierName() {
        return purchaseInvoiceRepository.findAll().stream()
                .collect(Collectors.groupingBy(invoice -> invoice.getSupplier().getName(), Collectors.reducing(BigDecimal.ZERO, invoice -> invoice.getTotalPrice(), BigDecimal::add)))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    private String topReturnReason() {
        return returnSalesInvoiceRepository.findAll().stream()
                .map(invoice -> invoice.getReason() == null || invoice.getReason().isBlank() ? "Unspecified" : invoice.getReason())
                .collect(Collectors.groupingBy(reason -> reason, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    private BigDecimal nullToZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private ReportResultResponse<Map<String, Object>> result(List<Map<String, Object>> rows, Map<String, Object> totals) {
        return new ReportResultResponse<>(rows, totals, OffsetDateTime.now());
    }
}
