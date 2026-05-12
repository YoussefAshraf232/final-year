package com.john.inflow.service.impl;

import com.john.inflow.dto.request.CreateWarehouseStockRequest;
import com.john.inflow.dto.request.ReviewWarehouseStockRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.WarehouseStockRequestResponse;
import com.john.inflow.dto.response.WarehouseStockRequestSummaryResponse;
import com.john.inflow.entity.*;
import com.john.inflow.exception.InsufficientStockException;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.WarehouseStockRequestMapper;
import com.john.inflow.repository.*;
import com.john.inflow.service.AuditLogService;
import com.john.inflow.service.StockMovementService;
import com.john.inflow.service.WarehouseAccessService;
import com.john.inflow.service.WarehouseStockRequestService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Service
@Transactional(readOnly = true)
public class WarehouseStockRequestServiceImpl implements WarehouseStockRequestService {
    private final WarehouseStockRequestRepository requestRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductWarehouseRepository productWarehouseRepository;
    private final WarehouseStockRequestMapper mapper;
    private final WarehouseAccessService warehouseAccessService;
    private final StockMovementService stockMovementService;
    private final AuditLogService auditLogService;

    public WarehouseStockRequestServiceImpl(
            WarehouseStockRequestRepository requestRepository,
            ProductRepository productRepository,
            WarehouseRepository warehouseRepository,
            ProductWarehouseRepository productWarehouseRepository,
            WarehouseStockRequestMapper mapper,
            WarehouseAccessService warehouseAccessService,
            StockMovementService stockMovementService,
            AuditLogService auditLogService
    ) {
        this.requestRepository = requestRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.productWarehouseRepository = productWarehouseRepository;
        this.mapper = mapper;
        this.warehouseAccessService = warehouseAccessService;
        this.stockMovementService = stockMovementService;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public WarehouseStockRequestResponse create(CreateWarehouseStockRequest request, User actor) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.productId()));
        Warehouse source = warehouseRepository.findById(request.sourceWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", request.sourceWarehouseId()));
        Integer destinationId = warehouseAccessService.canAccessAllWarehouses(actor)
                ? request.destinationWarehouseId()
                : warehouseAccessService.getPrimaryAssignedWarehouse(actor).getId();
        if (destinationId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Destination warehouse is required");
        }
        Warehouse destination = warehouseRepository.findById(destinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", destinationId));
        if (source.getId().equals(destination.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Source and destination warehouses must be different");
        }
        warehouseAccessService.assertCanManageWarehouse(actor, destination.getId());
        WarehouseStockRequest entity = WarehouseStockRequest.builder()
                .product(product)
                .sourceWarehouse(source)
                .destinationWarehouse(destination)
                .requestedQuantity(request.requestedQuantity())
                .status("PENDING")
                .reason(request.reason())
                .notes(request.notes())
                .requesterUser(actor)
                .build();
        WarehouseStockRequest saved = requestRepository.save(entity);
        auditLogService.log(actor, "CREATE", "WAREHOUSE_STOCK_REQUEST", saved.getId(),
                "product=" + product.getId() + ",source=" + source.getId() + ",destination=" + destination.getId());
        return toResponse(saved);
    }

    @Override
    public PageResponse<WarehouseStockRequestResponse> outgoing(User actor, String status, int page, int size) {
        Integer destinationWarehouseId = null;
        Integer requesterUserId = null;
        if (!warehouseAccessService.canAccessAllWarehouses(actor)) {
            destinationWarehouseId = warehouseAccessService.getPrimaryAssignedWarehouse(actor).getId();
            requesterUserId = actor.getId();
        }
        return PageResponse.of(requestRepository
                .search(requesterUserId, null, destinationWarehouseId, normalize(status), PageRequest.of(page, size))
                .map(this::toResponse));
    }

    @Override
    public PageResponse<WarehouseStockRequestResponse> incoming(User actor, String status, int page, int size) {
        Integer sourceWarehouseId = warehouseAccessService.canAccessAllWarehouses(actor)
                ? null
                : warehouseAccessService.getPrimaryAssignedWarehouse(actor).getId();
        return PageResponse.of(requestRepository
                .search(null, sourceWarehouseId, null, normalize(status), PageRequest.of(page, size))
                .map(this::toResponse));
    }

    @Override
    public WarehouseStockRequestResponse getById(Integer id, User actor) {
        WarehouseStockRequest request = require(id);
        assertCanSee(actor, request);
        return toResponse(request);
    }

    @Override
    @Transactional
    public WarehouseStockRequestResponse accept(Integer id, ReviewWarehouseStockRequest request, User actor) {
        WarehouseStockRequest entity = require(id);
        warehouseAccessService.assertCanManageWarehouse(actor, entity.getSourceWarehouse().getId());
        if (!"PENDING".equals(entity.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only pending requests can be accepted");
        }
        int approvedQuantity = request != null && request.approvedQuantity() != null
                ? request.approvedQuantity()
                : entity.getRequestedQuantity();
        if (approvedQuantity <= 0 || approvedQuantity > entity.getRequestedQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Approved quantity must be between 1 and requested quantity");
        }
        ProductWarehouse sourceStock = requireStock(entity.getProduct(), entity.getSourceWarehouse());
        if (sourceStock.getAmount() < approvedQuantity) {
            throw new InsufficientStockException(entity.getProduct().getName(), entity.getSourceWarehouse().getId(), approvedQuantity, sourceStock.getAmount());
        }
        ProductWarehouse destinationStock = getOrCreateStock(entity.getProduct(), entity.getDestinationWarehouse());
        sourceStock.setAmount(sourceStock.getAmount() - approvedQuantity);
        destinationStock.setAmount(destinationStock.getAmount() + approvedQuantity);
        productWarehouseRepository.save(sourceStock);
        productWarehouseRepository.save(destinationStock);
        entity.setApprovedQuantity(approvedQuantity);
        entity.setStatus("COMPLETED");
        entity.setReviewerUser(actor);
        entity.setReviewerComment(request != null ? request.comment() : null);
        entity.setReviewedAt(OffsetDateTime.now());
        entity.setCompletedAt(entity.getReviewedAt());
        requestRepository.save(entity);
        stockMovementService.record(entity.getProduct(), entity.getSourceWarehouse(), "TRANSFER_OUT", -approvedQuantity,
                null, "WAREHOUSE_STOCK_REQUEST", entity.getId(), "Warehouse stock request #" + entity.getId(), actor);
        stockMovementService.record(entity.getProduct(), entity.getDestinationWarehouse(), "TRANSFER_IN", approvedQuantity,
                null, "WAREHOUSE_STOCK_REQUEST", entity.getId(), "Warehouse stock request #" + entity.getId(), actor);
        auditLogService.log(actor, "ACCEPT", "WAREHOUSE_STOCK_REQUEST", entity.getId(), "approvedQuantity=" + approvedQuantity);
        auditLogService.log(actor, "TRANSFER", "STOCK", entity.getProduct().getId() + ":" + entity.getSourceWarehouse().getId() + "->" + entity.getDestinationWarehouse().getId(), "quantity=" + approvedQuantity);
        return toResponse(entity);
    }

    @Override
    @Transactional
    public WarehouseStockRequestResponse reject(Integer id, ReviewWarehouseStockRequest request, User actor) {
        WarehouseStockRequest entity = require(id);
        warehouseAccessService.assertCanManageWarehouse(actor, entity.getSourceWarehouse().getId());
        if (!"PENDING".equals(entity.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only pending requests can be rejected");
        }
        entity.setStatus("REJECTED");
        entity.setReviewerUser(actor);
        entity.setReviewerComment(request != null ? request.comment() : null);
        entity.setReviewedAt(OffsetDateTime.now());
        requestRepository.save(entity);
        auditLogService.log(actor, "REJECT", "WAREHOUSE_STOCK_REQUEST", entity.getId(), null);
        return toResponse(entity);
    }

    @Override
    @Transactional
    public WarehouseStockRequestResponse cancel(Integer id, User actor) {
        WarehouseStockRequest entity = require(id);
        if (!"PENDING".equals(entity.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only pending requests can be cancelled");
        }
        boolean requester = entity.getRequesterUser() != null && entity.getRequesterUser().getId().equals(actor.getId());
        if (!requester && !warehouseAccessService.canAccessAllWarehouses(actor)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot cancel this request");
        }
        entity.setStatus("CANCELLED");
        entity.setCancelledAt(OffsetDateTime.now());
        requestRepository.save(entity);
        auditLogService.log(actor, "CANCEL", "WAREHOUSE_STOCK_REQUEST", entity.getId(), null);
        return toResponse(entity);
    }

    @Override
    public WarehouseStockRequestSummaryResponse summary(User actor) {
        Integer warehouseId = warehouseAccessService.canAccessAllWarehouses(actor)
                ? null
                : warehouseAccessService.getPrimaryAssignedWarehouse(actor).getId();
        long outgoingPending = warehouseAccessService.canAccessAllWarehouses(actor)
                ? requestRepository.countByStatus("PENDING")
                : requestRepository.countByRequesterUserIdAndStatus(actor.getId(), "PENDING");
        long incomingPending = warehouseId == null
                ? requestRepository.countByStatus("PENDING")
                : requestRepository.countBySourceWarehouseIdAndStatus(warehouseId, "PENDING");
        OffsetDateTime start = LocalDate.now().atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime end = start.plusDays(1);
        return new WarehouseStockRequestSummaryResponse(
                outgoingPending,
                incomingPending,
                requestRepository.countCompletedBetween(warehouseId, start, end),
                requestRepository.countRejectedForWarehouse(warehouseId)
        );
    }

    private WarehouseStockRequest require(Integer id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WarehouseStockRequest", id));
    }

    private void assertCanSee(User actor, WarehouseStockRequest request) {
        if (warehouseAccessService.canAccessAllWarehouses(actor)) {
            return;
        }
        Integer assigned = warehouseAccessService.getPrimaryAssignedWarehouse(actor).getId();
        if (!assigned.equals(request.getSourceWarehouse().getId()) && !assigned.equals(request.getDestinationWarehouse().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this request");
        }
    }

    private ProductWarehouse requireStock(Product product, Warehouse warehouse) {
        ProductWarehouseId id = new ProductWarehouseId(product.getId(), warehouse.getId());
        return productWarehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock", product.getId() + ":" + warehouse.getId()));
    }

    private ProductWarehouse getOrCreateStock(Product product, Warehouse warehouse) {
        ProductWarehouseId id = new ProductWarehouseId(product.getId(), warehouse.getId());
        return productWarehouseRepository.findById(id).orElseGet(() -> ProductWarehouse.builder()
                .id(id)
                .product(product)
                .warehouse(warehouse)
                .amount(0)
                .build());
    }

    private WarehouseStockRequestResponse toResponse(WarehouseStockRequest request) {
        return mapper.toResponse(request, currentStock(request.getProduct().getId(), request.getSourceWarehouse().getId()));
    }

    private int currentStock(Integer productId, Integer warehouseId) {
        return productWarehouseRepository.findById(new ProductWarehouseId(productId, warehouseId))
                .map(ProductWarehouse::getAmount)
                .orElse(0);
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim().toUpperCase();
    }
}
