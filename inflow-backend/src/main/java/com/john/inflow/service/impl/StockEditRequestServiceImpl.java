package com.john.inflow.service.impl;

import com.john.inflow.dto.request.CreateStockEditRequest;
import com.john.inflow.dto.request.ReviewStockEditRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.StockEditRequestResponse;
import com.john.inflow.dto.response.StockEditRequestSummaryResponse;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.ProductWarehouseId;
import com.john.inflow.entity.StockEditRequest;
import com.john.inflow.entity.User;
import com.john.inflow.entity.Warehouse;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.StockEditRequestMapper;
import com.john.inflow.repository.ProductRepository;
import com.john.inflow.repository.ProductWarehouseRepository;
import com.john.inflow.repository.StockEditRequestRepository;
import com.john.inflow.repository.UserRepository;
import com.john.inflow.repository.WarehouseRepository;
import com.john.inflow.service.AuditLogService;
import com.john.inflow.service.StockEditRequestService;
import com.john.inflow.service.StockMovementService;
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
public class StockEditRequestServiceImpl implements StockEditRequestService {

    private final StockEditRequestRepository requestRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;
    private final ProductWarehouseRepository productWarehouseRepository;
    private final StockMovementService stockMovementService;
    private final AuditLogService auditLogService;
    private final StockEditRequestMapper mapper;

    public StockEditRequestServiceImpl(
            StockEditRequestRepository requestRepository,
            ProductRepository productRepository,
            WarehouseRepository warehouseRepository,
            UserRepository userRepository,
            ProductWarehouseRepository productWarehouseRepository,
            StockMovementService stockMovementService,
            AuditLogService auditLogService,
            StockEditRequestMapper mapper
    ) {
        this.requestRepository = requestRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.userRepository = userRepository;
        this.productWarehouseRepository = productWarehouseRepository;
        this.stockMovementService = stockMovementService;
        this.auditLogService = auditLogService;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public StockEditRequestResponse create(CreateStockEditRequest request, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.productId()));
        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", request.warehouseId()));

        int currentQty = currentStockOf(product.getId(), warehouse.getId());
        int requestedQty = request.requestedQuantity();
        if (requestedQty < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Requested quantity cannot be negative");
        }
        int diff = requestedQty - currentQty;
        if (diff == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Requested quantity must be different from current quantity");
        }

