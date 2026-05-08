package com.john.inflow.service.impl;

import com.john.inflow.dto.request.CreateProductRequest;
import com.john.inflow.dto.request.UpdateProductRequest;
import com.john.inflow.dto.response.ProductResponse;
import com.john.inflow.entity.Category;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.Supplier;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.ProductMapper;
import com.john.inflow.repository.CategoryRepository;
import com.john.inflow.repository.ProductRepository;
import com.john.inflow.repository.SupplierRepository;
import com.john.inflow.service.ProductService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public ProductServiceImpl(ProductRepository productRepository, ProductMapper productMapper, SupplierRepository supplierRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.supplierRepository = supplierRepository;
        this.categoryRepository = categoryRepository;
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
        Supplier supplier = null;
        if (request.supplierId() != null) {
            supplier = supplierRepository.findById(request.supplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", request.supplierId()));
        }
        Set<Category> categories = resolveCategories(request.categoryIds());
        Product product = productMapper.toEntity(request, supplier, categories);
        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    @Override
    public ProductResponse getById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return productMapper.toResponse(product);
    }

    @Override
    public List<ProductResponse> getAll() {
        return productRepository.findAll().stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ProductResponse update(Integer id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        
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
        return productMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        productRepository.delete(product);
    }
}
