package com.john.inflow.service.impl;

import com.john.inflow.dto.request.CreateSalesInvoiceRequest;
import com.john.inflow.dto.request.item.SalesInvoiceItemRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.SalesInvoiceResponse;
import com.john.inflow.entity.Customer;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.ProductWarehouseId;
import com.john.inflow.entity.SalesInvoice;
import com.john.inflow.entity.SalesInvoiceProduct;
import com.john.inflow.entity.User;
import com.john.inflow.entity.Warehouse;
import com.john.inflow.exception.InsufficientStockException;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.SalesInvoiceMapper;
import com.john.inflow.repository.CustomerRepository;
import com.john.inflow.repository.ProductRepository;
import com.john.inflow.repository.ProductWarehouseRepository;
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

@Service
@Transactional(readOnly = true)
public class SalesInvoiceServiceImpl implements SalesInvoiceService {

    private final SalesInvoiceRepository salesInvoiceRepository;
    private final SalesInvoiceProductRepository salesInvoiceProductRepository;
    private final SalesInvoiceMapper salesInvoiceMapper;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final ProductWarehouseRepository productWarehouseRepository;
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
        CreateSalesInvoiceRequest normalized = new CreateSalesInvoiceRequest(
                request.customerId(),
                request.warehouseId(),
                discount,
                request.items()
        );

        SalesInvoice invoice = salesInvoiceMapper.toEntity(normalized, user, customer, warehouse);
        invoice.setTotalPrice(BigDecimal.ZERO);
        SalesInvoice savedInvoice = salesInvoiceRepository.save(invoice);

        BigDecimal totalPrice = BigDecimal.ZERO;
        for (SalesInvoiceItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemRequest.productId()));

            SalesInvoiceProduct item = salesInvoiceMapper.itemToEntity(itemRequest, savedInvoice, product);
            salesInvoiceProductRepository.save(item);

            removeStock(product, warehouse, itemRequest.amount());
            stockMovementService.record(product, warehouse, "SALE", -itemRequest.amount(), itemRequest.sellingPrice(), "SALES_INVOICE", savedInvoice.getId(), null, user);

            BigDecimal lineTotal = itemRequest.sellingPrice().multiply(BigDecimal.valueOf(itemRequest.amount()));
            totalPrice = totalPrice.add(lineTotal);
        }

        savedInvoice.setTotalPrice(totalPrice);
        salesInvoiceRepository.save(savedInvoice);
        auditLogService.log(user, "CREATE", "SALES_INVOICE", savedInvoice.getId(), "totalPrice=" + totalPrice);

        SalesInvoice refreshed = salesInvoiceRepository.findById(savedInvoice.getId())
                .orElseThrow(() -> new ResourceNotFoundException("SalesInvoice", savedInvoice.getId()));
        return salesInvoiceMapper.toResponse(refreshed);
    }

    @Override
    public SalesInvoiceResponse getById(Integer id) {
        SalesInvoice invoice = salesInvoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesInvoice", id));
        return salesInvoiceMapper.toResponse(invoice);
    }

    @Override
    public PageResponse<SalesInvoiceResponse> getAll(int page, int size) {
        return PageResponse.of(salesInvoiceRepository.findAll(PageRequest.of(page, size)).map(salesInvoiceMapper::toResponse));
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        var entity = salesInvoiceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("SalesInvoice", id));
        salesInvoiceRepository.delete(entity);
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
}
