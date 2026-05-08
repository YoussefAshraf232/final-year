package com.john.inflow.mapper;

import com.john.inflow.dto.request.CreateInternalInvoiceRequest;
import com.john.inflow.dto.request.item.InternalInvoiceItemRequest;
import com.john.inflow.dto.response.InternalInvoiceResponse;
import com.john.inflow.dto.response.item.InternalInvoiceItemResponse;
import com.john.inflow.entity.InternalInvoice;
import com.john.inflow.entity.InternalInvoiceProduct;
import com.john.inflow.entity.InternalInvoiceProductId;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.User;
import com.john.inflow.entity.Warehouse;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class InternalInvoiceMapper {

    private final UserMapper userMapper;
    private final WarehouseMapper warehouseMapper;
    private final ProductMapper productMapper;

    public InternalInvoiceMapper(UserMapper userMapper, WarehouseMapper warehouseMapper, ProductMapper productMapper) {
        this.userMapper = userMapper;
        this.warehouseMapper = warehouseMapper;
        this.productMapper = productMapper;
    }

    public InternalInvoice toEntity(CreateInternalInvoiceRequest request, User user, Warehouse sourceWarehouse, Warehouse destinationWarehouse) {
        InternalInvoice invoice = new InternalInvoice();
        invoice.setUser(user);
        invoice.setSourceWarehouse(sourceWarehouse);
        invoice.setDestinationWarehouse(destinationWarehouse);
        return invoice;
    }

    public InternalInvoiceResponse toResponse(InternalInvoice invoice) {
        return new InternalInvoiceResponse(
                invoice.getId(),
                invoice.getUser() != null ? userMapper.toSummary(invoice.getUser()) : null,
                invoice.getSourceWarehouse() != null ? warehouseMapper.toSummary(invoice.getSourceWarehouse()) : null,
                invoice.getDestinationWarehouse() != null ? warehouseMapper.toSummary(invoice.getDestinationWarehouse()) : null,
                invoice.getCreatedAt(),
                invoice.getInternalInvoiceProducts() != null ? invoice.getInternalInvoiceProducts().stream().map(this::itemToResponse).toList() : Collections.emptyList()
        );
    }

    public InternalInvoiceProduct itemToEntity(InternalInvoiceItemRequest request, InternalInvoice invoice, Product product) {
        InternalInvoiceProduct item = new InternalInvoiceProduct();
        item.setId(new InternalInvoiceProductId());
        item.setInternalInvoice(invoice);
        item.setProduct(product);
        item.setAmount(request.amount());
        return item;
    }

    public InternalInvoiceItemResponse itemToResponse(InternalInvoiceProduct item) {
        return new InternalInvoiceItemResponse(
                item.getProduct() != null ? productMapper.toSummary(item.getProduct()) : null,
                item.getAmount()
        );
    }
}
