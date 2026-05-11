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
import java.util.List;

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
        invoice.setReceiptStatus("PENDING_RECEIPT");
        return invoice;
    }

    public PurchaseInvoiceResponse toResponse(PurchaseInvoice invoice) {
        List<PurchaseInvoiceItemResponse> itemResponses = invoice.getPurchaseInvoiceProducts() != null
                ? invoice.getPurchaseInvoiceProducts().stream().map(this::itemToResponse).toList()
                : Collections.emptyList();

        int totalOrdered = itemResponses.stream().mapToInt(i -> i.amount() != null ? i.amount() : 0).sum();
        int totalReceived = itemResponses.stream().mapToInt(i -> i.receivedQuantity() != null ? i.receivedQuantity() : 0).sum();
        int totalDamaged = itemResponses.stream().mapToInt(i -> i.damagedQuantity() != null ? i.damagedQuantity() : 0).sum();
        int totalMissing = itemResponses.stream().mapToInt(i -> i.missingQuantity() != null ? i.missingQuantity() : 0).sum();

        return new PurchaseInvoiceResponse(
                invoice.getId(),
                invoice.getUser() != null ? userMapper.toSummary(invoice.getUser()) : null,
                invoice.getSupplier() != null ? supplierMapper.toResponse(invoice.getSupplier()) : null,
                invoice.getWarehouse() != null ? warehouseMapper.toSummary(invoice.getWarehouse()) : null,
                invoice.getCreatedAt(),
                invoice.getTotalPrice(),
                invoice.getReceiptStatus(),
                invoice.getReceivedAt(),
                invoice.getReceivedByUser() != null ? userMapper.toSummary(invoice.getReceivedByUser()) : null,
                invoice.getReceivingNotes(),
                totalOrdered,
                totalReceived,
                totalDamaged,
                totalMissing,
                itemResponses
        );
    }

    public PurchaseInvoiceProduct itemToEntity(PurchaseInvoiceItemRequest request, PurchaseInvoice invoice, Product product) {
        PurchaseInvoiceProduct item = new PurchaseInvoiceProduct();
        item.setId(new PurchaseInvoiceProductId());
        item.setPurchaseInvoice(invoice);
        item.setProduct(product);
        item.setAmount(request.amount());
        item.setPrice(request.price());
        item.setReceivedQuantity(0);
        item.setDamagedQuantity(0);
        return item;
    }

    public PurchaseInvoiceItemResponse itemToResponse(PurchaseInvoiceProduct item) {
        int ordered = item.getAmount() != null ? item.getAmount() : 0;
        int received = item.getReceivedQuantity() != null ? item.getReceivedQuantity() : 0;
        int damaged = item.getDamagedQuantity() != null ? item.getDamagedQuantity() : 0;
        int missing = Math.max(0, ordered - received - damaged);
        return new PurchaseInvoiceItemResponse(
                item.getProduct() != null ? productMapper.toSummary(item.getProduct()) : null,
                item.getAmount(),
                item.getPrice(),
                received,
                damaged,
                missing,
                item.getReceivingNotes()
        );
    }
}
