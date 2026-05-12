package com.john.inflow.service.impl;

import com.john.inflow.dto.request.CreateUserRequest;
import com.john.inflow.dto.request.UpdateUserRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.UserResponse;
import com.john.inflow.entity.Role;
import com.john.inflow.entity.User;
import com.john.inflow.entity.UserWarehouse;
import com.john.inflow.entity.UserWarehouseId;
import com.john.inflow.entity.Warehouse;
import com.john.inflow.exception.DuplicateResourceException;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.UserMapper;
import com.john.inflow.repository.RoleRepository;
import com.john.inflow.repository.UserRepository;
import com.john.inflow.repository.UserWarehouseRepository;
import com.john.inflow.repository.WarehouseRepository;
import com.john.inflow.service.AuditLogService;
import com.john.inflow.service.UserService;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    private final WarehouseRepository warehouseRepository;
    private final UserWarehouseRepository userWarehouseRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserServiceImpl(
            UserRepository userRepository,
            UserMapper userMapper,
            RoleRepository roleRepository,
            WarehouseRepository warehouseRepository,
            UserWarehouseRepository userWarehouseRepository,
            PasswordEncoder passwordEncoder,
            AuditLogService auditLogService
    ) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.roleRepository = roleRepository;
        this.warehouseRepository = warehouseRepository;
        this.userWarehouseRepository = userWarehouseRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new DuplicateResourceException("User", "username", request.username());
        }
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new DuplicateResourceException("User", "email", request.email());
        }
        Role role = roleRepository.findById(request.roleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role", request.roleId()));
        String passwordHash = passwordEncoder.encode(request.password());
        User user = userMapper.toEntity(request, passwordHash, role);
        User saved = userRepository.save(user);
        auditLogService.log(null, "CREATE", "USER", saved.getId(), "username=" + saved.getUsername());
        return userMapper.toResponse(saved);
    }

    @Override
    public UserResponse getById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return userMapper.toResponse(user);
    }

    @Override
    public PageResponse<UserResponse> getAll(int page, int size) {
        return PageResponse.of(userRepository.findAll(PageRequest.of(page, size)).map(userMapper::toResponse));
    }

    @Override
    @Transactional
    public UserResponse update(Integer id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        if (request.username() != null) {
            userRepository.findByUsername(request.username()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new DuplicateResourceException("User", "username", request.username());
                }
            });
            user.setUsername(request.username());
        }
        if (request.email() != null) {
            userRepository.findByEmail(request.email()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new DuplicateResourceException("User", "email", request.email());
                }
            });
        }
        userMapper.updateEntity(request, user);
        if (request.roleId() != null) {
            Role role = roleRepository.findById(request.roleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", request.roleId()));
            user.setRole(role);
        }
        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        User saved = userRepository.save(user);
        if (request.warehouseIds() != null) {
            replaceWarehouseAssignments(saved, request.warehouseIds());
        }
        auditLogService.log(null, "UPDATE", "USER", saved.getId(), null);
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        userRepository.delete(user);
        auditLogService.log(null, "DELETE", "USER", id, "username=" + user.getUsername());
    }

    private void replaceWarehouseAssignments(User user, List<Integer> warehouseIds) {
        Set<Integer> selectedIds = new HashSet<>(warehouseIds);
        List<UserWarehouse> activeAssignments = userWarehouseRepository.findActiveByUserIdWithWarehouse(user.getId());

        activeAssignments.stream()
                .filter(assignment -> !selectedIds.contains(assignment.getWarehouse().getId()))
                .forEach(assignment -> {
                    assignment.setLeftAt(OffsetDateTime.now());
                    userWarehouseRepository.save(assignment);
                });

        Set<Integer> activeIds = new HashSet<>();
        activeAssignments.stream()
                .filter(assignment -> assignment.getLeftAt() == null)
                .map(assignment -> assignment.getWarehouse().getId())
                .forEach(activeIds::add);

        selectedIds.stream()
                .filter(warehouseId -> !activeIds.contains(warehouseId))
                .forEach(warehouseId -> assignWarehouse(user, warehouseId));
    }

    private void assignWarehouse(User user, Integer warehouseId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", warehouseId));
        UserWarehouse assignment = new UserWarehouse();
        assignment.setId(new UserWarehouseId(user.getId(), warehouseId));
        assignment.setUser(user);
        assignment.setWarehouse(warehouse);
        assignment.setLeftAt(null);
        userWarehouseRepository.save(assignment);
        auditLogService.log(null, "ASSIGN_USER", "WAREHOUSE", warehouseId, "userId=" + user.getId());
    }
}
