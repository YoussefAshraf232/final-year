package com.john.inflow.service.impl;

import com.john.inflow.dto.request.CreateReturnSalesInvoiceRequest;
import com.john.inflow.dto.request.item.ReturnSalesInvoiceItemRequest;
import com.john.inflow.dto.response.ReturnSalesInvoiceResponse;
import com.john.inflow.entity.Customer;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.ProductWarehouseId;
import com.john.inflow.entity.ReturnSalesInvoice;
import com.john.inflow.entity.ReturnSalesInvoiceProduct;
import com.john.inflow.entity.SalesInvoice;
import com.john.inflow.entity.User;
import com.john.inflow.entity.Warehouse;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.ReturnSalesInvoiceMapper;
import com.john.inflow.repository.CustomerRepository;
import com.john.inflow.repository.ProductRepository;
import com.john.inflow.repository.ProductWarehouseRepository;
import com.john.inflow.repository.ReturnSalesInvoiceProductRepository;
import com.john.inflow.repository.ReturnSalesInvoiceRepository;
import com.john.inflow.repository.SalesInvoiceRepository;
import com.john.inflow.repository.UserRepository;
import com.john.inflow.repository.WarehouseRepository;
import com.john.inflow.service.ReturnSalesInvoiceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReturnSalesInvoiceServiceImpl implements ReturnSalesInvoiceService {

    private final ReturnSalesInvoiceRepository returnSalesInvoiceRepository;
    private final ReturnSalesInvoiceProductRepository returnSalesInvoiceProductRepository;
    private final ReturnSalesInvoiceMapper returnSalesInvoiceMapper;
    private final UserRepository userRepository;
    private final SalesInvoiceRepository salesInvoiceRepository;
    private final CustomerRepository customerRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final ProductWarehouseRepository productWarehouseRepository;

    public ReturnSalesInvoiceServiceImpl(
            ReturnSalesInvoiceRepository returnSalesInvoiceRepository,
            ReturnSalesInvoiceProductRepository returnSalesInvoiceProductRepository,
            ReturnSalesInvoiceMapper returnSalesInvoiceMapper,
            UserRepository userRepository,
            SalesInvoiceRepository salesInvoiceRepository,
            CustomerRepository customerRepository,
            WarehouseRepository warehouseRepository,
            ProductRepository productRepository,
            ProductWarehouseRepository productWarehouseRepository) {
        this.returnSalesInvoiceRepository = returnSalesInvoiceRepository;
        this.returnSalesInvoiceProductRepository = returnSalesInvoiceProductRepository;
        this.returnSalesInvoiceMapper = returnSalesInvoiceMapper;
        this.userRepository = userRepository;
        this.salesInvoiceRepository = salesInvoiceRepository;
        this.customerRepository = customerRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.productWarehouseRepository = productWarehouseRepository;
    }

    @Override
    @Transactional
    public ReturnSalesInvoiceResponse create(CreateReturnSalesInvoiceRequest request, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.customerId()));
        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", request.warehouseId()));

        SalesInvoice salesInvoice = null;
        if (request.salesInvoiceId() != null) {
            salesInvoice = salesInvoiceRepository.findById(request.salesInvoiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("SalesInvoice", request.salesInvoiceId()));
        }

        ReturnSalesInvoice invoice = returnSalesInvoiceMapper.toEntity(request, user, salesInvoice, customer, warehouse);
        invoice.setTotalPrice(BigDecimal.ZERO);
        ReturnSalesInvoice savedInvoice = returnSalesInvoiceRepository.save(invoice);

        BigDecimal totalPrice = BigDecimal.ZERO;
        for (ReturnSalesInvoiceItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemRequest.productId()));

            ReturnSalesInvoiceProduct item = returnSalesInvoiceMapper.itemToEntity(itemRequest, savedInvoice, product);
            returnSalesInvoiceProductRepository.save(item);

            addStock(product, warehouse, itemRequest.amount());

            BigDecimal lineTotal = itemRequest.priceAtReturn().multiply(BigDecimal.valueOf(itemRequest.amount()));
            totalPrice = totalPrice.add(lineTotal);
        }

        savedInvoice.setTotalPrice(totalPrice);
        returnSalesInvoiceRepository.save(savedInvoice);

        ReturnSalesInvoice refreshed = returnSalesInvoiceRepository.findById(savedInvoice.getId())
                .orElseThrow(() -> new ResourceNotFoundException("ReturnSalesInvoice", savedInvoice.getId()));
        return returnSalesInvoiceMapper.toResponse(refreshed);
    }

    @Override
    public ReturnSalesInvoiceResponse getById(Integer id) {
        ReturnSalesInvoice invoice = returnSalesInvoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReturnSalesInvoice", id));
        return returnSalesInvoiceMapper.toResponse(invoice);
    }

    @Override
    public List<ReturnSalesInvoiceResponse> getAll() {
        return returnSalesInvoiceRepository.findAll().stream()
                .map(returnSalesInvoiceMapper::toResponse)
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
