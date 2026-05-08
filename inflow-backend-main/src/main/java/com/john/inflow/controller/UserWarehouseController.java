package com.john.inflow.controller;

import com.john.inflow.dto.request.AssignUserWarehouseRequest;
import com.john.inflow.dto.response.UserWarehouseResponse;
import com.john.inflow.service.UserWarehouseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/user-warehouses")
public class UserWarehouseController {

    private final UserWarehouseService userWarehouseService;

    public UserWarehouseController(UserWarehouseService userWarehouseService) {
        this.userWarehouseService = userWarehouseService;
    }

    @PostMapping
    public ResponseEntity<UserWarehouseResponse> assign(@Valid @RequestBody AssignUserWarehouseRequest request) {
        UserWarehouseResponse response = userWarehouseService.assign(request);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .build()
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    public ResponseEntity<List<UserWarehouseResponse>> getAll() {
        return ResponseEntity.ok(userWarehouseService.getAll());
    }
}
