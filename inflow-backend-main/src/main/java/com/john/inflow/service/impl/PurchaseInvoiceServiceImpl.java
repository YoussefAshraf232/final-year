package com.john.inflow.service.impl;

import com.john.inflow.dto.request.CreatePurchaseInvoiceRequest;
import com.john.inflow.dto.request.item.PurchaseInvoiceItemRequest;
import com.john.inflow.dto.response.PurchaseInvoiceResponse;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.ProductWarehouseId;
import com.john.inflow.entity.PurchaseInvoice;
import com.john.inflow.entity.PurchaseInvoiceProduct;
import com.john.inflow.entity.Supplier;
import com.john.inflow.entity.User;
import com.john.inflow.entity.Warehouse;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.PurchaseInvoiceMapper;
import com.john.inflow.repository.ProductRepository;
import com.john.inflow.repository.ProductWarehouseRepository;
import com.john.inflow.repository.PurchaseInvoiceProductRepository;
import com.john.inflow.repository.PurchaseInvoiceRepository;
import com.john.inflow.repository.SupplierRepository;
import com.john.inflow.repository.UserRepository;
import com.john.inflow.repository.WarehouseRepository;
import com.john.inflow.service.PurchaseInvoiceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class PurchaseInvoiceServiceImpl implements PurchaseInvoiceService {

    private final PurchaseInvoiceRepository purchaseInvoiceRepository;
    private final PurchaseInvoiceProductRepository purchaseInvoiceProductRepository;
    private final PurchaseInvoiceMapper purchaseInvoiceMapper;
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final ProductWarehouseRepository productWarehouseRepository;

    public PurchaseInvoiceServiceImpl(
            PurchaseInvoiceRepository purchaseInvoiceRepository,
            PurchaseInvoiceProductRepository purchaseInvoiceProductRepository,
            PurchaseInvoiceMapper purchaseInvoiceMapper,
            UserRepository userRepository,
            SupplierRepository supplierRepository,
            WarehouseRepository warehouseRepository,
            ProductRepository productRepository,
            ProductWarehouseRepository productWarehouseRepository) {
        this.purchaseInvoiceRepository = purchaseInvoiceRepository;
        this.purchaseInvoiceProductRepository = purchaseInvoiceProductRepository;
        this.purchaseInvoiceMapper = purchaseInvoiceMapper;
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.productWarehouseRepository = productWarehouseRepository;
    }

    @Override
    @Transactional
    public PurchaseInvoiceResponse create(CreatePurchaseInvoiceRequest request, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", request.supplierId()));
        
        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", request.warehouseId()));

        PurchaseInvoice invoice = purchaseInvoiceMapper.toEntity(request, user, supplier, warehouse);
        invoice.setTotalPrice(BigDecimal.ZERO);
        PurchaseInvoice savedInvoice = purchaseInvoiceRepository.save(invoice);

        BigDecimal totalPrice = BigDecimal.ZERO;
        for (PurchaseInvoiceItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemRequest.productId()));

            PurchaseInvoiceProduct item = purchaseInvoiceMapper.itemToEntity(itemRequest, savedInvoice, product);
            purchaseInvoiceProductRepository.save(item);

            addStock(product, warehouse, itemRequest.amount());

            BigDecimal lineTotal = itemRequest.price().multiply(BigDecimal.valueOf(itemRequest.amount()));
            totalPrice = totalPrice.add(lineTotal);
        }

        savedInvoice.setTotalPrice(totalPrice);
        purchaseInvoiceRepository.save(savedInvoice);

        PurchaseInvoice refreshed = purchaseInvoiceRepository.findById(savedInvoice.getId())
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseInvoice", savedInvoice.getId()));
        return purchaseInvoiceMapper.toResponse(refreshed);
    }

    @Override
    public PurchaseInvoiceResponse getById(Integer id) {
        PurchaseInvoice invoice = purchaseInvoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseInvoice", id));
        return purchaseInvoiceMapper.toResponse(invoice);
    }

    @Override
    public List<PurchaseInvoiceResponse> getAll() {
        return purchaseInvoiceRepository.findAll().stream()
                .map(purchaseInvoiceMapper::toResponse)
                .toList();
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
}
