package com.john.inflow.service.impl;

import com.john.inflow.dto.request.WarehouseRequest;
import com.john.inflow.dto.response.WarehouseResponse;
import com.john.inflow.entity.Warehouse;
import com.john.inflow.exception.DuplicateResourceException;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.WarehouseMapper;
import com.john.inflow.repository.WarehouseRepository;
import com.john.inflow.service.WarehouseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;

    public WarehouseServiceImpl(WarehouseRepository warehouseRepository, WarehouseMapper warehouseMapper) {
        this.warehouseRepository = warehouseRepository;
        this.warehouseMapper = warehouseMapper;
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
        return warehouseMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", id));
        warehouseRepository.delete(warehouse);
    }

    private WarehouseRequest withDefaults(WarehouseRequest request) {
        Boolean isCentral = request.isCentral() != null ? request.isCentral() : Boolean.FALSE;
        return new WarehouseRequest(request.address(), isCentral);
    }
}
