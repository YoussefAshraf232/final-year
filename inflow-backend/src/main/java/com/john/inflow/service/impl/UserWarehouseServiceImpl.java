package com.john.inflow.service.impl;

import com.john.inflow.dto.request.AssignUserWarehouseRequest;
import com.john.inflow.dto.response.UserWarehouseResponse;
import com.john.inflow.entity.User;
import com.john.inflow.entity.UserWarehouse;
import com.john.inflow.entity.Warehouse;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.UserWarehouseMapper;
import com.john.inflow.repository.UserRepository;
import com.john.inflow.repository.UserWarehouseRepository;
import com.john.inflow.repository.WarehouseRepository;
import com.john.inflow.service.UserWarehouseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserWarehouseServiceImpl implements UserWarehouseService {

    private final UserWarehouseRepository userWarehouseRepository;
    private final UserWarehouseMapper userWarehouseMapper;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;

    public UserWarehouseServiceImpl(UserWarehouseRepository userWarehouseRepository, UserWarehouseMapper userWarehouseMapper, UserRepository userRepository, WarehouseRepository warehouseRepository) {
        this.userWarehouseRepository = userWarehouseRepository;
        this.userWarehouseMapper = userWarehouseMapper;
        this.userRepository = userRepository;
        this.warehouseRepository = warehouseRepository;
    }

    @Override
    @Transactional
    public UserWarehouseResponse assign(AssignUserWarehouseRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.userId()));
        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", request.warehouseId()));
        UserWarehouse userWarehouse = userWarehouseMapper.toEntity(request, user, warehouse);
        UserWarehouse saved = userWarehouseRepository.save(userWarehouse);
        return userWarehouseMapper.toResponse(saved);
    }

    @Override
    public List<UserWarehouseResponse> getAll() {
        return userWarehouseRepository.findAll().stream()
                .map(userWarehouseMapper::toResponse)
                .toList();
    }
}
