package com.john.inflow.service.impl;

import com.john.inflow.dto.request.CreateReturnPurchaseInvoiceRequest;
import com.john.inflow.dto.request.item.ReturnPurchaseInvoiceItemRequest;
import com.john.inflow.dto.response.ReturnPurchaseInvoiceResponse;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.ProductWarehouseId;
import com.john.inflow.entity.PurchaseInvoice;
import com.john.inflow.entity.ReturnPurchaseInvoice;
import com.john.inflow.entity.ReturnPurchaseInvoiceProduct;
import com.john.inflow.entity.Supplier;
import com.john.inflow.entity.User;
import com.john.inflow.entity.Warehouse;
import com.john.inflow.exception.InsufficientStockException;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.ReturnPurchaseInvoiceMapper;
import com.john.inflow.repository.ProductRepository;
import com.john.inflow.repository.ProductWarehouseRepository;
import com.john.inflow.repository.PurchaseInvoiceRepository;
import com.john.inflow.repository.ReturnPurchaseInvoiceProductRepository;
import com.john.inflow.repository.ReturnPurchaseInvoiceRepository;
import com.john.inflow.repository.SupplierRepository;
import com.john.inflow.repository.UserRepository;
import com.john.inflow.repository.WarehouseRepository;
import com.john.inflow.service.ReturnPurchaseInvoiceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReturnPurchaseInvoiceServiceImpl implements ReturnPurchaseInvoiceService {

    private final ReturnPurchaseInvoiceRepository returnPurchaseInvoiceRepository;
    private final ReturnPurchaseInvoiceProductRepository returnPurchaseInvoiceProductRepository;
    private final ReturnPurchaseInvoiceMapper returnPurchaseInvoiceMapper;
    private final UserRepository userRepository;
    private final PurchaseInvoiceRepository purchaseInvoiceRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final ProductWarehouseRepository productWarehouseRepository;

    public ReturnPurchaseInvoiceServiceImpl(
            ReturnPurchaseInvoiceRepository returnPurchaseInvoiceRepository,
            ReturnPurchaseInvoiceProductRepository returnPurchaseInvoiceProductRepository,
            ReturnPurchaseInvoiceMapper returnPurchaseInvoiceMapper,
            UserRepository userRepository,
            PurchaseInvoiceRepository purchaseInvoiceRepository,
            SupplierRepository supplierRepository,
            WarehouseRepository warehouseRepository,
            ProductRepository productRepository,
            ProductWarehouseRepository productWarehouseRepository) {
        this.returnPurchaseInvoiceRepository = returnPurchaseInvoiceRepository;
        this.returnPurchaseInvoiceProductRepository = returnPurchaseInvoiceProductRepository;
        this.returnPurchaseInvoiceMapper = returnPurchaseInvoiceMapper;
        this.userRepository = userRepository;
        this.purchaseInvoiceRepository = purchaseInvoiceRepository;
        this.supplierRepository = supplierRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.productWarehouseRepository = productWarehouseRepository;
    }

    @Override
    @Transactional
    public ReturnPurchaseInvoiceResponse create(CreateReturnPurchaseInvoiceRequest request, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", request.supplierId()));
        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", request.warehouseId()));

        PurchaseInvoice purchaseInvoice = null;
        if (request.purchaseInvoiceId() != null) {
            purchaseInvoice = purchaseInvoiceRepository.findById(request.purchaseInvoiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("PurchaseInvoice", request.purchaseInvoiceId()));
        }

        ReturnPurchaseInvoice invoice = returnPurchaseInvoiceMapper.toEntity(request, user, purchaseInvoice, supplier, warehouse);
        invoice.setTotalPrice(BigDecimal.ZERO);
        ReturnPurchaseInvoice savedInvoice = returnPurchaseInvoiceRepository.save(invoice);

        BigDecimal totalPrice = BigDecimal.ZERO;
        for (ReturnPurchaseInvoiceItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemRequest.productId()));

            ReturnPurchaseInvoiceProduct item = returnPurchaseInvoiceMapper.itemToEntity(itemRequest, savedInvoice, product);
            returnPurchaseInvoiceProductRepository.save(item);

            removeStock(product, warehouse, itemRequest.amount());

            BigDecimal lineTotal = itemRequest.priceAtReturn().multiply(BigDecimal.valueOf(itemRequest.amount()));
            totalPrice = totalPrice.add(lineTotal);
        }

        savedInvoice.setTotalPrice(totalPrice);
        returnPurchaseInvoiceRepository.save(savedInvoice);

        ReturnPurchaseInvoice refreshed = returnPurchaseInvoiceRepository.findById(savedInvoice.getId())
                .orElseThrow(() -> new ResourceNotFoundException("ReturnPurchaseInvoice", savedInvoice.getId()));
        return returnPurchaseInvoiceMapper.toResponse(refreshed);
    }

    @Override
    public ReturnPurchaseInvoiceResponse getById(Integer id) {
        ReturnPurchaseInvoice invoice = returnPurchaseInvoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReturnPurchaseInvoice", id));
        return returnPurchaseInvoiceMapper.toResponse(invoice);
    }

    @Override
    public List<ReturnPurchaseInvoiceResponse> getAll() {
        return returnPurchaseInvoiceRepository.findAll().stream()
                .map(returnPurchaseInvoiceMapper::toResponse)
                .toList();
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
