package com.john.inflow.service.impl;

import com.john.inflow.dto.request.CreateProductRequest;
import com.john.inflow.dto.request.UpdateProductRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.ProductDetailResponse;
import com.john.inflow.dto.response.ProductResponse;
import com.john.inflow.dto.response.ProductStatsResponse;
import com.john.inflow.dto.response.ProductStockByWarehouseResponse;
import com.john.inflow.entity.Category;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.Supplier;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.ProductMapper;
import com.john.inflow.repository.CategoryRepository;
import com.john.inflow.repository.ProductRepository;
import com.john.inflow.repository.ProductWarehouseRepository;
import com.john.inflow.repository.SupplierRepository;
import com.john.inflow.service.AuditLogService;
import com.john.inflow.service.ProductService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final SupplierRepository supplierRepository;
    private final CategoryRepository categoryRepository;
    private final ProductWarehouseRepository productWarehouseRepository;
    private final AuditLogService auditLogService;

    public ProductServiceImpl(ProductRepository productRepository,
                              ProductMapper productMapper,
                              SupplierRepository supplierRepository,
                              CategoryRepository categoryRepository,
                              ProductWarehouseRepository productWarehouseRepository,
                              AuditLogService auditLogService) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.supplierRepository = supplierRepository;
        this.categoryRepository = categoryRepository;
        this.productWarehouseRepository = productWarehouseRepository;
        this.auditLogService = auditLogService;
    }

    private Set<Category> resolveCategories(List<Integer> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return new HashSet<>();
        }
        Set<Category> categories = new HashSet<>();
        for (Integer categoryId : categoryIds) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));
            categories.add(category);
        }
        return categories;
    }

    @Override
    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        if (productRepository.existsBySku(request.sku())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already in use: " + request.sku());
        }
        Supplier supplier = null;
        if (request.supplierId() != null) {
            supplier = supplierRepository.findById(request.supplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", request.supplierId()));
        }
        Set<Category> categories = resolveCategories(request.categoryIds());
        Product product = productMapper.toEntity(request, supplier, categories);
        Product saved;
        try {
            saved = productRepository.save(product);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already in use: " + request.sku());
        }
        auditLogService.log(null, "CREATE", "PRODUCT", saved.getId(), "name=" + saved.getName());
        return productMapper.toResponse(saved, 0L);
    }

    @Override
    public ProductResponse getById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        long total = productRepository.totalStockForProduct(id);
        return productMapper.toResponse(product, total);
    }

    @Override
    public ProductDetailResponse getDetail(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        long total = productRepository.totalStockForProduct(id);
        ProductResponse productResponse = productMapper.toResponse(product, total);

        List<ProductStockByWarehouseResponse> stockRows = new ArrayList<>();
        if (product.getProductWarehouses() != null) {
            for (ProductWarehouse pw : product.getProductWarehouses()) {
                long amount = pw.getAmount() != null ? pw.getAmount() : 0L;
                String status;
                int level = product.getReorderLevel() != null ? product.getReorderLevel() : 0;
                if (amount <= 0) status = "OUT_OF_STOCK";
                else if (amount <= level) status = "LOW_STOCK";
                else status = "IN_STOCK";
                stockRows.add(new ProductStockByWarehouseResponse(
                        pw.getWarehouse().getId(),
                        pw.getWarehouse().getAddress(),
                        amount,
                        status
                ));
            }
        }
        return new ProductDetailResponse(productResponse, stockRows);
    }

    @Override
    public PageResponse<ProductResponse> search(String search, Integer categoryId, Integer supplierId,
                                                String stockStatus, String status, int page, int size) {
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();
        Page<Product> resultPage = productRepository.search(
                normalizedSearch, categoryId, supplierId,
                blankToNull(stockStatus), blankToNull(status),
                PageRequest.of(page, size)
        );
        return PageResponse.of(resultPage.map(p -> productMapper.toResponse(
                p, productRepository.totalStockForProduct(p.getId())
        )));
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    @Override
    @Transactional
    public ProductResponse update(Integer id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        if (request.sku() != null && !request.sku().equals(product.getSku())
                && productRepository.existsBySku(request.sku())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already in use: " + request.sku());
        }

        productMapper.updateEntity(request, product);

        if (request.supplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.supplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", request.supplierId()));
            product.setSupplier(supplier);
        }

        if (request.categoryIds() != null) {
            product.setCategories(resolveCategories(request.categoryIds()));
        }

        Product saved = productRepository.save(product);
        auditLogService.log(null, "UPDATE", "PRODUCT", saved.getId(), null);
        long total = productRepository.totalStockForProduct(saved.getId());
        return productMapper.toResponse(saved, total);
    }

    @Override
    @Transactional
    public void deactivate(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        product.setStatus("INACTIVE");
        product.setDeactivatedAt(OffsetDateTime.now());
        productRepository.save(product);
        auditLogService.log(null, "DEACTIVATE", "PRODUCT", id, "name=" + product.getName());
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        productRepository.delete(product);
        auditLogService.log(null, "DELETE", "PRODUCT", id, "name=" + product.getName());
    }

    @Override
    public ProductStatsResponse stats() {
        long total = productRepository.count();
        long active = productRepository.countByStatus("ACTIVE");
        long low = productRepository.countLowStock();
        long out = productRepository.countOutOfStock();
        return new ProductStatsResponse(total, active, low, out);
    }
}
