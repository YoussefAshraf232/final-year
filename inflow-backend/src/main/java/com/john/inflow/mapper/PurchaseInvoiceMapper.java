package com.john.inflow.mapper;

import com.john.inflow.dto.request.CreatePurchaseInvoiceRequest;
import com.john.inflow.dto.request.item.PurchaseInvoiceItemRequest;
import com.john.inflow.dto.response.PurchaseInvoiceResponse;
import com.john.inflow.dto.response.item.PurchaseInvoiceItemResponse;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.PurchaseInvoice;
import com.john.inflow.entity.PurchaseInvoiceProduct;
import com.john.inflow.entity.PurchaseInvoiceProductId;
import com.john.inflow.entity.Supplier;
import com.john.inflow.entity.User;
import com.john.inflow.entity.Warehouse;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class PurchaseInvoiceMapper {

    private final UserMapper userMapper;
    private final SupplierMapper supplierMapper;
    private final WarehouseMapper warehouseMapper;
    private final ProductMapper productMapper;

    public PurchaseInvoiceMapper(UserMapper userMapper, SupplierMapper supplierMapper, WarehouseMapper warehouseMapper, ProductMapper productMapper) {
        this.userMapper = userMapper;
        this.supplierMapper = supplierMapper;
        this.warehouseMapper = warehouseMapper;
        this.productMapper = productMapper;
    }

    public PurchaseInvoice toEntity(CreatePurchaseInvoiceRequest request, User user, Supplier supplier, Warehouse warehouse) {
        PurchaseInvoice invoice = new PurchaseInvoice();
        invoice.setUser(user);
        invoice.setSupplier(supplier);
        invoice.setWarehouse(warehouse);
        return invoice;
    }

    public PurchaseInvoiceResponse toResponse(PurchaseInvoice invoice) {
        return new PurchaseInvoiceResponse(
                invoice.getId(),
                invoice.getUser() != null ? userMapper.toSummary(invoice.getUser()) : null,
                invoice.getSupplier() != null ? supplierMapper.toResponse(invoice.getSupplier()) : null,
                invoice.getWarehouse() != null ? warehouseMapper.toSummary(invoice.getWarehouse()) : null,
                invoice.getCreatedAt(),
                invoice.getTotalPrice(),
                invoice.getPurchaseInvoiceProducts() != null ? invoice.getPurchaseInvoiceProducts().stream().map(this::itemToResponse).toList() : Collections.emptyList()
        );
    }

    public PurchaseInvoiceProduct itemToEntity(PurchaseInvoiceItemRequest request, PurchaseInvoice invoice, Product product) {
        PurchaseInvoiceProduct item = new PurchaseInvoiceProduct();
        item.setId(new PurchaseInvoiceProductId());
        item.setPurchaseInvoice(invoice);
        item.setProduct(product);
        item.setAmount(request.amount());
        item.setPrice(request.price());
        return item;
    }

    public PurchaseInvoiceItemResponse itemToResponse(PurchaseInvoiceProduct item) {
        return new PurchaseInvoiceItemResponse(
                item.getProduct() != null ? productMapper.toSummary(item.getProduct()) : null,
                item.getAmount(),
                item.getPrice()
        );
    }
}
