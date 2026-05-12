package com.john.inflow.service.impl;

import com.john.inflow.dto.request.WarehouseRequest;
import com.john.inflow.dto.response.ProductWarehouseResponse;
import com.john.inflow.dto.response.UserResponse;
import com.john.inflow.dto.response.UserSummaryResponse;
import com.john.inflow.dto.response.WarehouseResponse;
import com.john.inflow.dto.response.WarehousesSummaryResponse;
import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.UserWarehouse;
import com.john.inflow.entity.UserWarehouseId;
import com.john.inflow.entity.Warehouse;
import com.john.inflow.entity.User;
import com.john.inflow.exception.DuplicateResourceException;
import com.john.inflow.exception.InvalidOperationException;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.ProductWarehouseMapper;
import com.john.inflow.mapper.UserMapper;
import com.john.inflow.mapper.WarehouseMapper;
import com.john.inflow.repository.ProductWarehouseRepository;
import com.john.inflow.repository.UserRepository;
import com.john.inflow.repository.UserWarehouseRepository;
import com.john.inflow.repository.WarehouseRepository;
import com.john.inflow.service.AuditLogService;
import com.john.inflow.service.WarehouseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class WarehouseServiceImpl implements WarehouseService {

    private static final int LOW_STOCK_THRESHOLD = 10;

    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;
    private final ProductWarehouseRepository productWarehouseRepository;
    private final ProductWarehouseMapper productWarehouseMapper;
    private final UserWarehouseRepository userWarehouseRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AuditLogService auditLogService;

    public WarehouseServiceImpl(WarehouseRepository warehouseRepository, WarehouseMapper warehouseMapper,
                                ProductWarehouseRepository productWarehouseRepository, ProductWarehouseMapper productWarehouseMapper,
                                UserWarehouseRepository userWarehouseRepository, UserRepository userRepository,
                                UserMapper userMapper, AuditLogService auditLogService) {
        this.warehouseRepository = warehouseRepository;
        this.warehouseMapper = warehouseMapper;
        this.productWarehouseRepository = productWarehouseRepository;
        this.productWarehouseMapper = productWarehouseMapper;
        this.userWarehouseRepository = userWarehouseRepository;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public WarehouseResponse create(WarehouseRequest request) {
        if (warehouseRepository.findByAddress(request.address()).isPresent()) {
            throw new DuplicateResourceException("Warehouse", "address", request.address());
        }
        Warehouse warehouse = warehouseMapper.toEntity(request);
        Warehouse saved = warehouseRepository.save(warehouse);
        if (request.managerUserId() != null) {
            assignUser(saved.getId(), request.managerUserId());
        }
        auditLogService.log(null, "CREATE", "WAREHOUSE", saved.getId(), "address=" + saved.getAddress());
        return buildDetailed(saved);
    }

    @Override
    public WarehouseResponse getById(Integer id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", id));
        return buildDetailed(warehouse);
    }

    @Override
    public List<WarehouseResponse> getAll() {
        return warehouseRepository.findAll().stream()
                .map(this::buildDetailed)
                .toList();
    }

    @Override
    @Transactional
    public WarehouseResponse update(Integer id, WarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", id));

        warehouseRepository.findByAddress(request.address()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new DuplicateResourceException("Warehouse", "address", request.address());
            }
        });

        warehouseMapper.updateEntity(request, warehouse);
        Warehouse saved = warehouseRepository.save(warehouse);

        if (request.managerUserId() != null) {
            // Remove previous managers, assign new one.
            userWarehouseRepository.findByWarehouseIdAndLeftAtIsNull(saved.getId()).forEach(uw -> {
                if (!uw.getUser().getId().equals(request.managerUserId())) {
                    uw.setLeftAt(OffsetDateTime.now());
                    userWarehouseRepository.save(uw);
                }
            });
            assignUser(saved.getId(), request.managerUserId());
        }
        auditLogService.log(null, "UPDATE", "WAREHOUSE", saved.getId(), null);
        return buildDetailed(saved);
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", id));
        warehouseRepository.delete(warehouse);
        auditLogService.log(null, "DELETE", "WAREHOUSE", id, "address=" + warehouse.getAddress());
    }

    @Override
    @Transactional
    public void deactivate(Integer id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", id));
        if ("INACTIVE".equals(warehouse.getStatus())) {
            throw new InvalidOperationException("Warehouse already inactive");
        }
        warehouse.setStatus("INACTIVE");
        warehouse.setDeactivatedAt(OffsetDateTime.now());
        warehouseRepository.save(warehouse);
        auditLogService.log(null, "DEACTIVATE", "WAREHOUSE", id, "address=" + warehouse.getAddress());
    }

    @Override
    public WarehousesSummaryResponse getSummary() {
        List<Warehouse> all = warehouseRepository.findAll();
        long total = all.size();
        long central = all.stream().filter(w -> Boolean.TRUE.equals(w.getIsCentral())).count();
        long branch = total - central;
        long activeManagers = all.stream()
                .filter(w -> !"INACTIVE".equals(w.getStatus()))
                .flatMap(w -> userWarehouseRepository.findByWarehouseIdAndLeftAtIsNull(w.getId()).stream())
                .map(uw -> uw.getUser().getId())
                .distinct()
                .count();
        return new WarehousesSummaryResponse(total, central, branch, activeManagers);
    }

    @Override
    public List<ProductWarehouseResponse> getWarehouseProducts(Integer warehouseId) {
        return productWarehouseRepository.findByWarehouseId(warehouseId).stream()
                .map(productWarehouseMapper::toResponse)
                .toList();
    }

    @Override
    public List<UserResponse> getWarehouseUsers(Integer warehouseId) {
        return userWarehouseRepository.findByWarehouseIdAndLeftAtIsNull(warehouseId).stream()
                .map(uw -> userMapper.toResponse(uw.getUser()))
                .toList();
    }

    @Override
    @Transactional
    public void assignUser(Integer warehouseId, Integer userId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", warehouseId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        UserWarehouseId id = new UserWarehouseId(userId, warehouseId);
        UserWarehouse uw = userWarehouseRepository.findById(id).orElse(new UserWarehouse());
        uw.setId(id);
        uw.setUser(user);
        uw.setWarehouse(warehouse);
        uw.setLeftAt(null);
        userWarehouseRepository.save(uw);
        auditLogService.log(null, "ASSIGN_USER", "WAREHOUSE", warehouseId, "userId=" + userId);
    }

    @Override
    @Transactional
    public void removeUser(Integer warehouseId, Integer userId) {
        UserWarehouseId id = new UserWarehouseId(userId, warehouseId);
        userWarehouseRepository.findById(id).ifPresent(uw -> {
            uw.setLeftAt(OffsetDateTime.now());
            userWarehouseRepository.save(uw);
            auditLogService.log(null, "REMOVE_USER", "WAREHOUSE", warehouseId, "userId=" + userId);
        });
    }

    private WarehouseResponse buildDetailed(Warehouse w) {
        List<UserWarehouse> active = userWarehouseRepository.findByWarehouseIdAndLeftAtIsNull(w.getId());
        UserSummaryResponse manager = active.isEmpty() ? null : userMapper.toSummary(active.get(0).getUser());
        List<ProductWarehouse> stock = productWarehouseRepository.findByWarehouseId(w.getId());
        int productsCount = stock.size();
        int totalStock = stock.stream().mapToInt(ProductWarehouse::getAmount).sum();
        int lowStock = (int) stock.stream().filter(pw -> pw.getAmount() <= LOW_STOCK_THRESHOLD).count();
        return warehouseMapper.toResponseDetailed(w, manager, productsCount, totalStock, lowStock);
    }
}
