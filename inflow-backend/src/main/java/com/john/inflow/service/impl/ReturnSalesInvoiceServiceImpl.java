package com.john.inflow.service.impl;

import com.john.inflow.dto.request.CreateReturnSalesInvoiceRequest;
import com.john.inflow.dto.request.item.ReturnSalesInvoiceItemRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.ReturnSalesInvoiceResponse;
import com.john.inflow.dto.response.ReturnSalesSummaryResponse;
import com.john.inflow.entity.Customer;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.ProductWarehouseId;
import com.john.inflow.entity.ReturnSalesInvoice;
import com.john.inflow.entity.ReturnSalesInvoiceProduct;
import com.john.inflow.entity.SalesInvoice;
import com.john.inflow.entity.SalesInvoiceProduct;
import com.john.inflow.entity.User;
import com.john.inflow.entity.Warehouse;
import com.john.inflow.exception.InvalidOperationException;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.ReturnSalesInvoiceMapper;
import com.john.inflow.repository.CustomerRepository;
import com.john.inflow.repository.ProductRepository;
import com.john.inflow.repository.ProductWarehouseRepository;
import com.john.inflow.repository.ReturnSalesInvoiceProductRepository;
import com.john.inflow.repository.ReturnSalesInvoiceRepository;
import com.john.inflow.repository.SalesInvoiceRepository;
import com.john.inflow.repository.UserRepository;
import com.john.inflow.repository.WarehouseRepository;
import com.john.inflow.service.AuditLogService;
import com.john.inflow.service.ReturnSalesInvoiceService;
import com.john.inflow.service.StockMovementService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReturnSalesInvoiceServiceImpl implements ReturnSalesInvoiceService {
    private final ReturnSalesInvoiceRepository returnSalesInvoiceRepository;
    private final ReturnSalesInvoiceProductRepository returnSalesInvoiceProductRepository;
    private final ReturnSalesInvoiceMapper returnSalesInvoiceMapper;
    private final UserRepository userRepository;
    private final SalesInvoiceRepository salesInvoiceRepository;
    private final CustomerRepository customerRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final ProductWarehouseRepository productWarehouseRepository;
    private final StockMovementService stockMovementService;
    private final AuditLogService auditLogService;

    public ReturnSalesInvoiceServiceImpl(
            ReturnSalesInvoiceRepository returnSalesInvoiceRepository,
            ReturnSalesInvoiceProductRepository returnSalesInvoiceProductRepository,
            ReturnSalesInvoiceMapper returnSalesInvoiceMapper,
            UserRepository userRepository,
            SalesInvoiceRepository salesInvoiceRepository,
            CustomerRepository customerRepository,
            WarehouseRepository warehouseRepository,
            ProductRepository productRepository,
            ProductWarehouseRepository productWarehouseRepository,
            StockMovementService stockMovementService,
            AuditLogService auditLogService) {
        this.returnSalesInvoiceRepository = returnSalesInvoiceRepository;
        this.returnSalesInvoiceProductRepository = returnSalesInvoiceProductRepository;
        this.returnSalesInvoiceMapper = returnSalesInvoiceMapper;
        this.userRepository = userRepository;
        this.salesInvoiceRepository = salesInvoiceRepository;
        this.customerRepository = customerRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.productWarehouseRepository = productWarehouseRepository;
        this.stockMovementService = stockMovementService;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public ReturnSalesInvoiceResponse create(CreateReturnSalesInvoiceRequest request, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        SalesInvoice salesInvoice = salesInvoiceRepository.findById(request.salesInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("SalesInvoice", request.salesInvoiceId()));
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.customerId()));
        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", request.warehouseId()));
        if (!salesInvoice.getCustomer().getId().equals(customer.getId())) {
            throw new InvalidOperationException("Return customer must match the original invoice customer");
        }

        ReturnSalesInvoice invoice = returnSalesInvoiceMapper.toEntity(request, user, salesInvoice, customer, warehouse);
        invoice.setTotalPrice(BigDecimal.ZERO);
        ReturnSalesInvoice savedInvoice = returnSalesInvoiceRepository.save(invoice);

        BigDecimal totalPrice = BigDecimal.ZERO;
        for (ReturnSalesInvoiceItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemRequest.productId()));
            SalesInvoiceProduct soldItem = salesInvoice.getSalesInvoiceProducts().stream()
                    .filter(item -> item.getProduct().getId().equals(product.getId()))
                    .findFirst()
                    .orElseThrow(() -> new InvalidOperationException("Product was not sold on the original invoice"));
            int alreadyReturned = returnSalesInvoiceProductRepository.sumReturnedQuantity(salesInvoice.getId(), product.getId());
            int remaining = soldItem.getAmount() - alreadyReturned;
            if (itemRequest.amount() > remaining) {
                throw new InvalidOperationException("Returned quantity exceeds remaining sold quantity for " + product.getName());
            }
            ReturnSalesInvoiceProduct item = returnSalesInvoiceMapper.itemToEntity(itemRequest, savedInvoice, product);
            returnSalesInvoiceProductRepository.save(item);
            totalPrice = totalPrice.add(itemRequest.priceAtReturn().multiply(BigDecimal.valueOf(itemRequest.amount())));
        }

        savedInvoice.setTotalPrice(totalPrice);
        returnSalesInvoiceRepository.save(savedInvoice);
        auditLogService.log(user, "CREATE", "RETURN_SALES_INVOICE", savedInvoice.getId(), "totalPrice=" + totalPrice);
        return returnSalesInvoiceMapper.toResponse(requireInvoice(savedInvoice.getId()));
    }

    @Override
    public ReturnSalesInvoiceResponse getById(Integer id) {
        return returnSalesInvoiceMapper.toResponse(requireInvoice(id));
    }

    @Override
    public List<ReturnSalesInvoiceResponse> getAll() {
        return returnSalesInvoiceRepository.findAll().stream()
                .map(returnSalesInvoiceMapper::toResponse)
                .toList();
    }

    @Override
    public PageResponse<ReturnSalesInvoiceResponse> search(String search, String returnStatus, String restockStatus, String refundStatus, OffsetDateTime dateFrom, OffsetDateTime dateTo, Integer warehouseId, Integer customerId, int page, int size) {
        String normalizedSearch = blankToNull(search);
        OffsetDateTime effectiveDateFrom = dateFrom != null ? dateFrom : OffsetDateTime.parse("1970-01-01T00:00:00Z");
        OffsetDateTime effectiveDateTo = dateTo != null ? dateTo : OffsetDateTime.parse("9999-12-31T23:59:59Z");
        if (normalizedSearch == null) {
            return PageResponse.of(returnSalesInvoiceRepository.searchWithoutText(
                    blankToNull(returnStatus),
                    blankToNull(restockStatus),
                    blankToNull(refundStatus),
                    warehouseId,
                    customerId,
                    effectiveDateFrom,
                    effectiveDateTo,
                    PageRequest.of(page, size)
            ).map(returnSalesInvoiceMapper::toResponse));
        }
        return PageResponse.of(returnSalesInvoiceRepository.search(
                normalizedSearch,
                parseId(normalizedSearch),
                blankToNull(returnStatus),
                blankToNull(restockStatus),
                blankToNull(refundStatus),
                warehouseId,
                customerId,
                effectiveDateFrom,
                effectiveDateTo,
                PageRequest.of(page, size)
        ).map(returnSalesInvoiceMapper::toResponse));
    }

    @Override
    public ReturnSalesSummaryResponse summary() {
        OffsetDateTime start = LocalDate.now(ZoneOffset.UTC).atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime end = start.plusDays(1);
        return new ReturnSalesSummaryResponse(
                returnSalesInvoiceRepository.sumToday(start, end),
                returnSalesInvoiceRepository.countByReturnStatus("PENDING_REVIEW"),
                returnSalesInvoiceRepository.sumRefunded(),
                returnSalesInvoiceRepository.countByRestockStatus("PENDING_RESTOCK") + returnSalesInvoiceRepository.countByRestockStatus("AWAITING_INSPECTION")
        );
    }

    @Override
    @Transactional
    public ReturnSalesInvoiceResponse approve(Integer id, Integer userId) {
        ReturnSalesInvoice invoice = requireInvoice(id);
        if (!"PENDING_REVIEW".equals(invoice.getReturnStatus())) {
            return returnSalesInvoiceMapper.toResponse(invoice);
        }
        User user = requireUser(userId);
        invoice.setReturnStatus("APPROVED");
        invoice.setApprovedAt(OffsetDateTime.now());
        invoice.setApprovedBy(user);
        auditLogService.log(user, "APPROVE", "RETURN_SALES_INVOICE", invoice.getId(), null);
        return returnSalesInvoiceMapper.toResponse(invoice);
    }

    @Override
    @Transactional
    public ReturnSalesInvoiceResponse reject(Integer id, Integer userId) {
        ReturnSalesInvoice invoice = requireInvoice(id);
        if (!"PENDING_REVIEW".equals(invoice.getReturnStatus())) {
            throw new InvalidOperationException("Only pending returns can be rejected");
        }
        User user = requireUser(userId);
        invoice.setReturnStatus("REJECTED");
        invoice.setRestockStatus("NOT_RESTOCKED");
        invoice.setRefundStatus("NO_REFUND");
        auditLogService.log(user, "REJECT", "RETURN_SALES_INVOICE", invoice.getId(), null);
        return returnSalesInvoiceMapper.toResponse(invoice);
    }

    @Override
    @Transactional
    public ReturnSalesInvoiceResponse restock(Integer id, Integer userId) {
        ReturnSalesInvoice invoice = requireInvoice(id);
        if (!"APPROVED".equals(invoice.getReturnStatus()) && !"REFUNDED".equals(invoice.getReturnStatus())) {
            throw new InvalidOperationException("Return must be approved before restocking");
        }
        User user = requireUser(userId);
        int restockedItems = 0;
        for (ReturnSalesInvoiceProduct item : invoice.getReturnSalesInvoiceProducts()) {
            if (item.getRestockedQuantity() >= item.getAmount()) {
                continue;
            }
            boolean blockedFromRestock = "DAMAGED".equals(item.getCondition()) || "NOT_RESTOCKABLE".equals(item.getRestockDecision());
            if (blockedFromRestock) {
                continue;
            }
            addStock(item.getProduct(), invoice.getWarehouse(), item.getAmount());
            item.setRestockedQuantity(item.getAmount());
            returnSalesInvoiceProductRepository.save(item);
            stockMovementService.record(item.getProduct(), invoice.getWarehouse(), "CUSTOMER_RETURN", item.getAmount(), item.getPriceAtReturn(), "RETURN_INVOICE", invoice.getId(), "Customer return restock", user);
            restockedItems++;
        }
        invoice.setRestockStatus(restockedItems > 0 ? "RESTOCKED" : "NOT_RESTOCKED");
        invoice.setRestockedAt(OffsetDateTime.now());
        auditLogService.log(user, "RESTOCK", "RETURN_SALES_INVOICE", invoice.getId(), "items=" + restockedItems);
        return returnSalesInvoiceMapper.toResponse(invoice);
    }

    @Override
    @Transactional
    public ReturnSalesInvoiceResponse refund(Integer id, Integer userId) {
        ReturnSalesInvoice invoice = requireInvoice(id);
        if (!"APPROVED".equals(invoice.getReturnStatus())) {
            throw new InvalidOperationException("Return must be approved before refund");
        }
        User user = requireUser(userId);
        invoice.setRefundStatus("STORE_CREDIT".equals(invoice.getRefundMethod()) ? "CREDIT_ISSUED" : "REFUNDED");
        invoice.setReturnStatus("REFUNDED");
        invoice.setRefundedAt(OffsetDateTime.now());
        auditLogService.log(user, "REFUND", "RETURN_SALES_INVOICE", invoice.getId(), "amount=" + invoice.getTotalPrice());
        return returnSalesInvoiceMapper.toResponse(invoice);
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        throw new InvalidOperationException("Return invoices cannot be hard-deleted. Reject pending returns instead.");
    }

    private ReturnSalesInvoice requireInvoice(Integer id) {
        return returnSalesInvoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReturnSalesInvoice", id));
    }

    private User requireUser(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    private void addStock(Product product, Warehouse warehouse, int amount) {
        ProductWarehouseId pwId = new ProductWarehouseId(product.getId(), warehouse.getId());
        ProductWarehouse pw = productWarehouseRepository.findById(pwId).orElse(null);
        if (pw == null) {
            pw = new ProductWarehouse();
            pw.setId(pwId);
            pw.setProduct(product);
            pw.setWarehouse(warehouse);
            pw.setAmount(amount);
        } else {
            pw.setAmount(pw.getAmount() + amount);
        }
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
