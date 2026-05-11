package com.john.inflow.service.impl;

import com.john.inflow.dto.request.CreateSalesInvoiceRequest;
import com.john.inflow.dto.request.item.SalesInvoiceItemRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.SalesInvoiceResponse;
import com.john.inflow.dto.response.SalesManagementSummaryResponse;
import com.john.inflow.entity.Customer;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.ProductWarehouseId;
import com.john.inflow.entity.SalesInvoice;
import com.john.inflow.entity.SalesInvoiceProduct;
import com.john.inflow.entity.User;
import com.john.inflow.entity.Warehouse;
import com.john.inflow.exception.InsufficientStockException;
import com.john.inflow.exception.InvalidOperationException;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.SalesInvoiceMapper;
import com.john.inflow.repository.CustomerRepository;
import com.john.inflow.repository.ProductRepository;
import com.john.inflow.repository.ProductWarehouseRepository;
import com.john.inflow.repository.ReturnSalesInvoiceRepository;
import com.john.inflow.repository.SalesInvoiceProductRepository;
import com.john.inflow.repository.SalesInvoiceRepository;
import com.john.inflow.repository.UserRepository;
import com.john.inflow.repository.WarehouseRepository;
import com.john.inflow.service.AuditLogService;
import com.john.inflow.service.SalesInvoiceService;
import com.john.inflow.service.StockMovementService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Service
@Transactional(readOnly = true)
public class SalesInvoiceServiceImpl implements SalesInvoiceService {
    private static final int LOW_STOCK_THRESHOLD = 10;

    private final SalesInvoiceRepository salesInvoiceRepository;
    private final SalesInvoiceProductRepository salesInvoiceProductRepository;
    private final SalesInvoiceMapper salesInvoiceMapper;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final ProductWarehouseRepository productWarehouseRepository;
    private final ReturnSalesInvoiceRepository returnSalesInvoiceRepository;
    private final StockMovementService stockMovementService;
    private final AuditLogService auditLogService;

    public SalesInvoiceServiceImpl(
            SalesInvoiceRepository salesInvoiceRepository,
            SalesInvoiceProductRepository salesInvoiceProductRepository,
            SalesInvoiceMapper salesInvoiceMapper,
            UserRepository userRepository,
            CustomerRepository customerRepository,
            WarehouseRepository warehouseRepository,
            ProductRepository productRepository,
            ProductWarehouseRepository productWarehouseRepository,
            ReturnSalesInvoiceRepository returnSalesInvoiceRepository,
            StockMovementService stockMovementService,
            AuditLogService auditLogService) {
        this.salesInvoiceRepository = salesInvoiceRepository;
        this.salesInvoiceProductRepository = salesInvoiceProductRepository;
        this.salesInvoiceMapper = salesInvoiceMapper;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.productWarehouseRepository = productWarehouseRepository;
        this.returnSalesInvoiceRepository = returnSalesInvoiceRepository;
        this.stockMovementService = stockMovementService;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public SalesInvoiceResponse create(CreateSalesInvoiceRequest request, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.customerId()));
        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", request.warehouseId()));

        BigDecimal discount = request.discount() != null ? request.discount() : BigDecimal.ZERO;
        SalesInvoice invoice = salesInvoiceMapper.toEntity(request, user, customer, warehouse);
        invoice.setDiscount(discount);
        invoice.setTotalPrice(BigDecimal.ZERO);
        SalesInvoice savedInvoice = salesInvoiceRepository.save(invoice);

