package com.john.inflow.mapper;

import com.john.inflow.dto.request.CreateReturnSalesInvoiceRequest;
import com.john.inflow.dto.request.item.ReturnSalesInvoiceItemRequest;
import com.john.inflow.dto.response.ReturnSalesInvoiceResponse;
import com.john.inflow.dto.response.item.ReturnSalesInvoiceItemResponse;
import com.john.inflow.entity.Customer;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.ReturnSalesInvoice;
import com.john.inflow.entity.ReturnSalesInvoiceProduct;
import com.john.inflow.entity.ReturnSalesInvoiceProductId;
import com.john.inflow.entity.SalesInvoice;
import com.john.inflow.entity.User;
import com.john.inflow.entity.Warehouse;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class ReturnSalesInvoiceMapper {

    private final UserMapper userMapper;
    private final CustomerMapper customerMapper;
    private final WarehouseMapper warehouseMapper;
    private final ProductMapper productMapper;

    public ReturnSalesInvoiceMapper(UserMapper userMapper, CustomerMapper customerMapper, WarehouseMapper warehouseMapper, ProductMapper productMapper) {
        this.userMapper = userMapper;
        this.customerMapper = customerMapper;
        this.warehouseMapper = warehouseMapper;
        this.productMapper = productMapper;
    }

    public ReturnSalesInvoice toEntity(CreateReturnSalesInvoiceRequest request, User user, SalesInvoice salesInvoice, Customer customer, Warehouse warehouse) {
        ReturnSalesInvoice invoice = new ReturnSalesInvoice();
        invoice.setUser(user);
        invoice.setSalesInvoice(salesInvoice);
        invoice.setCustomer(customer);
        invoice.setWarehouse(warehouse);
        invoice.setReason(request.reason());
        return invoice;
    }

    public ReturnSalesInvoiceResponse toResponse(ReturnSalesInvoice invoice) {
        return new ReturnSalesInvoiceResponse(
                invoice.getId(),
                invoice.getUser() != null ? userMapper.toSummary(invoice.getUser()) : null,
                invoice.getSalesInvoice() != null ? invoice.getSalesInvoice().getId() : null,
                invoice.getCustomer() != null ? customerMapper.toResponse(invoice.getCustomer()) : null,
                invoice.getWarehouse() != null ? warehouseMapper.toSummary(invoice.getWarehouse()) : null,
                invoice.getReturnedAt(),
                invoice.getTotalPrice(),
                invoice.getReason(),
                invoice.getReturnSalesInvoiceProducts() != null ? invoice.getReturnSalesInvoiceProducts().stream().map(this::itemToResponse).toList() : Collections.emptyList()
        );
    }

    public ReturnSalesInvoiceProduct itemToEntity(ReturnSalesInvoiceItemRequest request, ReturnSalesInvoice invoice, Product product) {
        ReturnSalesInvoiceProduct item = new ReturnSalesInvoiceProduct();
        item.setId(new ReturnSalesInvoiceProductId());
        item.setReturnSalesInvoice(invoice);
        item.setProduct(product);
        item.setAmount(request.amount());
        item.setPriceAtReturn(request.priceAtReturn());
        return item;
    }

    public ReturnSalesInvoiceItemResponse itemToResponse(ReturnSalesInvoiceProduct item) {
        return new ReturnSalesInvoiceItemResponse(
                item.getProduct() != null ? productMapper.toSummary(item.getProduct()) : null,
                item.getAmount(),
                item.getPriceAtReturn()
        );
    }
}
