package com.john.inflow.mapper;

import com.john.inflow.dto.request.CreateSalesInvoiceRequest;
import com.john.inflow.dto.request.item.SalesInvoiceItemRequest;
import com.john.inflow.dto.response.SalesInvoiceResponse;
import com.john.inflow.dto.response.item.SalesInvoiceItemResponse;
import com.john.inflow.entity.Customer;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.SalesInvoice;
import com.john.inflow.entity.SalesInvoiceProduct;
import com.john.inflow.entity.SalesInvoiceProductId;
import com.john.inflow.entity.User;
import com.john.inflow.entity.Warehouse;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class SalesInvoiceMapper {

    private final UserMapper userMapper;
    private final CustomerMapper customerMapper;
    private final WarehouseMapper warehouseMapper;
    private final ProductMapper productMapper;

    public SalesInvoiceMapper(UserMapper userMapper, CustomerMapper customerMapper, WarehouseMapper warehouseMapper, ProductMapper productMapper) {
        this.userMapper = userMapper;
        this.customerMapper = customerMapper;
        this.warehouseMapper = warehouseMapper;
        this.productMapper = productMapper;
    }

    public SalesInvoice toEntity(CreateSalesInvoiceRequest request, User user, Customer customer, Warehouse warehouse) {
        SalesInvoice invoice = new SalesInvoice();
        invoice.setUser(user);
        invoice.setCustomer(customer);
        invoice.setWarehouse(warehouse);
        invoice.setDiscount(request.discount());
        return invoice;
    }

    public SalesInvoiceResponse toResponse(SalesInvoice invoice) {
        return new SalesInvoiceResponse(
                invoice.getId(),
                invoice.getUser() != null ? userMapper.toSummary(invoice.getUser()) : null,
                invoice.getCustomer() != null ? customerMapper.toResponse(invoice.getCustomer()) : null,
                invoice.getWarehouse() != null ? warehouseMapper.toSummary(invoice.getWarehouse()) : null,
                invoice.getCreatedAt(),
                invoice.getTotalPrice(),
                invoice.getDiscount(),
                invoice.getSalesInvoiceProducts() != null ? invoice.getSalesInvoiceProducts().stream().map(this::itemToResponse).toList() : Collections.emptyList()
        );
    }

    public SalesInvoiceProduct itemToEntity(SalesInvoiceItemRequest request, SalesInvoice invoice, Product product) {
        SalesInvoiceProduct item = new SalesInvoiceProduct();
        item.setId(new SalesInvoiceProductId());
        item.setSalesInvoice(invoice);
        item.setProduct(product);
        item.setAmount(request.amount());
        item.setSellingPrice(request.sellingPrice());
        return item;
    }

    public SalesInvoiceItemResponse itemToResponse(SalesInvoiceProduct item) {
        return new SalesInvoiceItemResponse(
                item.getProduct() != null ? productMapper.toSummary(item.getProduct()) : null,
                item.getAmount(),
                item.getSellingPrice()
        );
    }
}
