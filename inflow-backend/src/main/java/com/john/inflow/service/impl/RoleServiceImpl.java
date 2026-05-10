package com.john.inflow.service.impl;

import com.john.inflow.dto.request.RoleRequest;
import com.john.inflow.dto.response.RoleResponse;
import com.john.inflow.entity.Role;
import com.john.inflow.exception.DuplicateResourceException;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.RoleMapper;
import com.john.inflow.repository.RoleRepository;
import com.john.inflow.service.AuditLogService;
import com.john.inflow.service.RoleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;
    private final AuditLogService auditLogService;

    public RoleServiceImpl(RoleRepository roleRepository, RoleMapper roleMapper, AuditLogService auditLogService) {
        this.roleRepository = roleRepository;
        this.roleMapper = roleMapper;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public RoleResponse create(RoleRequest request) {
        if (roleRepository.findByName(request.name()).isPresent()) {
            throw new DuplicateResourceException("Role", "name", request.name());
        }
        Role role = roleMapper.toEntity(request);
        Role saved = roleRepository.save(role);
        auditLogService.log(null, "CREATE", "ROLE", saved.getId(), "name=" + saved.getName());
        return roleMapper.toResponse(saved);
    }

    @Override
    public RoleResponse getById(Integer id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", id));
        return roleMapper.toResponse(role);
    }

    @Override
    public List<RoleResponse> getAll() {
        return roleRepository.findAll().stream()
                .map(roleMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public RoleResponse update(Integer id, RoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", id));

        roleRepository.findByName(request.name()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new DuplicateResourceException("Role", "name", request.name());
            }
        });

        roleMapper.updateEntity(request, role);
        Role saved = roleRepository.save(role);
        auditLogService.log(null, "UPDATE", "ROLE", saved.getId(), "name=" + saved.getName());
        return roleMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", id));
        roleRepository.delete(role);
        auditLogService.log(null, "DELETE", "ROLE", id, "name=" + role.getName());
    }
}