        StockEditRequest r = StockEditRequest.builder()
                .product(product)
                .warehouse(warehouse)
                .currentQuantity(currentQty)
                .requestedQuantity(requestedQty)
                .differenceQuantity(diff)
                .reason(request.reason())
                .notes(request.notes())
                .status("PENDING")
                .requestedByUser(user)
                .build();
        StockEditRequest saved = requestRepository.save(r);
        auditLogService.log(user, "CREATE", "STOCK_EDIT_REQUEST", saved.getId(),
                "product=" + product.getId() + ",warehouse=" + warehouse.getId() + ",diff=" + diff);
        return mapper.toResponse(saved);
    }

    @Override
    public StockEditRequestResponse getById(Integer id) {
        return mapper.toResponse(require(id));
    }

    @Override
    public PageResponse<StockEditRequestResponse> search(
            String search,
            String status,
            Integer productId,
            Integer warehouseId,
            OffsetDateTime dateFrom,
            OffsetDateTime dateTo,
            int page,
            int size
    ) {
        return PageResponse.of(
                requestRepository.search(
                        normalize(search),
                        normalize(status),
                        productId,
                        warehouseId,
                        dateFrom,
                        dateTo,
                        PageRequest.of(page, size)
                ).map(mapper::toResponse)
        );
    }

    @Override
    @Transactional
    public StockEditRequestResponse approve(Integer id, ReviewStockEditRequest request, Integer userId) {
        StockEditRequest r = require(id);
        User reviewer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (!"PENDING".equals(r.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only pending requests can be approved");
        }

        int currentQty = currentStockOf(r.getProduct().getId(), r.getWarehouse().getId());
        if (currentQty != r.getCurrentQuantity()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Current stock changed after this request was created. Please create a new request.");
        }

        int newQty = r.getRequestedQuantity();
        int delta = newQty - currentQty;
        applyStock(r.getProduct(), r.getWarehouse(), newQty);
        stockMovementService.record(
                r.getProduct(),
                r.getWarehouse(),
                "STOCK_ADJUSTMENT",
                delta,
                null,
                "STOCK_EDIT_REQUEST",
                r.getId(),
                buildMovementNote(r, request),
                reviewer
        );

        r.setStatus("APPROVED");
        r.setReviewedByUser(reviewer);
        r.setReviewedAt(OffsetDateTime.now());
        if (request != null && request.comment() != null) {
            r.setReviewComment(request.comment());
        }
        requestRepository.save(r);
        auditLogService.log(reviewer, "APPROVE", "STOCK_EDIT_REQUEST", r.getId(), "delta=" + delta);
        return mapper.toResponse(r);
    }

    @Override
    @Transactional
    public StockEditRequestResponse reject(Integer id, ReviewStockEditRequest request, Integer userId) {
        StockEditRequest r = require(id);
        User reviewer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (!"PENDING".equals(r.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only pending requests can be rejected");
        }
        r.setStatus("REJECTED");
        r.setReviewedByUser(reviewer);
        r.setReviewedAt(OffsetDateTime.now());
        if (request != null && request.comment() != null) {
            r.setReviewComment(request.comment());
        }
        requestRepository.save(r);
        auditLogService.log(reviewer, "REJECT", "STOCK_EDIT_REQUEST", r.getId(), null);
        return mapper.toResponse(r);
    }

    @Override
    @Transactional
    public StockEditRequestResponse cancel(Integer id, Integer userId) {
        StockEditRequest r = require(id);
        User actor = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (!"PENDING".equals(r.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only pending requests can be cancelled");
        }
        boolean isOwner = r.getRequestedByUser() != null && r.getRequestedByUser().getId().equals(userId);
        boolean isReviewer = actor.getRole() != null
                && (
                    "SYSTEM_ADMIN".equals(actor.getRole().getName())
                    || "OPERATIONAL_MANAGER".equals(actor.getRole().getName())
                    || "ADMIN".equals(actor.getRole().getName())
                    || "MANAGER".equals(actor.getRole().getName())
                );
        if (!isOwner && !isReviewer) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot cancel this request");
        }
        r.setStatus("CANCELLED");
        r.setCancelledAt(OffsetDateTime.now());
        requestRepository.save(r);
        auditLogService.log(actor, "CANCEL", "STOCK_EDIT_REQUEST", r.getId(), null);
        return mapper.toResponse(r);
    }

    @Override
    @Transactional
    public StockEditRequestResponse addComment(Integer id, ReviewStockEditRequest request, Integer userId) {
        StockEditRequest r = require(id);
        User actor = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (request == null || request.comment() == null || request.comment().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment is required");
        }
        r.setReviewComment(request.comment());
        requestRepository.save(r);
        auditLogService.log(actor, "COMMENT", "STOCK_EDIT_REQUEST", r.getId(), null);
        return mapper.toResponse(r);
    }

    @Override
    public StockEditRequestSummaryResponse getSummary() {
        OffsetDateTime startOfDay = LocalDate.now().atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime endOfDay = startOfDay.plusDays(1);
        OffsetDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime startOfNextMonth = startOfMonth.plusMonths(1);
        long pending = requestRepository.countByStatus("PENDING");
        long approvedToday = requestRepository.countApprovedBetween(startOfDay, endOfDay);
        long rejected = requestRepository.countByStatus("REJECTED");
        long approvedThisMonth = requestRepository.countApprovedBetween(startOfMonth, startOfNextMonth);
        return new StockEditRequestSummaryResponse(pending, approvedToday, rejected, approvedThisMonth);
    }

    private StockEditRequest require(Integer id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockEditRequest", id));
    }

    private int currentStockOf(Integer productId, Integer warehouseId) {
        return productWarehouseRepository
                .findById(new ProductWarehouseId(productId, warehouseId))
                .map(ProductWarehouse::getAmount)
                .orElse(0);
    }

    private void applyStock(Product product, Warehouse warehouse, int newAmount) {
        ProductWarehouseId pwId = new ProductWarehouseId(product.getId(), warehouse.getId());
        ProductWarehouse pw = productWarehouseRepository.findById(pwId).orElse(null);
        if (pw == null) {
            pw = new ProductWarehouse();
            pw.setId(pwId);
            pw.setProduct(product);
            pw.setWarehouse(warehouse);
        }
        pw.setAmount(newAmount);
        productWarehouseRepository.save(pw);
    }

    private String buildMovementNote(StockEditRequest r, ReviewStockEditRequest request) {
        StringBuilder sb = new StringBuilder("Stock edit request #").append(r.getId());
        if (r.getReason() != null) sb.append(" - ").append(r.getReason());
        if (request != null && request.comment() != null && !request.comment().isBlank()) {
            sb.append(" | ").append(request.comment());
        }
        return sb.toString();
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
