package com.john.inflow.mapper;

import com.john.inflow.dto.request.CreateReturnPurchaseInvoiceRequest;
import com.john.inflow.dto.request.item.ReturnPurchaseInvoiceItemRequest;
import com.john.inflow.dto.response.ReturnPurchaseInvoiceResponse;
import com.john.inflow.dto.response.item.ReturnPurchaseInvoiceItemResponse;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.PurchaseInvoice;
import com.john.inflow.entity.ReturnPurchaseInvoice;
import com.john.inflow.entity.ReturnPurchaseInvoiceProduct;
import com.john.inflow.entity.ReturnPurchaseInvoiceProductId;
import com.john.inflow.entity.Supplier;
import com.john.inflow.entity.User;
import com.john.inflow.entity.Warehouse;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class ReturnPurchaseInvoiceMapper {

    private final UserMapper userMapper;
    private final SupplierMapper supplierMapper;
    private final WarehouseMapper warehouseMapper;
    private final ProductMapper productMapper;

    public ReturnPurchaseInvoiceMapper(UserMapper userMapper, SupplierMapper supplierMapper, WarehouseMapper warehouseMapper, ProductMapper productMapper) {
        this.userMapper = userMapper;
        this.supplierMapper = supplierMapper;
        this.warehouseMapper = warehouseMapper;
        this.productMapper = productMapper;
    }

    public ReturnPurchaseInvoice toEntity(CreateReturnPurchaseInvoiceRequest request, User user, PurchaseInvoice purchaseInvoice, Supplier supplier, Warehouse warehouse) {
        ReturnPurchaseInvoice invoice = new ReturnPurchaseInvoice();
        invoice.setUser(user);
        invoice.setPurchaseInvoice(purchaseInvoice);
        invoice.setSupplier(supplier);
        invoice.setWarehouse(warehouse);
        invoice.setReason(request.reason());
        return invoice;
    }

    public ReturnPurchaseInvoiceResponse toResponse(ReturnPurchaseInvoice invoice) {
        return new ReturnPurchaseInvoiceResponse(
                invoice.getId(),
                invoice.getUser() != null ? userMapper.toSummary(invoice.getUser()) : null,
                invoice.getPurchaseInvoice() != null ? invoice.getPurchaseInvoice().getId() : null,
                invoice.getSupplier() != null ? supplierMapper.toResponse(invoice.getSupplier()) : null,
                invoice.getWarehouse() != null ? warehouseMapper.toSummary(invoice.getWarehouse()) : null,
                invoice.getReturnedAt(),
                invoice.getTotalPrice(),
                invoice.getReason(),
                invoice.getReturnPurchaseInvoiceProducts() != null ? invoice.getReturnPurchaseInvoiceProducts().stream().map(this::itemToResponse).toList() : Collections.emptyList()
        );
    }

    public ReturnPurchaseInvoiceProduct itemToEntity(ReturnPurchaseInvoiceItemRequest request, ReturnPurchaseInvoice invoice, Product product) {
        ReturnPurchaseInvoiceProduct item = new ReturnPurchaseInvoiceProduct();
        item.setId(new ReturnPurchaseInvoiceProductId());
        item.setReturnPurchaseInvoice(invoice);
        item.setProduct(product);
        item.setAmount(request.amount());
        item.setPriceAtReturn(request.priceAtReturn());
        return item;
    }

    public ReturnPurchaseInvoiceItemResponse itemToResponse(ReturnPurchaseInvoiceProduct item) {
        return new ReturnPurchaseInvoiceItemResponse(
                item.getProduct() != null ? productMapper.toSummary(item.getProduct()) : null,
                item.getAmount(),
                item.getPriceAtReturn()
        );
    }
}
