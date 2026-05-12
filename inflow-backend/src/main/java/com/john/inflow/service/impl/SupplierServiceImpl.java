package com.john.inflow.service.impl;

import com.john.inflow.dto.request.SupplierRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.SupplierDetailResponse;
import com.john.inflow.dto.response.SupplierPurchaseOrderResponse;
import com.john.inflow.dto.response.SupplierResponse;
import com.john.inflow.dto.response.SupplierStatsResponse;
import com.john.inflow.entity.PurchaseInvoice;
import com.john.inflow.entity.Supplier;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.SupplierMapper;
import com.john.inflow.repository.PurchaseInvoiceRepository;
import com.john.inflow.repository.SupplierRepository;
import com.john.inflow.service.AuditLogService;
import com.john.inflow.service.SupplierService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;
    private final PurchaseInvoiceRepository purchaseInvoiceRepository;
    private final AuditLogService auditLogService;

    public SupplierServiceImpl(SupplierRepository supplierRepository,
                               SupplierMapper supplierMapper,
                               PurchaseInvoiceRepository purchaseInvoiceRepository,
                               AuditLogService auditLogService) {
        this.supplierRepository = supplierRepository;
        this.supplierMapper = supplierMapper;
        this.purchaseInvoiceRepository = purchaseInvoiceRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public SupplierResponse create(SupplierRequest request) {
        Supplier supplier = supplierMapper.toEntity(request);
        Supplier saved = supplierRepository.save(supplier);
        auditLogService.log(null, "CREATE", "SUPPLIER", saved.getId(), "name=" + saved.getName());
        return supplierMapper.toResponse(saved, 0L);
    }

    @Override
    public SupplierResponse getById(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
        long products = supplierRepository.countProductsForSupplier(id);
        return supplierMapper.toResponse(supplier, products);
    }

    @Override
    public SupplierDetailResponse getDetail(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
        long productsCount = supplierRepository.countProductsForSupplier(id);
        SupplierResponse base = supplierMapper.toResponse(supplier, productsCount);
        long ordersCount = purchaseInvoiceRepository.countBySupplierId(id);
        List<PurchaseInvoice> recent = purchaseInvoiceRepository.findRecentBySupplier(id, PageRequest.of(0, 5));
        List<SupplierPurchaseOrderResponse> recentDto = recent.stream()
                .map(pi -> new SupplierPurchaseOrderResponse(
                        pi.getId(),
                        pi.getCreatedAt(),
                        pi.getTotalPrice(),
                        pi.getReceiptStatus()
                ))
                .toList();
        return new SupplierDetailResponse(base, ordersCount, recentDto);
    }

    @Override
    public List<SupplierResponse> getAll() {
        return supplierRepository.findAll().stream()
                .map(s -> supplierMapper.toResponse(s, supplierRepository.countProductsForSupplier(s.getId())))
                .toList();
    }

    @Override
    public PageResponse<SupplierResponse> search(String search, String status, String hasProducts, int page, int size) {
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();
        String normalizedStatus = (status == null || status.isBlank()) ? null : status;
        String normalizedHasProducts = (hasProducts == null || hasProducts.isBlank()) ? null : hasProducts;
        Page<Supplier> result = supplierRepository.search(normalizedSearch, normalizedStatus, normalizedHasProducts,
                PageRequest.of(page, size));
        return PageResponse.of(result.map(s -> supplierMapper.toResponse(
                s, supplierRepository.countProductsForSupplier(s.getId())
        )));
    }

    @Override
    @Transactional
    public SupplierResponse update(Integer id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
        supplierMapper.updateEntity(request, supplier);
        Supplier saved = supplierRepository.save(supplier);
        auditLogService.log(null, "UPDATE", "SUPPLIER", saved.getId(), null);
        long products = supplierRepository.countProductsForSupplier(id);
        return supplierMapper.toResponse(saved, products);
    }

    @Override
    @Transactional
    public void deactivate(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
        supplier.setStatus("INACTIVE");
        supplier.setDeactivatedAt(OffsetDateTime.now());
        supplierRepository.save(supplier);
        auditLogService.log(null, "DEACTIVATE", "SUPPLIER", id, "name=" + supplier.getName());
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
        supplierRepository.delete(supplier);
        auditLogService.log(null, "DELETE", "SUPPLIER", id, "name=" + supplier.getName());
    }

    @Override
    public SupplierStatsResponse stats() {
        long total = supplierRepository.count();
        long active = supplierRepository.countByStatus("ACTIVE");
        long linked = supplierRepository.countLinkedProducts();
        OffsetDateTime monthStart = OffsetDateTime.now(ZoneOffset.UTC)
                .truncatedTo(ChronoUnit.DAYS)
                .withDayOfMonth(1);
        OffsetDateTime nextMonth = monthStart.plusMonths(1);
        long posThisMonth = purchaseInvoiceRepository.countBetween(monthStart, nextMonth);
        return new SupplierStatsResponse(total, active, linked, posThisMonth);
    }
}
