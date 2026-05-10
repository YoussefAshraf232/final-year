package com.john.inflow.service.impl;

import com.john.inflow.dto.request.CreateInternalInvoiceRequest;
import com.john.inflow.dto.request.item.InternalInvoiceItemRequest;
import com.john.inflow.dto.response.InternalInvoiceResponse;
import com.john.inflow.entity.InternalInvoice;
import com.john.inflow.entity.InternalInvoiceProduct;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.ProductWarehouseId;
import com.john.inflow.entity.User;
import com.john.inflow.entity.Warehouse;
import com.john.inflow.exception.InsufficientStockException;
import com.john.inflow.exception.InvalidOperationException;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.InternalInvoiceMapper;
import com.john.inflow.repository.InternalInvoiceProductRepository;
import com.john.inflow.repository.InternalInvoiceRepository;
import com.john.inflow.repository.ProductRepository;
import com.john.inflow.repository.ProductWarehouseRepository;
import com.john.inflow.repository.UserRepository;
import com.john.inflow.repository.WarehouseRepository;
import com.john.inflow.service.AuditLogService;
import com.john.inflow.service.InternalInvoiceService;
import com.john.inflow.service.StockMovementService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class InternalInvoiceServiceImpl implements InternalInvoiceService {

    private final InternalInvoiceRepository internalInvoiceRepository;
    private final InternalInvoiceProductRepository internalInvoiceProductRepository;
    private final InternalInvoiceMapper internalInvoiceMapper;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final ProductWarehouseRepository productWarehouseRepository;
    private final StockMovementService stockMovementService;
    private final AuditLogService auditLogService;

    public InternalInvoiceServiceImpl(
            InternalInvoiceRepository internalInvoiceRepository,
            InternalInvoiceProductRepository internalInvoiceProductRepository,
            InternalInvoiceMapper internalInvoiceMapper,
            UserRepository userRepository,
            WarehouseRepository warehouseRepository,
            ProductRepository productRepository,
            ProductWarehouseRepository productWarehouseRepository,
            StockMovementService stockMovementService,
            AuditLogService auditLogService) {
        this.internalInvoiceRepository = internalInvoiceRepository;
        this.internalInvoiceProductRepository = internalInvoiceProductRepository;
        this.internalInvoiceMapper = internalInvoiceMapper;
        this.userRepository = userRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.productWarehouseRepository = productWarehouseRepository;
        this.stockMovementService = stockMovementService;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public InternalInvoiceResponse create(CreateInternalInvoiceRequest request, Integer userId) {
        if (request.sourceWarehouseId().equals(request.destinationWarehouseId())) {
            throw new InvalidOperationException("Source and destination warehouses must be different");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Warehouse sourceWarehouse = warehouseRepository.findById(request.sourceWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", request.sourceWarehouseId()));
        Warehouse destinationWarehouse = warehouseRepository.findById(request.destinationWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", request.destinationWarehouseId()));

        InternalInvoice invoice = internalInvoiceMapper.toEntity(request, user, sourceWarehouse, destinationWarehouse);
        InternalInvoice savedInvoice = internalInvoiceRepository.save(invoice);

        for (InternalInvoiceItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemRequest.productId()));

            InternalInvoiceProduct item = internalInvoiceMapper.itemToEntity(itemRequest, savedInvoice, product);
            internalInvoiceProductRepository.save(item);

            removeStock(product, sourceWarehouse, itemRequest.amount());
            stockMovementService.record(product, sourceWarehouse, "TRANSFER_OUT", -itemRequest.amount(), null, "INTERNAL_INVOICE", savedInvoice.getId(), null, user);
            addStock(product, destinationWarehouse, itemRequest.amount());
            stockMovementService.record(product, destinationWarehouse, "TRANSFER_IN", itemRequest.amount(), null, "INTERNAL_INVOICE", savedInvoice.getId(), null, user);
        }
        auditLogService.log(user, "CREATE", "INTERNAL_INVOICE", savedInvoice.getId(), "source=" + sourceWarehouse.getId() + ",destination=" + destinationWarehouse.getId());

        InternalInvoice refreshed = internalInvoiceRepository.findById(savedInvoice.getId())
                .orElseThrow(() -> new ResourceNotFoundException("InternalInvoice", savedInvoice.getId()));
        return internalInvoiceMapper.toResponse(refreshed);
    }

    @Override
    public InternalInvoiceResponse getById(Integer id) {
        InternalInvoice invoice = internalInvoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InternalInvoice", id));
        return internalInvoiceMapper.toResponse(invoice);
    }

    @Override
    public List<InternalInvoiceResponse> getAll() {
        return internalInvoiceRepository.findAll().stream()
                .map(internalInvoiceMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        var entity = internalInvoiceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("InternalInvoice", id));
        internalInvoiceRepository.delete(entity);
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
