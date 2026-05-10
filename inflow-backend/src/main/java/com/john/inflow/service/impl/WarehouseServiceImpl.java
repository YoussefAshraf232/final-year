package com.john.inflow.service.impl;

import com.john.inflow.dto.request.WarehouseRequest;
import com.john.inflow.dto.response.ProductWarehouseResponse;
import com.john.inflow.dto.response.UserResponse;
import com.john.inflow.dto.response.WarehouseResponse;
import com.john.inflow.entity.UserWarehouse;
import com.john.inflow.entity.UserWarehouseId;
import com.john.inflow.entity.Warehouse;
import com.john.inflow.entity.User;
import com.john.inflow.exception.DuplicateResourceException;
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
        WarehouseRequest normalized = withDefaults(request);
        Warehouse warehouse = warehouseMapper.toEntity(normalized);
        Warehouse saved = warehouseRepository.save(warehouse);
        auditLogService.log(null, "CREATE", "WAREHOUSE", saved.getId(), "address=" + saved.getAddress());
        return warehouseMapper.toResponse(saved);
    }

    @Override
    public WarehouseResponse getById(Integer id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", id));
        return warehouseMapper.toResponse(warehouse);
    }

    @Override
    public List<WarehouseResponse> getAll() {
        return warehouseRepository.findAll().stream()
                .map(warehouseMapper::toResponse)
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

        WarehouseRequest normalized = withDefaults(request);
        warehouseMapper.updateEntity(normalized, warehouse);
        Warehouse saved = warehouseRepository.save(warehouse);
        auditLogService.log(null, "UPDATE", "WAREHOUSE", saved.getId(), null);
        return warehouseMapper.toResponse(saved);
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

    private WarehouseRequest withDefaults(WarehouseRequest request) {
        Boolean isCentral = request.isCentral() != null ? request.isCentral() : Boolean.FALSE;
        return new WarehouseRequest(request.address(), isCentral);
    }
}