        BigDecimal subtotal = BigDecimal.ZERO;
        for (SalesInvoiceItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemRequest.productId()));
            SalesInvoiceProduct item = salesInvoiceMapper.itemToEntity(itemRequest, savedInvoice, product);
            salesInvoiceProductRepository.save(item);
            removeStock(product, warehouse, itemRequest.amount());
            stockMovementService.record(product, warehouse, "SALE", -itemRequest.amount(), itemRequest.sellingPrice(), "SALES_INVOICE", savedInvoice.getId(), null, user);
            subtotal = subtotal.add(itemRequest.sellingPrice().multiply(BigDecimal.valueOf(itemRequest.amount())));
        }

        if (discount.compareTo(subtotal) > 0) {
            throw new InvalidOperationException("Discount cannot exceed sale subtotal");
        }
        BigDecimal totalPrice = subtotal.subtract(discount);
        BigDecimal paidAmount = request.paidAmount() != null ? request.paidAmount() : totalPrice;
        if (paidAmount.compareTo(totalPrice) > 0) {
            paidAmount = totalPrice;
        }
        savedInvoice.setTotalPrice(totalPrice);
        savedInvoice.setPaidAmount(paidAmount);
        savedInvoice.setBalanceDue(totalPrice.subtract(paidAmount));
        savedInvoice.setStatus(request.status() != null ? request.status() : (savedInvoice.getBalanceDue().compareTo(BigDecimal.ZERO) == 0 ? "PAID" : "PENDING"));
        salesInvoiceRepository.save(savedInvoice);
        auditLogService.log(user, "CREATE", "SALES_INVOICE", savedInvoice.getId(), "totalPrice=" + totalPrice);
        return salesInvoiceMapper.toResponse(requireInvoice(savedInvoice.getId()));
    }

    @Override
    public SalesInvoiceResponse getById(Integer id) {
        return salesInvoiceMapper.toResponse(requireInvoice(id));
    }

    @Override
    public PageResponse<SalesInvoiceResponse> getAll(int page, int size) {
        return search(null, null, null, null, null, null, page, size);
    }

    @Override
    public PageResponse<SalesInvoiceResponse> search(String search, String status, OffsetDateTime dateFrom, OffsetDateTime dateTo, Integer warehouseId, Integer customerId, int page, int size) {
        String normalizedSearch = blankToNull(search);
        OffsetDateTime effectiveDateFrom = dateFrom != null ? dateFrom : OffsetDateTime.parse("1970-01-01T00:00:00Z");
        OffsetDateTime effectiveDateTo = dateTo != null ? dateTo : OffsetDateTime.parse("9999-12-31T23:59:59Z");
        if (normalizedSearch == null) {
            return PageResponse.of(salesInvoiceRepository.searchWithoutText(
                    blankToNull(status),
                    warehouseId,
                    customerId,
                    effectiveDateFrom,
                    effectiveDateTo,
                    PageRequest.of(page, size)
            ).map(salesInvoiceMapper::toResponse));
        }
        return PageResponse.of(salesInvoiceRepository.search(
                normalizedSearch,
                parseId(normalizedSearch),
                blankToNull(status),
                warehouseId,
                customerId,
                effectiveDateFrom,
                effectiveDateTo,
                PageRequest.of(page, size)
        ).map(salesInvoiceMapper::toResponse));
    }

    @Override
    public SalesManagementSummaryResponse summary() {
        OffsetDateTime start = LocalDate.now(ZoneOffset.UTC).atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime end = start.plusDays(1);
        return new SalesManagementSummaryResponse(
                salesInvoiceRepository.sumToday(start, end),
                salesInvoiceRepository.countByStatus("PENDING"),
                returnSalesInvoiceRepository.sumToday(start, end),
                productWarehouseRepository.countLowStock(LOW_STOCK_THRESHOLD)
        );
    }

    @Override
    @Transactional
    public SalesInvoiceResponse voidInvoice(Integer id, Integer userId) {
        SalesInvoice invoice = requireInvoice(id);
        if ("CANCELLED".equals(invoice.getStatus())) {
            return salesInvoiceMapper.toResponse(invoice);
        }
        if (returnSalesInvoiceRepository.existsBySalesInvoiceId(id)) {
            throw new InvalidOperationException("Cannot void a sale that has returns");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        invoice.getSalesInvoiceProducts().forEach(item -> {
            Product product = item.getProduct();
            ProductWarehouse pw = productWarehouseRepository.findById(new ProductWarehouseId(product.getId(), invoice.getWarehouse().getId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Stock", product.getId() + ":" + invoice.getWarehouse().getId()));
            pw.setAmount(pw.getAmount() + item.getAmount());
            productWarehouseRepository.save(pw);
            stockMovementService.record(product, invoice.getWarehouse(), "SALE_VOID", item.getAmount(), item.getSellingPrice(), "SALES_INVOICE", invoice.getId(), "Sale voided", user);
        });
        invoice.setStatus("CANCELLED");
        invoice.setBalanceDue(BigDecimal.ZERO);
        invoice.setVoidedAt(OffsetDateTime.now());
        invoice.setVoidedBy(user);
        auditLogService.log(user, "VOID", "SALES_INVOICE", invoice.getId(), null);
        return salesInvoiceMapper.toResponse(invoice);
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        throw new InvalidOperationException("Sales invoices cannot be hard-deleted. Use void instead.");
    }

    private SalesInvoice requireInvoice(Integer id) {
        return salesInvoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesInvoice", id));
    }

    private void removeStock(Product product, Warehouse warehouse, int requested) {
        ProductWarehouseId pwId = new ProductWarehouseId(product.getId(), warehouse.getId());
        ProductWarehouse pw = productWarehouseRepository.findById(pwId).orElse(null);
        int available = (pw != null) ? pw.getAmount() : 0;
        if (available < requested) {
            throw new InsufficientStockException(product.getName(), warehouse.getId(), requested, available);
        }
        pw.setAmount(available - requested);
        productWarehouseRepository.save(pw);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private Integer parseId(String value) {
        if (value == null) {
            return null;
        }
        String digits = value.replaceAll("\\D+", "");
        if (digits.isBlank()) {
            return null;
        }
        try {
            return Integer.parseInt(digits);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
